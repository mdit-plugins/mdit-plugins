import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance, MarkdownItOptions } from "markdown-it";

import type { CompareRenderer, PluginFunction, PluginModule } from "./types.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

/** The fields of a package manifest that are used to resolve the package entry */
interface PackageManifestLike {
  /** Export map of the package */
  readonly exports?: unknown;
  /** Legacy main field of the package */
  readonly main?: unknown;
}

/**
 * Pick the runtime entry from a package export target
 *
 * Conditions are resolved in the same order Node uses for an ESM import: `node`, `import`, then
 * `default`. Type-only conditions and non-`dist` targets are ignored.
 *
 * @param value - Export target or condition map
 * @returns The relative entry path, or an empty string when the target has no runtime entry
 */
const pickExportTarget = (value: unknown): string => {
  if (typeof value === "string") {
    if (value.startsWith("./dist/")) return value;

    return "";
  }

  if (value == null || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;

  for (const condition of ["node", "import", "default"]) {
    const target = pickExportTarget(record[condition]);

    if (target) return target;
  }

  for (const [condition, target] of Object.entries(record)) {
    if (condition === "types") continue;

    const picked = pickExportTarget(target);

    if (picked) return picked;
  }

  return "";
};

/**
 * Resolve the built entry of a package
 *
 * Most packages build `dist/index.js`, but platform-specific packages (e.g. `plugin-plantuml`,
 * `plugin-include`, `plugin-snippet`) build `dist/node.js` / `dist/browser.js` and declare them in
 * the `exports` map, so the entry is resolved from the manifest first and only then from the
 * conventional file names.
 *
 * @param plugin - Package directory under `packages/`, e.g. `plugin-attrs`
 * @returns The absolute path of the built entry
 */
const resolveCurrentEntry = (plugin: string): string => {
  const packageDir = path.join(ROOT, "packages", plugin);
  const manifestPath = path.join(packageDir, "package.json");

  if (!existsSync(manifestPath)) throw new Error(`[compare] ${manifestPath} is missing.`);

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as PackageManifestLike;
  const exportEntry =
    manifest.exports != null && typeof manifest.exports === "object"
      ? (manifest.exports as Record<string, unknown>)["."]
      : null;
  const target = pickExportTarget(exportEntry);

  if (target) {
    const entry = path.join(packageDir, target);

    if (existsSync(entry)) return entry;
  }

  for (const fallback of ["dist/index.js", "dist/node.js"]) {
    const entry = path.join(packageDir, fallback);

    if (existsSync(entry)) return entry;
  }

  throw new Error(
    `[compare] cannot resolve the entry of ${plugin}. Run \`pnpm run build\` before running the comparison.`,
  );
};

/**
 * Load a built plugin package from the current working tree
 *
 * The benchmark and comparison run against `dist` so that both sides are measured as shipped code.
 *
 * @param plugin - Package directory under `packages/`, e.g. `plugin-attrs`
 * @returns The module namespace of the built package
 */
export const loadCurrent = async (plugin: string): Promise<PluginModule> => {
  const entry = resolveCurrentEntry(plugin);

  return (await import(/* @vite-ignore */ pathToFileURL(entry).href)) as PluginModule;
};

/**
 * Load a reference plugin package from the installed `node_modules`
 *
 * @param packageName - Npm package name, subpath exports are allowed
 * @returns The module namespace of the reference package
 */
export const loadReference = async (packageName: string): Promise<PluginModule> =>
  (await import(/* @vite-ignore */ packageName)) as PluginModule;

/**
 * Resolve the installed directory of a reference package
 *
 * The reference packages are dependencies of the compare package, so the directory is resolved from
 * the module resolver instead of assuming a hoisted `node_modules` layout.
 *
 * @param rootName - Root npm package name, e.g. `markdown-it-attrs`
 * @returns Absolute directory of the installed package, or `null` when it cannot be resolved
 */
const resolveReferencePackageDirectory = (rootName: string): string | null => {
  let directory: string;

  try {
    directory = path.dirname(fileURLToPath(import.meta.resolve(rootName)));
  } catch {
    return null;
  }

  while (true) {
    const manifestPath = path.join(directory, "package.json");

    if (existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { name?: unknown };

        if (manifest.name === rootName) return directory;
      } catch {
        // Keep walking up when the manifest is unreadable.
      }
    }

    const parent = path.dirname(directory);

    if (parent === directory) return null;

    directory = parent;
  }
};

/**
 * Get the installed version of a reference package
 *
 * @param packageName - Npm package name, subpath exports are allowed
 * @returns The installed version, or `"unknown"` when the manifest cannot be read
 */
export const getReferenceVersion = (packageName: string): string => {
  const rootName = packageName.startsWith("@")
    ? packageName.split("/").slice(0, 2).join("/")
    : (packageName.split("/")[0] ?? packageName);
  const directory = resolveReferencePackageDirectory(rootName);

  if (!directory) return "unknown";

  try {
    const manifest = JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8")) as {
      version?: unknown;
    };

    return typeof manifest.version === "string" ? manifest.version : "unknown";
  } catch {
    return "unknown";
  }
};

/**
 * Resolve a plugin function from a module namespace
 *
 * @param module - Loaded module namespace
 * @param exportName - Export name, defaults to the default export
 * @returns The plugin function
 */
export const resolvePlugin = (module: PluginModule, exportName = "default"): PluginFunction => {
  const candidate = exportName === "default" ? (module.default ?? module) : module[exportName];

  if (typeof candidate !== "function")
    throw new TypeError(`[compare] "${exportName}" is not a function in the loaded module.`);

  return candidate as PluginFunction;
};

/**
 * Create a renderer from a plugin module
 *
 * @param module - Loaded module namespace
 * @param exportName - Plugin export name, defaults to the default export
 * @param options - Options passed to the plugin
 * @param mdOptions - Markdown-it constructor options
 * @returns A renderer that turns markdown into HTML
 */
export const createMarkdownIt = (
  module: PluginModule,
  exportName = "default",
  options?: unknown,
  mdOptions?: MarkdownItOptions,
): MarkdownItInstance => {
  const plugin = resolvePlugin(module, exportName);
  const md = new MarkdownIt(mdOptions ?? {});

  md.use(plugin, options);

  return md;
};

/**
 * Create a renderer for one side of a comparison
 *
 * @param module - Loaded plugin module
 * @param exportName - Export name of the plugin, defaults to `"default"`
 * @param options - Options passed to the plugin
 * @param mdOptions - Markdown-it options
 * @returns A renderer that turns markdown into HTML
 */
export const createRenderer = (
  module: PluginModule,
  exportName = "default",
  options?: unknown,
  mdOptions?: MarkdownItOptions,
): CompareRenderer => {
  const md = createMarkdownIt(module, exportName, options, mdOptions);

  return (markdown) => md.render(markdown);
};
