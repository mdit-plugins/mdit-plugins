import { describe, expect, it } from "vitest";

import {
  buildDocsComparisonData,
  formatBytes,
  formatExponent,
  formatOpsPerSec,
  formatRatio,
  loadReportData,
  normalizeInlineCodeSpans,
  renderPluginComparisonLink,
  renderReadmeComparison,
  renderTable,
} from "../render.ts";
import type { ComparisonResult } from "../types.ts";

/** Comparison result fixture used by the README rendering tests */
const resultFixture: ComparisonResult = {
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
        error: 0,
        cases: [
          { name: "heading", status: "exact" },
          {
            name: "inline",
            status: "diff",
            note: { en: "English reason.", zh: "中文原因。" },
          },
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
          current: [{ size: 64, ms: 0.01 }],
          reference: [{ size: 64, ms: 0.02 }],
          currentExponent: 1,
          referenceExponent: 1,
        },
      ],
    },
  ],
  notes: [{ en: "Fixture note.", zh: "测试说明。" }],
};

describe("compare/render.ts", () => {
  it("should format sizes with decimal units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(999)).toBe("999 B");
    expect(formatBytes(4648)).toBe("4.6 kB");
    expect(formatBytes(240_014)).toBe("240.0 kB");
    expect(formatBytes(1_234_567)).toBe("1.23 MB");
  });

  it("should format throughput and ratios deterministically", () => {
    expect(formatOpsPerSec(21_032.63)).toBe("21,033");
    expect(formatOpsPerSec(776)).toBe("776");
    expect(formatOpsPerSec(1_234_567.8)).toBe("1,234,568");
    expect(formatRatio(1.0598)).toBe("1.06×");
    expect(formatRatio(12.345)).toBe("12.3×");
    expect(formatExponent(0.9938)).toBe("~0.99");
    expect(formatExponent(Number.NaN)).toBe("—");
  });

  it("should render formatter-compatible tables", () => {
    expect(
      renderTable(
        ["用例数", "完全一致"],
        [
          ["20", "20"],
          ["1234", "1"],
        ],
        ["right", "right"],
      ),
    ).toBe(
      [
        "| 用例数 | 完全一致 |",
        "| -----: | -------: |",
        "|     20 |       20 |",
        "|   1234 |        1 |",
      ].join("\n"),
    );
    expect(renderTable(["h", "宽"], [["a", "中文"]], ["left", "left"])).toBe(
      ["| h   | 宽   |", "| --- | ---- |", "| a   | 中文 |"].join("\n"),
    );
  });

  it("should serialize inline code spans in formatter-stable form", () => {
    expect(normalizeInlineCodeSpans("`plain`")).toBe("`plain`");
    expect(normalizeInlineCodeSpans("`mathFence` (```` ```math ````)")).toBe(
      "`mathFence` (` ```math `)",
    );
    expect(normalizeInlineCodeSpans("`a``b`")).toBe("`a``b`");
    expect(normalizeInlineCodeSpans("no code here")).toBe("no code here");
  });

  it("should load the committed comparison data", () => {
    const { results, sizes } = loadReportData();
    const attrs = results.find((result) => result.plugin === "plugin-attrs");

    expect(attrs).toBeDefined();
    expect(attrs!.reference).toBe("markdown-it-attrs");
    expect(sizes).not.toBeNull();
    expect(sizes!.packages["plugin-attrs"]).toBeDefined();
  });

  it("should build the docs data deterministically", () => {
    const reportData = loadReportData();
    const data = buildDocsComparisonData(reportData);

    expect(data.packages).toHaveLength(reportData.results.length);
    expect(data.totals.packages).toBe(reportData.results.length);
    expect(data.packages[0]?.docsSlug).toBeDefined();
    expect(data.packages[0]?.variants).not.toHaveLength(0);
    expect(data.totals.cases).toBe(
      reportData.results
        .flatMap((result) => result.variants)
        .reduce((total, variant) => total + variant.correctness.total, 0),
    );
    expect(data.methodNotes.en).not.toHaveLength(0);
    expect(data.methodNotes.zh).toHaveLength(data.methodNotes.en.length);
    expect(buildDocsComparisonData(reportData)).toStrictEqual(data);
  });

  it("should render the bilingual comparison links", () => {
    expect(renderPluginComparisonLink("en")).toContain("[comparison report](compare.md)");
    expect(renderPluginComparisonLink("zh")).toContain("[对比报告](compare.md)");
  });

  it("should render a compact bilingual README section", () => {
    const section = renderReadmeComparison(
      resultFixture,
      {
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
      {
        compareUrl: "https://example.com/compare.html",
        zhCompareUrl: "https://example.com/zh/compare.html",
      },
    );

    expect(section).toContain("## Comparison / 对比");
    expect(section).toContain("Correctness:");
    expect(section).toContain("Throughput:");
    expect(section).toContain("Package size:");
    expect(section).toContain("[English](https://example.com/compare.html)");
    expect(section).toContain("[中文](https://example.com/zh/compare.html)");
  });
});
