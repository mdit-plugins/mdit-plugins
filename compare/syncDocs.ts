import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  DOCS_DATA_FILE,
  buildDocsComparisonData,
  getDocsSlug,
  loadReportData,
  loadTestSuiteData,
  renderPluginComparisonLink,
} from "./render.ts";
import type { ReportLocale } from "./render.ts";
import type { ComparisonResult } from "./types.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

/** Directory of the English and Chinese documentation pages */
const DOCS_DIR = path.join(ROOT, "docs", "src");

/** Marker that starts a generated comparison block */
export const COMPARISON_START = "<!-- comparison:start -->";

/** Marker that ends a generated comparison block */
export const COMPARISON_END = "<!-- comparison:end -->";

/** Result of a documentation synchronization run */
export interface SyncDocsResult {
  /** Number of generated documentation pages */
  readonly checked: number;
  /** Generated files that differ from the committed content */
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
  /** Generated docs data file */
  readonly dataFile?: string;
}

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
 * Group results by documentation page
 *
 * @param results - Comparison results
 * @returns Results keyed by documentation slug, sorted by slug
 */
const groupResultsBySlug = (
  results: readonly ComparisonResult[],
): Map<string, ComparisonResult[]> => {
  const resultsBySlug = new Map<string, ComparisonResult[]>();

  for (const result of results) {
    const slug = getDocsSlug(result.plugin);
    const slugResults = resultsBySlug.get(slug);

    if (slugResults) slugResults.push(result);
    else resultsBySlug.set(slug, [result]);
  }

  return new Map(
    [...resultsBySlug.entries()].sort(([slugA], [slugB]) => slugA.localeCompare(slugB)),
  );
};

/**
 * Generate the comparison links of every documented package
 *
 * @param options - Synchronization options
 * @returns Synchronization result
 */
export const syncDocs = ({
  check = false,
  docsDir = DOCS_DIR,
  resultsDir,
  sizesFile,
  dataFile = DOCS_DATA_FILE,
}: SyncDocsOptions = {}): SyncDocsResult => {
  const reportData = loadReportData({ resultsDir, sizesFile });
  const { results, sizes } = reportData;
  const outdated: string[] = [];
  let checked = 0;

  if (results.length === 0) return { checked: 0, outdated: [] };

  if (sizes == null) {
    throw new Error(
      "[compare] `compare/results/sizes.json` is missing. Run `pnpm run compare:sizes` first.",
    );
  }

  // 1) The comparison page and its generated data file.
  const pages: readonly (readonly [string, ReportLocale])[] = [
    [path.join(docsDir, "compare.md"), "en"],
    [path.join(docsDir, "zh", "compare.md"), "zh"],
  ];

  for (const [pagePath] of pages) {
    if (!existsSync(pagePath)) {
      throw new Error(
        `[compare] ${path.relative(ROOT, pagePath)} is missing. The dedicated comparison page must exist.`,
      );
    }
  }

  checked++;

  const expectedData = `${JSON.stringify(buildDocsComparisonData(reportData, loadTestSuiteData()), null, 2)}\n`;
  const actualData = existsSync(dataFile) ? readFileSync(dataFile, "utf8") : "";

  if (actualData !== expectedData) {
    outdated.push(dataFile);

    if (!check) {
      mkdirSync(path.dirname(dataFile), { recursive: true });
      writeFileSync(dataFile, expectedData);
    }
  }

  // 2) One link line at the end of every documented plugin page.
  for (const [slug] of groupResultsBySlug(results)) {
    const slugPages: readonly (readonly [string, ReportLocale])[] = [
      [path.join(docsDir, `${slug}.md`), "en"],
      [path.join(docsDir, "zh", `${slug}.md`), "zh"],
    ];

    for (const [pagePath, locale] of slugPages) {
      if (!existsSync(pagePath)) {
        throw new Error(
          `[compare] ${path.relative(ROOT, pagePath)} does not exist, but a compared package maps to the "${slug}" documentation page.`,
        );
      }

      checked++;

      const actual = readFileSync(pagePath, "utf8");
      const expected = upsertComparisonBlock(actual, renderPluginComparisonLink(locale));

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
      console.error(`\n${outdated.length}/${checked} generated comparison files are stale:`);

      for (const filePath of outdated) console.error(`  ${path.relative(ROOT, filePath)}`);

      console.error("\nRun `pnpm run compare:docs` to update them.");
      process.exitCode = 1;
    } else {
      console.log(`All ${checked} generated comparison files are up to date.`);
    }
  } else {
    console.log(
      outdated.length > 0
        ? `Updated ${outdated.length}/${checked} generated comparison files.`
        : `All ${checked} generated comparison files are already up to date.`,
    );
  }
}
