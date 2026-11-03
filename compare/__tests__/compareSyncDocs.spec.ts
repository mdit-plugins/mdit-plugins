import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getDocsSlug } from "../render.ts";
import { COMPARISON_END, COMPARISON_START, syncDocs, upsertComparisonBlock } from "../syncDocs.ts";

/** Comparison result fixture used by the synchronization tests */
const resultFixture = {
  plugin: "plugin-attrs",
  reference: "markdown-it-attrs",
  referenceVersion: "5.0.1",
  generatedAt: "2026-01-01T00:00:00.000Z",
  commit: "0000000",
  machine: {
    platform: "darwin",
    arch: "arm64",
    node: "v22.0.0",
    cpu: "Test CPU",
    memoryGB: 8,
  },
  variants: [
    {
      id: "default",
      correctness: {
        total: 2,
        exact: 1,
        normalized: 1,
        diff: 0,
        referenceErrors: 0,
        differences: 0,
        issues: [],
        error: 0,
        cases: [
          { name: "heading", status: "exact" },
          { name: "inline", status: "normalized" },
        ],
      },
      bench: [
        {
          case: "normal/small",
          kind: "normal",
          size: "small",
          current: { opsPerSec: 1000, meanMs: 1, samples: [1] },
          reference: { opsPerSec: 500, meanMs: 2, samples: [2] },
          ratio: 2,
        },
      ],
      scaling: [
        {
          case: "inline",
          sizes: [64, 128, 256, 512],
          current: [
            { size: 64, ms: 0.01 },
            { size: 128, ms: 0.02 },
            { size: 256, ms: 0.04 },
            { size: 512, ms: 0.08 },
          ],
          reference: [
            { size: 64, ms: 0.02 },
            { size: 128, ms: 0.04 },
            { size: 256, ms: 0.08 },
            { size: 512, ms: 0.16 },
          ],
          currentExponent: 1,
          referenceExponent: 1,
        },
      ],
    },
  ],
  notes: [{ en: "Fixture note.", zh: "测试说明。" }],
};

/** Size data fixture used by the synchronization tests */
const sizeFixture = {
  packages: {
    "plugin-attrs": {
      plugin: "plugin-attrs",
      reference: "markdown-it-attrs",
      current: {
        name: "@mdit/plugin-attrs",
        version: "1.0.0",
        unpackedBytes: 1000,
        fileCount: 3,
        entry: "dist/index.js",
        entryGzipBytes: 500,
      },
      upstream: {
        name: "markdown-it-attrs",
        version: "5.0.1",
        unpackedBytes: 2000,
        fileCount: 4,
        entry: "index.js",
        entryGzipBytes: 600,
      },
    },
  },
};

/** Temporary documentation fixture */
interface DocsFixture {
  /** Root of the temporary fixture */
  readonly root: string;
  /** Documentation source directory */
  readonly docsDir: string;
  /** Directory that contains the result files */
  readonly resultsDir: string;
  /** Size data file */
  readonly sizesFile: string;
  /** Generated docs data file */
  readonly dataFile: string;
}

/**
 * Create a temporary documentation fixture
 *
 * @returns Paths of the fixture
 */
const createFixture = (): DocsFixture => {
  const root = mkdtempSync(path.join(tmpdir(), "mdit-compare-docs-"));
  const docsDir = path.join(root, "docs", "src");
  const resultsDir = path.join(root, "results");
  const sizesFile = path.join(resultsDir, "sizes.json");
  const dataFile = path.join(root, "data", "comparison.json");

  mkdirSync(path.join(docsDir, "zh"), { recursive: true });
  mkdirSync(resultsDir, { recursive: true });
  writeFileSync(path.join(docsDir, "compare.md"), "# Comparison\n\nPage content.\n");
  writeFileSync(path.join(docsDir, "zh", "compare.md"), "# 对比\n\n页面内容。\n");
  writeFileSync(path.join(docsDir, "attrs.md"), "# @mdit/plugin-attrs\n\nPage content.\n");
  writeFileSync(path.join(docsDir, "zh", "attrs.md"), "# @mdit/plugin-attrs\n\n页面内容。\n");
  writeFileSync(path.join(resultsDir, "plugin-attrs.json"), JSON.stringify(resultFixture));
  writeFileSync(sizesFile, JSON.stringify(sizeFixture));

  return { root, docsDir, resultsDir, sizesFile, dataFile };
};

describe("compare/syncDocs.ts", () => {
  it("should map packages to documentation pages", () => {
    expect(getDocsSlug("plugin-attrs")).toBe("attrs");
    expect(getDocsSlug("plugin-katex")).toBe("katex");
    expect(getDocsSlug("plugin-katex-slim")).toBe("katex");
    expect(getDocsSlug("plugin-mathjax")).toBe("mathjax");
    expect(getDocsSlug("plugin-mathjax-slim")).toBe("mathjax");
  });

  it("should append, replace and keep the comparison block idempotent", () => {
    const page = "# Page\n\nContent.\n";
    const appended = upsertComparisonBlock(page, "BODY");

    expect(appended).toBe(
      `# Page\n\nContent.\n\n${COMPARISON_START}\n\nBODY\n\n${COMPARISON_END}\n`,
    );
    expect(upsertComparisonBlock(appended, "BODY")).toBe(appended);

    const replaced = upsertComparisonBlock(appended, "UPDATED");

    expect(replaced).toContain("UPDATED");
    expect(replaced).not.toContain("BODY");
    expect(upsertComparisonBlock(replaced, "UPDATED")).toBe(replaced);
    expect(() => upsertComparisonBlock(`Page\n${COMPARISON_END}\n`, "BODY")).toThrow(
      /unbalanced comparison markers/u,
    );
  });

  it("should write the docs data and the link into both locales", () => {
    const { root, docsDir, resultsDir, sizesFile, dataFile } = createFixture();
    const options = { docsDir, resultsDir, sizesFile, dataFile };

    try {
      const written = syncDocs(options);

      expect(written.checked).toBe(3);
      expect(written.outdated).toHaveLength(3);
      expect(readFileSync(dataFile, "utf8")).toContain('"plugin-attrs"');

      const english = readFileSync(path.join(docsDir, "attrs.md"), "utf8");
      const chinese = readFileSync(path.join(docsDir, "zh", "attrs.md"), "utf8");

      expect(english).toContain(COMPARISON_START);
      expect(english).toContain("[comparison report](compare.md)");
      expect(chinese).toContain("[对比报告](compare.md)");
      expect(syncDocs({ ...options, check: true }).outdated).toStrictEqual([]);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("should detect stale pages and stale data", () => {
    const { root, docsDir, resultsDir, sizesFile, dataFile } = createFixture();
    const options = { docsDir, resultsDir, sizesFile, dataFile };

    try {
      syncDocs(options);

      const pagePath = path.join(docsDir, "attrs.md");
      const english = readFileSync(pagePath, "utf8");

      writeFileSync(pagePath, english.replace("[comparison report](compare.md)", "stale"));

      expect(syncDocs({ ...options, check: true }).outdated).toStrictEqual([pagePath]);
      expect(syncDocs(options).outdated).toStrictEqual([pagePath]);

      writeFileSync(dataFile, "{}\n");

      const stale = syncDocs({ ...options, check: true });

      expect(stale.outdated).toContain(dataFile);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("should require the dedicated comparison page", () => {
    const { root, docsDir, resultsDir, sizesFile, dataFile } = createFixture();

    try {
      rmSync(path.join(docsDir, "compare.md"));

      expect(() => syncDocs({ docsDir, resultsDir, sizesFile, dataFile })).toThrow(
        /dedicated comparison page must exist/u,
      );
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("should require size data when there are comparison results", () => {
    const { root, docsDir, resultsDir, dataFile } = createFixture();

    try {
      expect(() =>
        syncDocs({
          docsDir,
          resultsDir,
          sizesFile: path.join(resultsDir, "missing.json"),
          dataFile,
        }),
      ).toThrow(/sizes\.json/u);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });
});
