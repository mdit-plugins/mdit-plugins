import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { loadReportData, renderComparisonBlock } from "./render.ts";
import type { ReportLocale } from "./render.ts";
import type { ComparisonResult } from "./types.ts";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

/** Directory of the English and Chinese documentation pages */
const DOCS_DIR = path.join(ROOT, "docs", "src");

/** Marker that starts a generated comparison block */
export const COMPARISON_START = "<!-- comparison:start -->";

/** Marker that ends a generated comparison block */
export const COMPARISON_END = "<!-- comparison:end -->";

/**
 * Documentation pages that cover more than one package
 *
 * The slug of every other compared package is its directory name without the `plugin-` prefix.
 */
const DOC_SLUG_OVERRIDES: Readonly<Record<string, string>> = {
  "plugin-katex-slim": "katex",
  "plugin-mathjax-slim": "mathjax",
};

/** Result of a documentation synchronization run */
export interface SyncDocsResult {
  /** Number of generated documentation pages */
  readonly checked: number;
  /** Documentation pages that differ from the generated content */
  readonly outdated: readonly string[];
}

/** Options of a documentation synchronization run */
export interface SyncDocsOptions {
  /** Whether to only check without writing files */
  readonly check?: boolean;
  /** Documentation source directory */
  readonly docsDir?: string;
  /** Directory that contains the result files */
  readonly resultsDir?: string;
  /** Size data file */
  readonly sizesFile?: string;
}

/**
 * Get the documentation slug of a compared package
 *
 * @param plugin - Package directory under `packages/`
 * @returns Documentation slug, i.e. the page name without the `.md` extension
 */
export const getDocsSlug = (plugin: string): string =>
  DOC_SLUG_OVERRIDES[plugin] ?? plugin.replace(/^plugin-/u, "");

/**
 * Insert or replace the generated comparison block of a documentation page
 *
 * The operation is idempotent: running it twice with the same block yields the same content.
 *
 * @param content - Current page content
 * @param block - Rendered comparison block, without the markers
 * @returns Page content with the comparison block at the end
 */
export const upsertComparisonBlock = (content: string, block: string): string => {
  const startIndex = content.indexOf(COMPARISON_START);
  const endIndex = content.indexOf(COMPARISON_END);

  if (startIndex === -1 && endIndex === -1)
    return `${content.replace(/\s+$/u, "")}\n\n${COMPARISON_START}\n\n${block}\n\n${COMPARISON_END}\n`;

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex)
    throw new Error("the page contains unbalanced comparison markers");

  return `${content.slice(0, startIndex)}${COMPARISON_START}\n\n${block}\n\n${COMPARISON_END}${content.slice(endIndex + COMPARISON_END.length)}`;
};

/**
 * Generate the comparison block of every documented package
 *
 * @param options - Synchronization options
 * @returns Synchronization result
 */
export const syncDocs = ({
  check = false,
  docsDir = DOCS_DIR,
  resultsDir,
  sizesFile,
}: SyncDocsOptions = {}): SyncDocsResult => {
  const { results, sizes } = loadReportData({ resultsDir, sizesFile });

  if (results.length === 0) return { checked: 0, outdated: [] };

  if (!sizes) {
    throw new Error(
      "[compare] `scripts/compare/results/sizes.json` is missing. Run `pnpm run compare:sizes` first.",
    );
  }

  const resultsBySlug = new Map<string, ComparisonResult[]>();

  for (const result of results) {
    const slug = getDocsSlug(result.plugin);
    const slugResults = resultsBySlug.get(slug);

    if (slugResults) slugResults.push(result);
    else resultsBySlug.set(slug, [result]);
  }

  const outdated: string[] = [];
  let checked = 0;

  for (const slug of [...resultsBySlug.keys()].sort()) {
    const slugResults = resultsBySlug.get(slug) ?? [];
    const pages: readonly (readonly [string, ReportLocale])[] = [
      [path.join(docsDir, `${slug}.md`), "en"],
      [path.join(docsDir, "zh", `${slug}.md`), "zh"],
    ];

    for (const [pagePath, locale] of pages) {
      if (!existsSync(pagePath)) {
        throw new Error(
          `[compare] ${path.relative(ROOT, pagePath)} does not exist, but ${slugResults
            .map((result) => result.plugin)
            .join(", ")} has comparison results.`,
        );
      }

      checked++;

      const actual = readFileSync(pagePath, "utf8");
      const expected = upsertComparisonBlock(
        actual,
        renderComparisonBlock(slugResults, sizes, locale),
      );

      if (actual === expected) continue;

      outdated.push(pagePath);

      if (!check) writeFileSync(pagePath, expected);
    }
  }

  return { checked, outdated };
};

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const check = process.argv.includes("--check");
  const { checked, outdated } = syncDocs({ check });

  if (check) {
    if (outdated.length > 0) {
      console.error(
        `\n${outdated.length}/${checked} documentation pages have a stale comparison block:`,
      );

      for (const pagePath of outdated) console.error(`  ${path.relative(ROOT, pagePath)}`);

      console.error("\nRun `pnpm run compare:docs` to update them.");
      process.exitCode = 1;
    } else {
      console.log(`All ${checked} documentation pages are up to date.`);
    }
  } else {
    console.log(
      outdated.length > 0
        ? `Updated ${outdated.length}/${checked} documentation pages.`
        : `All ${checked} documentation pages are already up to date.`,
    );
  }
}
