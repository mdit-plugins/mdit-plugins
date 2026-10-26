import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const packagesDir = path.resolve(import.meta.dirname, "..", "packages");
const DOCS_HOMEPAGE_PATTERN = /^https:\/\/mdit-plugins\.github\.io\/(?<slug>[a-z0-9-]+)\.html$/u;
const HELPER_DIR = "helper";

/** Package metadata used to render a package README */
export interface PackageInfo {
  /** Directory name under `packages/` */
  readonly dirName: string;
  /** Package name in `package.json` */
  readonly name: string;
  /** Package description in `package.json` */
  readonly description: string;
  /** Package homepage in `package.json` */
  readonly homepage?: string;
}

/** Package metadata read from a `package.json` file */
interface PackageManifest {
  readonly name: string;
  readonly description: string;
  readonly homepage?: string;
}

/** Extra README content that cannot be derived from `package.json` */
interface ReadmeExtras {
  /** Extra packages appended to the install commands */
  readonly installPackages?: readonly string[];
  /** Paragraphs rendered between the description and the docs link */
  readonly notes?: readonly string[];
  /** Content of the acknowledgements section */
  readonly acknowledgements?: string;
}

/**
 * README extras for packages that need additional instructions
 *
 * The description itself always comes from `package.json`, so this map must only contain content
 * that is not part of the package metadata.
 */
const README_EXTRAS: Readonly<Record<string, ReadmeExtras>> = {
  "plugin-abbr": {
    acknowledgements:
      "Rewritten from [markdown-it-abbr](https://github.com/markdown-it/markdown-it-abbr) by [Vitaly Puzrin](https://github.com/puzrin) and [Alex Kocharin](https://github.com/rlidwka).",
  },
  "plugin-anchor": {
    acknowledgements:
      "This plugin is inspired by and based on [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor), whose authors are [Val](https://val.codejam.info/) and [Nagao, Fabio Zendhi](https://github.com/nagaozen/)",
  },
  "plugin-include": {
    notes: ["This package can only run in Node.js environment."],
  },
  "plugin-katex-slim": {
    installPackages: ["katex"],
    notes: [
      "`katex` is declared as an optional peer dependency here.",
      "This package can only run in Node.js environment.",
    ],
  },
  "plugin-mathjax-slim": {
    installPackages: ["@mathjax/src"],
    notes: [
      "`@mathjax/src` is declared as an optional peer dependency here.",
      "This package can only run in Node.js environment.",
    ],
  },
  "plugin-snippet": {
    notes: ["This package can only run in Node.js environment."],
  },
};

/**
 * Read and validate a package manifest
 *
 * @param manifestPath Path to `package.json`
 * @returns Package metadata
 */
const readManifest = (manifestPath: string): PackageManifest => {
  const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (manifest == null || typeof manifest !== "object")
    throw new TypeError(`${manifestPath} does not contain a JSON object`);

  const { name, description, homepage } = manifest as Record<string, unknown>;

  if (typeof name !== "string" || typeof description !== "string")
    throw new TypeError(`${manifestPath} is missing a string "name" or "description"`);

  return {
    name,
    description,
    ...(typeof homepage === "string" ? { homepage } : {}),
  };
};

/**
 * Get the documentation slug of a package
 *
 * The slug is read from the package homepage when it points to the documentation site. Packages
 * hosted elsewhere (e.g. `@mdit/plugin-emoji`) fall back to the directory name without the
 * `plugin-` prefix. `@mdit/helper` has no documentation page.
 *
 * @param pkg Package metadata
 * @returns Documentation slug, or `null` when the package has no docs page
 */
export const getDocsSlug = (pkg: Pick<PackageInfo, "dirName" | "homepage">): string | null => {
  if (pkg.dirName === HELPER_DIR) return null;

  return (
    pkg.homepage?.match(DOCS_HOMEPAGE_PATTERN)?.groups?.slug ?? pkg.dirName.replace(/^plugin-/u, "")
  );
};

/**
 * Remove trailing periods from a package description
 *
 * @param description Package description
 * @returns Description without trailing periods
 */
export const stripDescriptionPeriod = (description: string): string =>
  description.trim().replace(/\.+$/u, "");

/**
 * Render the description line of a README
 *
 * @param description Package description
 * @returns Description ending with exactly one period
 */
export const formatReadmeDescription = (description: string): string =>
  `${stripDescriptionPeriod(description)}.`;

/**
 * Render the README of a package
 *
 * @param pkg Package metadata
 * @returns README content
 */
export const renderReadme = (pkg: PackageInfo): string => {
  const docsSlug = getDocsSlug(pkg);
  const extras = README_EXTRAS[pkg.dirName];
  const installTargets = [pkg.name, ...(extras?.installPackages ?? [])].join(" ");
  const blocks: string[] = [
    `# ${pkg.name}`,
    `[![Version](https://img.shields.io/npm/v/${pkg.name}.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/${pkg.name}.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/${pkg.name}?style=flat-square&logo=npm)](https://www.npmjs.com/package/${pkg.name})`,
    formatReadmeDescription(pkg.description),
  ];

  for (const note of extras?.notes ?? []) blocks.push(note);

  if (docsSlug) {
    blocks.push(
      `## [Docs](https://mdit-plugins.github.io/${docsSlug}.html) | [文档](https://mdit-plugins.github.io/zh/${docsSlug}.html)`,
    );
  }

  blocks.push(
    [
      "## Install / 安装",
      "",
      "```bash",
      "# pnpm",
      `pnpm add -D ${installTargets}`,
      "# npm",
      `npm i -D ${installTargets}`,
      "# yarn",
      `yarn add -D ${installTargets}`,
      "```",
    ].join("\n"),
  );

  if (extras?.acknowledgements)
    blocks.push(["## Acknowledgements / 鸣谢", "", extras.acknowledgements].join("\n"));

  return `${blocks.join("\n\n")}\n`;
};

/**
 * Discover all packages under `packages/`
 *
 * @param directory Packages directory
 * @returns Package metadata sorted by directory name
 */
export const discoverPackages = (directory: string = packagesDir): PackageInfo[] =>
  readdirSync(directory)
    .filter((dirName) => !dirName.startsWith("."))
    .flatMap((dirName) => {
      const pkgDir = path.join(directory, dirName);

      try {
        if (!statSync(pkgDir).isDirectory()) return [];
      } catch {
        return [];
      }

      if (
        !existsSync(path.join(pkgDir, "package.json")) ||
        !existsSync(path.join(pkgDir, "src", "index.ts"))
      )
        return [];

      const manifest = readManifest(path.join(pkgDir, "package.json"));

      return [{ dirName, ...manifest }];
    })
    .sort((pkgA, pkgB) => pkgA.dirName.localeCompare(pkgB.dirName));

/**
 * Print a brief line diff between the actual and expected README
 *
 * @param readmePath README path
 * @param actual Current README content
 * @param expected Generated README content
 */
const printDiff = (readmePath: string, actual: string, expected: string): void => {
  const actualLines = actual.split("\n");
  const expectedLines = expected.split("\n");
  const maxLength = Math.max(actualLines.length, expectedLines.length);
  const shownLines = 20;

  console.error(`\nREADME is out of date: ${path.relative(process.cwd(), readmePath)}`);

  let printedLines = 0;

  for (let index = 0; index < maxLength && printedLines < shownLines; index++) {
    if (actualLines[index] === expectedLines[index]) continue;

    console.error(`  line ${index + 1}`);
    console.error(`  - ${actualLines[index] ?? ""}`);
    console.error(`  + ${expectedLines[index] ?? ""}`);
    printedLines++;
  }

  if (printedLines === 0) console.error("  (file content differs at the trailing newline)");
};

/** Result of a README synchronization run */
export interface SyncReadmeResult {
  /** Number of discovered packages */
  readonly checked: number;
  /** README paths that differ from the generated content */
  readonly outdated: readonly string[];
}

/** Options of a README synchronization run */
export interface SyncReadmeOptions {
  /** Whether to only check without writing files */
  readonly check?: boolean;
  /** Packages directory */
  readonly directory?: string;
}

/**
 * Generate the README of every package
 *
 * @param options Synchronization options
 * @returns Synchronization result
 */
export const syncAllReadmes = ({
  check = false,
  directory = packagesDir,
}: SyncReadmeOptions = {}): SyncReadmeResult => {
  const packages = discoverPackages(directory);
  const outdated: string[] = [];

  for (const pkg of packages) {
    const readmePath = path.join(directory, pkg.dirName, "README.md");
    const expected = renderReadme(pkg);
    const actual = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";

    if (actual === expected) continue;

    outdated.push(readmePath);

    if (check) printDiff(readmePath, actual, expected);
    else writeFileSync(readmePath, expected);
  }

  return { checked: packages.length, outdated };
};

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const check = process.argv.includes("--check");
  const { checked, outdated } = syncAllReadmes({ check });

  if (check) {
    if (outdated.length > 0) {
      console.error(
        `\n${outdated.length}/${checked} package READMEs are out of date. Run \`pnpm run packages:sync-readme\` to update them.`,
      );
      process.exitCode = 1;
    } else {
      console.log(`All ${checked} package READMEs are up to date.`);
    }
  } else {
    console.log(
      outdated.length > 0
        ? `Updated ${outdated.length}/${checked} package READMEs.`
        : `All ${checked} package READMEs are already up to date.`,
    );
  }
}
