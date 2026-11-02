import { describe, expect, it } from "vitest";

import {
  formatBytes,
  formatExponent,
  formatOpsPerSec,
  formatRatio,
  loadReportData,
  normalizeInlineCodeSpans,
  renderComparisonBlock,
  renderTable,
} from "../compare/render.js";
import type { SizeData } from "../compare/size.js";

/**
 * Count level-three headings of a rendered block
 *
 * @param block - Rendered Markdown block
 * @returns Number of level-three headings
 */
const countLevelThreeHeadings = (block: string): number => block.match(/^### /gmu)?.length ?? 0;

describe("scripts/compare/render.ts", () => {
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

  it("should render a deterministic bilingual docs block", () => {
    const { results, sizes } = loadReportData();
    const attrs = results.filter((result) => result.plugin === "plugin-attrs");

    expect(sizes).not.toBeNull();

    const english = renderComparisonBlock(attrs, sizes!, "en");
    const chinese = renderComparisonBlock(attrs, sizes!, "zh");

    expect(renderComparisonBlock(attrs, sizes!, "en")).toBe(english);
    expect(english).toContain("## Comparison");
    expect(english).toContain("### Correctness");
    expect(english).toContain("### Benchmarks");
    expect(chinese).toContain("## 对比");
    expect(countLevelThreeHeadings(chinese)).toBe(countLevelThreeHeadings(english));
  });

  it("should render the size table and the notes", () => {
    const { results, sizes } = loadReportData();
    const attrs = results.filter((result) => result.plugin === "plugin-attrs");

    expect(sizes).not.toBeNull();

    const block = renderComparisonBlock(attrs, sizes!, "en");

    expect(block).toContain("### Package size");
    expect(block).toContain("### Notes");
    expect(block).toContain("Entry gzip");
    expect(block).not.toContain("<!-- comparison:");
  });

  it("should render several packages on one page", () => {
    const { results, sizes } = loadReportData();
    const attrs = results.find((result) => result.plugin === "plugin-attrs");
    const attrsSize = sizes?.packages["plugin-attrs"];

    expect(attrs).toBeDefined();
    expect(attrsSize).toBeDefined();

    const slimResult = { ...attrs!, plugin: "plugin-katex-slim", reference: "markdown-it-katex" };
    const multiSizes: SizeData = {
      packages: {
        "plugin-attrs": attrsSize,
        "plugin-katex-slim": {
          ...attrsSize!,
          plugin: "plugin-katex-slim",
          reference: "markdown-it-katex",
        },
      },
    };
    const block = renderComparisonBlock([attrs!, slimResult], multiSizes, "en");

    expect(block).toContain("### @mdit/plugin-attrs");
    expect(block).toContain("#### Correctness");
    expect(block.match(/^### /gmu)).toHaveLength(3);
  });
});
