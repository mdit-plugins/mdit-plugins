import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import MarkdownIt from "markdown-it";
import type { MarkdownItOptions } from "markdown-it";

import type { CompareRenderer, PluginFunction, PluginModule } from "./types.ts";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

/**
 * Load a built plugin package from the current working tree
 *
 * The benchmark and comparison run against `dist` so that both sides are measured as shipped code.
 *
 * @param plugin - Package directory under `packages/`, e.g. `plugin-attrs`
 * @returns The module namespace of the built package
 */
export const loadCurrent = async (plugin: string): Promise<PluginModule> => {
  const entry = path.join(ROOT, "packages", plugin, "dist", "index.js");

  if (!existsSync(entry)) {
    throw new Error(
      `[compare] ${entry} is missing. Run \`pnpm run build\` before running the comparison.`,
    );
  }

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
 * Get the installed version of a reference package
 *
 * @param packageName - Npm package name, subpath exports are allowed
 * @returns The installed version, or `"unknown"` when the manifest cannot be read
 */
export const getReferenceVersion = (packageName: string): string => {
  const rootName = packageName.startsWith("@")
    ? packageName.split("/").slice(0, 2).join("/")
    : (packageName.split("/")[0] ?? packageName);
  const manifestPath = path.join(ROOT, "node_modules", rootName, "package.json");

  if (!existsSync(manifestPath)) return "unknown";

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { version?: unknown };

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
export const createRenderer = (
  module: PluginModule,
  exportName = "default",
  options?: unknown,
  mdOptions?: MarkdownItOptions,
): CompareRenderer => {
  const plugin = resolvePlugin(module, exportName);
  const md = new MarkdownIt(mdOptions ?? {});

  md.use(plugin, options);

  return (markdown) => md.render(markdown);
};
