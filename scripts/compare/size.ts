import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import type { ComparisonResult } from "./types.ts";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const PACKAGES_DIR = path.join(ROOT, "packages");

/** Directory that stores the committed comparison data */
export const RESULTS_DIR: string = path.join(import.meta.dirname, "results");

/** Committed size data used by the report generators */
export const SIZES_FILE: string = path.join(RESULTS_DIR, "sizes.json");

/** Entry fallbacks of a current package, in resolution order */
const CURRENT_ENTRY_FALLBACKS = ["dist/index.js", "dist/node.js"] as const;

/** Files npm always publishes, in addition to the `files` field of the package manifest */
const NPM_ALWAYS_INCLUDED = /^(?:package\.json|README(?:\.[^/]*)?|LICEN[CS]E(?:\.[^/]*)?)$/iu;

/** Computed size of one side of a package comparison */
export interface PackageSizeSide {
  /** Package name of this side */
  readonly name: string;
  /** Installed version of this side */
  readonly version: string;
  /** Unpacked size of the published files in bytes */
  readonly unpackedBytes: number;
  /** Number of published files */
  readonly fileCount: number;
  /** ESM entry, relative to the package directory */
  readonly entry: string;
  /** Gzipped size of the ESM entry in bytes */
  readonly entryGzipBytes: number;
}

/** Size comparison of one plugin package */
export interface PackageSize {
  /** Package directory under `packages/` */
  readonly plugin: string;
  /** Reference npm package */
  readonly reference: string;
  /** Current package size */
  readonly current: PackageSizeSide;
  /** Reference package size */
  readonly upstream: PackageSizeSide;
}

/** Committed size data of every compared package */
export interface SizeData {
  /** Size comparison keyed by package directory */
  readonly packages: Readonly<Record<string, PackageSize | undefined>>;
}

/** A package that has comparison results */
interface ComparedPackage {
  /** Package directory under `packages/` */
  readonly plugin: string;
  /** Reference npm package */
  readonly reference: string;
}

/** Options of a size collection run */
export interface CollectSizeOptions {
  /** Directory that contains the result files */
  readonly resultsDir?: string;
  /** Directory that contains the plugin packages */
  readonly packagesDir?: string;
}

/** A package manifest, only the fields used for size calculation are typed */
interface PackageManifest {
  readonly name: string;
  readonly version: string;
  readonly files?: readonly string[];
  readonly main?: string;
  readonly module?: string;
  readonly exports?: unknown;
}

/**
 * Read a JSON object from disk
 *
 * @param filePath - Path of the JSON file
 * @returns The parsed object
 */
const readJsonObject = (filePath: string): Record<string, unknown> => {
  const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));

  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed))
    throw new TypeError(`${filePath} does not contain a JSON object`);

  return parsed as Record<string, unknown>;
};

/**
 * Read and validate a package manifest
 *
 * @param filePath - Path of `package.json`
 * @returns The package manifest
 */
const readManifest = (filePath: string): PackageManifest => {
  const manifest = readJsonObject(filePath);
  const { exports: exportsField, files, main, module, name, version } = manifest;

  if (typeof name !== "string" || typeof version !== "string")
    throw new TypeError(`${filePath} is missing a string "name" or "version"`);

  if (files != null && (!Array.isArray(files) || !files.every((file) => typeof file === "string")))
    throw new TypeError(`${filePath} has a non-string "files" field`);

  return {
    name,
    version,
    ...(files == null ? {} : { files }),
    ...(typeof main === "string" ? { main } : {}),
    ...(typeof module === "string" ? { module } : {}),
    ...(exportsField == null ? {} : { exports: exportsField }),
  };
};

/**
 * Get the root npm package name of a possibly nested package import
 *
 * @param packageName - Npm package name, subpath exports are allowed
 * @returns The root package name
 */
const getRootPackageName = (packageName: string): string =>
  packageName.startsWith("@")
    ? packageName.split("/").slice(0, 2).join("/")
    : (packageName.split("/")[0] ?? packageName);

/**
 * Walk a directory recursively
 *
 * @param directory - Absolute directory path
 * @param skipNodeModules - Whether nested `node_modules` directories are skipped
 * @returns POSIX paths relative to the directory, sorted
 */
const walkFiles = (directory: string, skipNodeModules = false): string[] => {
  const files: string[] = [];
  const pending: string[] = [""];

  while (pending.length > 0) {
    const relativeDirectory = pending.pop();
    const entries = readdirSync(
      relativeDirectory ? path.join(directory, relativeDirectory) : directory,
      {
        withFileTypes: true,
      },
    );

    for (const entry of entries) {
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        if (skipNodeModules && entry.name === "node_modules") continue;

        pending.push(relativePath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  }

  return files.sort();
};

/**
 * Convert a `files` glob pattern of a package manifest into a regular expression
 *
 * @param pattern - Glob pattern, supports `*`, `**` and `?`
 * @returns The matching regular expression
 */
const globToRegExp = (pattern: string): RegExp => {
  let source = "";

  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index] ?? "";

    if (character === "*") {
      if (pattern[index + 1] === "*") {
        source += ".*";
        index++;
        if (pattern[index + 1] === "/") index++;
      } else {
        source += "[^/]*";
      }
    } else if (character === "?") {
      source += "[^/]";
    } else {
      source += String.raw`\^$+?.()|{}[]`.includes(character) ? `\\${character}` : character;
    }
  }

  return new RegExp(`^${source}$`, "u");
};

/**
 * Resolve the published file set of a package
 *
 * The `files` field of the manifest is expanded and the files npm always publishes (`package.json`,
 * `README`, `LICENSE`) are added.
 *
 * @param directory - Package directory
 * @param patterns - `files` patterns of the package manifest
 * @returns Published files, relative to the package directory, sorted
 */
const resolvePublishedFiles = (directory: string, patterns: readonly string[]): string[] => {
  const allFiles = walkFiles(directory);
  const publishedFiles = new Set<string>();

  for (const pattern of patterns) {
    const normalizedPattern = pattern.replace(/^\.\//u, "").replace(/\/+$/u, "");

    if (/[*?]/u.test(normalizedPattern)) {
      const matcher = globToRegExp(normalizedPattern);

      for (const file of allFiles) if (matcher.test(file)) publishedFiles.add(file);

      continue;
    }

    const target = path.join(directory, normalizedPattern);

    if (!existsSync(target)) continue;

    if (statSync(target).isDirectory()) {
      for (const file of allFiles) {
        if (file === normalizedPattern || file.startsWith(`${normalizedPattern}/`))
          publishedFiles.add(file);
      }
    } else {
      publishedFiles.add(normalizedPattern);
    }
  }

  for (const file of allFiles)
    if (!file.includes("/") && NPM_ALWAYS_INCLUDED.test(file)) publishedFiles.add(file);

  return [...publishedFiles].sort();
};

/**
 * Sum the file sizes of a file list
 *
 * @param directory - Directory the files are relative to
 * @param files - File paths relative to the directory
 * @returns Total size in bytes
 */
const sumFileSizes = (directory: string, files: readonly string[]): number => {
  let total = 0;

  for (const file of files) total += statSync(path.join(directory, file)).size;

  return total;
};

/**
 * Compute the gzipped size of a file
 *
 * @param filePath - Absolute file path
 * @returns Gzipped size in bytes
 */
const getGzipSize = (filePath: string): number =>
  gzipSync(readFileSync(filePath), { level: 9 }).length;

/**
 * Resolve the first existing entry of an `exports` target
 *
 * @param target - `exports` target, either a string, an array or a conditions object
 * @returns A relative file path, or `null` when no entry is found
 */
const resolveExportTarget = (target: unknown): string | null => {
  if (typeof target === "string") return target;

  if (Array.isArray(target)) {
    let resolved: string | null = null;

    for (const candidate of target) {
      resolved = resolveExportTarget(candidate);

      if (resolved != null) break;
    }

    return resolved;
  }

  if (typeof target === "object" && target != null) {
    const record = target as Record<string, unknown>;

    return (
      resolveExportTarget(record.import) ??
      resolveExportTarget(record.default) ??
      resolveExportTarget(record.require)
    );
  }

  return null;
};

/**
 * Resolve the `import` entry of an `exports` field
 *
 * @param exportsField - `exports` field of a package manifest
 * @returns A relative file path, or `null` when there is no entry export
 */
const resolveExportsImport = (exportsField: unknown): string | null => {
  if (typeof exportsField === "string") return exportsField;

  if (typeof exportsField === "object" && exportsField != null) {
    const record = exportsField as Record<string, unknown>;

    return resolveExportTarget("." in record ? record["."] : record);
  }

  return null;
};

/**
 * Compute the size of the current package
 *
 * @param directory - Package directory
 * @param plugin - Package directory name used in error messages
 * @returns Size of the current package
 */
const getCurrentSize = (directory: string, plugin: string): PackageSizeSide => {
  const manifestPath = path.join(directory, "package.json");

  if (!existsSync(manifestPath))
    throw new Error(`[compare] packages/${plugin}/package.json does not exist.`);

  const manifest = readManifest(manifestPath);
  // Platform-specific packages build `dist/node.js` and declare it in the `exports` map instead of
  // the conventional `dist/index.js`, so the manifest entry is tried first.
  const candidates = [resolveExportsImport(manifest.exports), ...CURRENT_ENTRY_FALLBACKS].filter(
    (candidate): candidate is string => typeof candidate === "string",
  );
  const entry = candidates.find((candidate) => existsSync(path.join(directory, candidate)));

  if (!entry) {
    throw new Error(
      `[compare] packages/${plugin} has no built ESM entry. Run \`pnpm run build\` before calculating sizes.`,
    );
  }

  const entryPath = path.join(directory, entry);

  const files = resolvePublishedFiles(directory, manifest.files ?? ["dist"]);

  return {
    name: manifest.name,
    version: manifest.version,
    unpackedBytes: sumFileSizes(directory, files),
    fileCount: files.length,
    entry,
    entryGzipBytes: getGzipSize(entryPath),
  };
};

/**
 * Resolve the installed directory of a reference package
 *
 * @param packageName - Npm package name, subpath exports are allowed
 * @returns Absolute package directory
 */
const resolveInstalledPackageDirectory = (packageName: string): string => {
  const rootName = getRootPackageName(packageName);
  let entryPath: string;

  try {
    entryPath = fileURLToPath(import.meta.resolve(packageName));
  } catch (err) {
    throw new Error(
      `[compare] cannot resolve the installed "${packageName}" package: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    );
  }

  let directory = path.dirname(entryPath);

  while (true) {
    const manifestPath = path.join(directory, "package.json");

    if (existsSync(manifestPath)) {
      const manifest = readManifest(manifestPath);

      if (manifest.name === rootName) return directory;
    }

    const parent = path.dirname(directory);
    if (parent === directory) break;

    directory = parent;
  }

  throw new Error(`[compare] cannot find the installed directory of "${packageName}".`);
};

/**
 * Resolve the ESM entry of a reference package
 *
 * The entry is resolved from `module`, `exports.import` and `main`, in this order, and falls back
 * to the entry that Node.js resolves for `import`.
 *
 * @param directory - Absolute package directory
 * @param manifest - Package manifest
 * @param packageName - Npm package name, used for the fallback
 * @returns The entry, relative to the package directory
 */
const resolveReferenceEntry = (
  directory: string,
  manifest: PackageManifest,
  packageName: string,
): string => {
  const candidates = [manifest.module, resolveExportsImport(manifest.exports), manifest.main];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const relativePath = candidate.replace(/^\.\//u, "");
    const absolutePath = path.join(directory, relativePath);

    if (existsSync(absolutePath) && statSync(absolutePath).isFile()) return relativePath;
  }

  const fallback = path.relative(directory, fileURLToPath(import.meta.resolve(packageName)));

  if (existsSync(path.join(directory, fallback))) return fallback;

  throw new Error(`[compare] cannot resolve the ESM entry of "${packageName}".`);
};

/**
 * Compute the size of a reference package
 *
 * @param packageName - Npm package name, subpath exports are allowed
 * @returns Size of the reference package
 */
const getReferenceSize = (packageName: string): PackageSizeSide => {
  const directory = resolveInstalledPackageDirectory(packageName);
  const manifest = readManifest(path.join(directory, "package.json"));
  const files = walkFiles(directory, true);
  const entry = resolveReferenceEntry(directory, manifest, packageName);

  return {
    name: manifest.name,
    version: manifest.version,
    unpackedBytes: sumFileSizes(directory, files),
    fileCount: files.length,
    entry,
    entryGzipBytes: getGzipSize(path.join(directory, entry)),
  };
};

/**
 * List the packages that have committed comparison results
 *
 * @param resultsDir - Directory that contains the result files
 * @returns Compared packages, sorted by package directory
 */
export const listComparedPackages = (resultsDir: string = RESULTS_DIR): ComparedPackage[] => {
  if (!existsSync(resultsDir)) return [];

  return readdirSync(resultsDir)
    .filter((fileName) => fileName.endsWith(".json") && fileName !== "sizes.json")
    .sort()
    .map((fileName) => readJsonObject(path.join(resultsDir, fileName)))
    .map((result) => {
      const { plugin, reference } = result as Partial<ComparisonResult>;

      if (typeof plugin !== "string" || typeof reference !== "string") {
        throw new TypeError(
          `[compare] a result file in ${resultsDir} is missing a string "plugin" or "reference".`,
        );
      }

      return { plugin, reference };
    })
    .sort((packageA, packageB) => packageA.plugin.localeCompare(packageB.plugin));
};

/**
 * Compute the committed size data of every compared package
 *
 * @param options - Collection options
 * @returns The size data
 */
export const collectSizeData = ({
  resultsDir = RESULTS_DIR,
  packagesDir = PACKAGES_DIR,
}: CollectSizeOptions = {}): SizeData => {
  const packages: Record<string, PackageSize> = {};

  for (const { plugin, reference } of listComparedPackages(resultsDir)) {
    packages[plugin] = {
      plugin,
      reference,
      current: getCurrentSize(path.join(packagesDir, plugin), plugin),
      upstream: getReferenceSize(reference),
    };
  }

  return { packages };
};

/**
 * Serialize size data into the committed JSON format
 *
 * @param data - Size data
 * @returns JSON text with a trailing newline
 */
export const serializeSizeData = (data: SizeData): string =>
  `${JSON.stringify({ packages: data.packages }, null, 2)}\n`;

/**
 * Read the committed size data
 *
 * @param file - Size data file
 * @returns The size data, or `null` when the file does not exist
 */
export const readSizeData = (file: string = SIZES_FILE): SizeData | null => {
  if (!existsSync(file)) return null;

  const data = readJsonObject(file);

  if (data.packages == null || typeof data.packages !== "object")
    throw new TypeError(`${file} does not contain a "packages" object`);

  return data as unknown as SizeData;
};

/**
 * Log a size summary of every compared package
 *
 * @param data - Size data
 */
const logSizeSummary = (data: SizeData): void => {
  const packages = Object.values(data.packages).filter((size): size is PackageSize => size != null);

  if (packages.length === 0) {
    console.log("[compare] no comparison result found, skipped the size calculation.");
    return;
  }

  for (const size of packages) {
    console.log(
      `[compare] ${size.plugin}: ${size.current.fileCount} files / ${size.current.unpackedBytes} B unpacked, ${size.current.entryGzipBytes} B gzip entry; reference ${size.upstream.unpackedBytes} B / ${size.upstream.entryGzipBytes} B`,
    );
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const sizeData = collectSizeData();
  const sizeCount = Object.keys(sizeData.packages).length;

  if (sizeCount > 0) writeFileSync(SIZES_FILE, serializeSizeData(sizeData));

  logSizeSummary(sizeData);

  if (sizeCount > 0)
    console.log(`[compare] wrote ${path.relative(ROOT, SIZES_FILE)} for ${sizeCount} packages.`);
}
