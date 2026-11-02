import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  formatBytes,
  formatExponent,
  formatOpsPerSec,
  formatRatio,
  normalizeInlineCodeSpans,
  renderTable,
} from "./format.ts";
import type { ColumnAlignment } from "./format.ts";
import { RESULTS_DIR, SIZES_FILE, readSizeData } from "./size.ts";
import type { PackageSize, SizeData } from "./size.ts";
import type {
  CorrectnessSummary,
  MachineInfo,
  BenchResult,
  ComparisonResult,
  ScalingResult,
  VariantResult,
} from "./types.ts";

/** Locale of a rendered report */
export type ReportLocale = "en" | "zh";

/** Comparison data shared by the README and docs generators */
export interface ReportData {
  /** Committed comparison results, sorted by package directory */
  readonly results: readonly ComparisonResult[];
  /** Committed size data, or `null` when it has not been generated yet */
  readonly sizes: SizeData | null;
}

/** Options of a report data load */
export interface LoadReportDataOptions {
  /** Directory that contains the result files */
  readonly resultsDir?: string;
  /** Size data file */
  readonly sizesFile?: string;
}

/**
 * Load the committed comparison data
 *
 * @param options - Load options
 * @returns Comparison results and size data
 */
export const loadReportData = ({
  resultsDir = RESULTS_DIR,
  sizesFile = SIZES_FILE,
}: LoadReportDataOptions = {}): ReportData => {
  const results = existsSync(resultsDir)
    ? readdirSync(resultsDir)
        .filter((fileName) => fileName.endsWith(".json") && fileName !== "sizes.json")
        .sort()
        .map(
          (fileName) =>
            JSON.parse(readFileSync(path.join(resultsDir, fileName), "utf8")) as ComparisonResult,
        )
        .sort((resultA, resultB) => resultA.plugin.localeCompare(resultB.plugin))
    : [];

  return { results, sizes: readSizeData(sizesFile) };
};

export {
  formatBytes,
  formatExponent,
  formatOpsPerSec,
  formatRatio,
  normalizeInlineCodeSpans,
  renderTable,
} from "./format.ts";

/** URL prefix of npm package pages */
const NPM_PACKAGE_URL = "https://www.npmjs.com/package/";

/** Order of benchmark corpus kinds in reports */
const KIND_ORDER: Readonly<Record<BenchResult["kind"], number>> = { normal: 0, heavy: 1 };

/** Order of benchmark corpus sizes in reports */
const SIZE_ORDER: Readonly<Record<BenchResult["size"], number>> = {
  small: 0,
  medium: 1,
  large: 2,
};

/** Text templates of one report locale */
interface ReportLabels {
  /** Heading of the comparison section */
  readonly comparison: string;
  /** Heading of the correctness section */
  readonly correctness: string;
  /** Heading of the benchmark section */
  readonly benchmarks: string;
  /** Heading of the scaling section */
  readonly scaling: string;
  /** Heading of the package size section */
  readonly packageSize: string;
  /** Heading of the notes section */
  readonly notes: string;
  /** Column header of the variant */
  readonly variant: string;
  /** Column header of the case count */
  readonly cases: string;
  /** Column header of exactly matching cases */
  readonly exact: string;
  /** Column header of cases that match after normalization */
  readonly normalized: string;
  /** Column header of documented differences */
  readonly documentedDiffs: string;
  /** Column header of rendering errors */
  readonly errors: string;
  /** Column header of a benchmark case */
  readonly caseName: string;
  /** Column header of the current throughput */
  readonly currentOpsPerSec: string;
  /** Column header of the reference throughput */
  readonly referenceOpsPerSec: string;
  /** Column header of the throughput ratio */
  readonly ratio: string;
  /** Column header of a scaling series */
  readonly series: string;
  /** Column header of the measured sizes */
  readonly sizes: string;
  /** Column header of the current exponent */
  readonly currentExponent: string;
  /** Column header of the reference exponent */
  readonly referenceExponent: string;
  /** Column header of the package */
  readonly package: string;
  /** Column header of the unpacked size */
  readonly unpackedSize: string;
  /** Column header of the gzipped entry */
  readonly entryGzip: string;
  /** Suffix of the current package */
  readonly currentSuffix: string;
  /** Suffix of the reference package */
  readonly referenceSuffix: string;
  /** Summary of a fully exact comparison */
  readonly allExact: (total: number) => string;
  /** Summary of a comparison that matches after normalization */
  readonly allNormalized: (total: number) => string;
  /** Introduction of documented differences */
  readonly documentedDifferences: string;
  /** Introduction of rendering errors */
  readonly renderErrors: string;
  /** Summary of the benchmark table */
  readonly benchmarkSummary: (ratio: string, count: number) => string;
  /** Explanation of the fitted scaling exponents */
  readonly scalingNote: string;
  /** Introduction of one package comparison */
  readonly intro: (result: ComparisonResult) => string;
  /** Introduction of several package comparisons */
  readonly multiIntro: string;
  /** Notes about the measurement method */
  readonly methodNotes: readonly string[];
}

/**
 * Format the measurement environment of a result
 *
 * @param machine - Machine information
 * @returns Human readable environment, e.g. `Node.js v26.13.0, Apple M4 (darwin arm64)`
 */
const formatEnvironment = (machine: MachineInfo): string =>
  `Node.js ${machine.node}, ${machine.cpu} (${machine.platform} ${machine.arch})`;

/**
 * Format the measurement date of a result
 *
 * @param generatedAt - ISO timestamp of the run
 * @returns The date part, e.g. `2026-11-02`
 */
const formatMeasurementDate = (generatedAt: string): string =>
  /^\d{4}-\d{2}-\d{2}/u.test(generatedAt) ? generatedAt.slice(0, 10) : generatedAt;

/**
 * Get the npm package page of a reference package
 *
 * @param reference - Reference npm package, subpath exports are allowed
 * @returns The npm package URL
 */
const getNpmPackageUrl = (reference: string): string => {
  const rootName = reference.startsWith("@")
    ? reference.split("/").slice(0, 2).join("/")
    : (reference.split("/")[0] ?? reference);

  return `${NPM_PACKAGE_URL}${rootName}`;
};

/** Text templates of every supported report locale */
const LABELS: Readonly<Record<ReportLocale, ReportLabels>> = {
  en: {
    comparison: "Comparison",
    correctness: "Correctness",
    benchmarks: "Benchmarks",
    scaling: "Scaling",
    packageSize: "Package size",
    notes: "Notes",
    variant: "Variant",
    cases: "Cases",
    exact: "Exact",
    normalized: "Normalized",
    documentedDiffs: "Documented diffs",
    errors: "Errors",
    caseName: "Case",
    currentOpsPerSec: "Current (ops/s)",
    referenceOpsPerSec: "Reference (ops/s)",
    ratio: "Ratio",
    series: "Series",
    sizes: "Sizes",
    currentExponent: "Current exponent",
    referenceExponent: "Reference exponent",
    package: "Package",
    unpackedSize: "Unpacked size",
    entryGzip: "Entry gzip",
    currentSuffix: " (current)",
    referenceSuffix: " (reference)",
    allExact: (total) => `All ${total} cases match the reference output exactly.`,
    allNormalized: (total) => `All ${total} cases match the reference output after normalization.`,
    documentedDifferences: "The following cases are documented differences:",
    renderErrors: "The following cases failed to render:",
    benchmarkSummary: (ratio, count) =>
      `Geometric mean throughput ratio: ${ratio} across ${count} cases; above 1× means the current package is faster.`,
    scalingNote: "Exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic.",
    intro: (result) =>
      `Compared against the upstream [\`${result.reference}\`](${getNpmPackageUrl(result.reference)}) package \`${result.referenceVersion}\`. Benchmarks were measured with ${formatEnvironment(result.machine)} on ${formatMeasurementDate(result.generatedAt)}. Every table below is generated from the committed comparison data.`,
    multiIntro: "The tables below compare each package with its upstream reference implementation.",
    methodNotes: [
      "Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.",
      "Entry gzip is the gzipped size of the ESM entry: `dist/index.js` for the current package and the `module` / `exports.import` / `main` entry for the reference.",
      "Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run under the same load.",
    ],
  },
  zh: {
    comparison: "对比",
    correctness: "正确性",
    benchmarks: "基准性能",
    scaling: "复杂度缩放",
    packageSize: "包体积",
    notes: "说明",
    variant: "变体",
    cases: "用例数",
    exact: "完全一致",
    normalized: "规范化后一致",
    documentedDiffs: "已记录差异",
    errors: "渲染错误",
    caseName: "用例",
    currentOpsPerSec: "当前 (ops/s)",
    referenceOpsPerSec: "参考 (ops/s)",
    ratio: "比值",
    series: "系列",
    sizes: "输入规模",
    currentExponent: "当前拟合指数",
    referenceExponent: "参考拟合指数",
    package: "包",
    unpackedSize: "解压体积",
    entryGzip: "入口 gzip",
    currentSuffix: "（当前）",
    referenceSuffix: "（参考）",
    allExact: (total) => `${total} 个用例的输出与参考包完全一致。`,
    allNormalized: (total) => `${total} 个用例在规范化后与参考包一致。`,
    documentedDifferences: "以下用例是已记录的差异：",
    renderErrors: "以下用例渲染失败：",
    benchmarkSummary: (ratio, count) =>
      `几何平均吞吐量比值：${ratio}（共 ${count} 个用例）；大于 1× 表示当前包更快。`,
    scalingNote: "拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。",
    intro: (result) =>
      `与上游 [\`${result.reference}\`](${getNpmPackageUrl(result.reference)}) \`${result.referenceVersion}\` 包对比。基准测试运行于 ${formatEnvironment(result.machine)}，测量日期为 ${formatMeasurementDate(result.generatedAt)}。下表由仓库提交的对比数据生成。`,
    multiIntro: "下表将每个包与其上游参考实现进行对比。",
    methodNotes: [
      "包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。",
      "入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `dist/index.js`，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。",
      "基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧运行在相同负载下。",
    ],
  },
};

/**
 * Compute the geometric mean of a list of positive numbers
 *
 * @param values - Positive numbers
 * @returns The geometric mean, or `Number.NaN` when the list is empty
 */
const geometricMean = (values: readonly number[]): number => {
  if (values.length === 0) return Number.NaN;

  return Math.exp(values.reduce((sum, value) => sum + Math.log(value), 0) / values.length);
};

/**
 * Sum a numeric field of all variants
 *
 * @param variants - Variant results
 * @param field - Field of the correctness summary
 * @returns The sum over all variants
 */
const sumCorrectness = (
  variants: readonly VariantResult[],
  field: Exclude<keyof CorrectnessSummary, "cases">,
): number => variants.reduce((total, variant) => total + variant.correctness[field], 0);

/**
 * Format a heading line
 *
 * @param level - Heading level
 * @param text - Heading text
 * @returns The Markdown heading
 */
const renderHeading = (level: number, text: string): string => `${"#".repeat(level)} ${text}`;

/**
 * Render the correctness section of one package
 *
 * @param result - Comparison result
 * @param labels - Locale labels
 * @param level - Heading level of the section
 * @returns Markdown section, or `null` when there is no correctness data
 */
const renderCorrectnessSection = (
  result: ComparisonResult,
  labels: ReportLabels,
  level: number,
): string | null => {
  const cases = result.variants.flatMap((variant) =>
    variant.correctness.cases.map((caseResult) => ({ variant: variant.id, result: caseResult })),
  );

  if (cases.length === 0) return null;

  const multipleVariants = result.variants.length > 1;
  const hasErrors = cases.some(({ result: caseResult }) => caseResult.status === "error");
  const headers = [
    ...(multipleVariants ? [labels.variant] : []),
    labels.cases,
    labels.exact,
    labels.normalized,
    labels.documentedDiffs,
    ...(hasErrors ? [labels.errors] : []),
  ];
  const rows = result.variants.map((variant) => [
    ...(multipleVariants ? [variant.id] : []),
    String(variant.correctness.total),
    String(variant.correctness.exact),
    String(variant.correctness.normalized),
    String(variant.correctness.diff),
    ...(hasErrors ? [String(variant.correctness.error)] : []),
  ]);
  const alignments: ColumnAlignment[] = [
    ...(multipleVariants ? (["left"] as const) : []),
    "right",
    "right",
    "right",
    "right",
    ...(hasErrors ? (["right"] as const) : []),
  ];
  const blocks = [renderHeading(level, labels.correctness), renderTable(headers, rows, alignments)];

  const total = sumCorrectness(result.variants, "total");
  const normalized = sumCorrectness(result.variants, "normalized");
  const diff = sumCorrectness(result.variants, "diff");
  const error = sumCorrectness(result.variants, "error");

  if (diff === 0 && error === 0)
    blocks.push(normalized > 0 ? labels.allNormalized(total) : labels.allExact(total));

  const documentedDiffs = cases.filter(({ result: caseResult }) => caseResult.status === "diff");

  if (documentedDiffs.length > 0) {
    blocks.push(
      labels.documentedDifferences,
      documentedDiffs
        .map(({ variant, result: caseResult }) => {
          const name = multipleVariants ? `${variant}/${caseResult.name}` : caseResult.name;

          return `- \`${name}\` — ${normalizeInlineCodeSpans(caseResult.note ?? "—")}`;
        })
        .join("\n"),
    );
  }

  const errors = cases.filter(({ result: caseResult }) => caseResult.status === "error");

  if (errors.length > 0) {
    blocks.push(
      labels.renderErrors,
      errors
        .map(({ variant, result: caseResult }) => {
          const name = multipleVariants ? `${variant}/${caseResult.name}` : caseResult.name;

          return `- \`${name}\` — ${normalizeInlineCodeSpans(caseResult.error ?? "—")}`;
        })
        .join("\n"),
    );
  }

  return blocks.join("\n\n");
};

/** A benchmark result together with its variant index */
interface VariantBenchResult {
  /** Index of the variant in the result file */
  readonly variantIndex: number;
  /** Variant id */
  readonly variant: string;
  /** Benchmark result */
  readonly bench: BenchResult;
}

/**
 * Render the benchmark section of one package
 *
 * @param result - Comparison result
 * @param labels - Locale labels
 * @param level - Heading level of the section
 * @returns Markdown section, or `null` when there is no benchmark data
 */
const renderBenchSection = (
  result: ComparisonResult,
  labels: ReportLabels,
  level: number,
): string | null => {
  const benches: VariantBenchResult[] = result.variants.flatMap((variant, variantIndex) =>
    variant.bench.map((bench) => ({ variantIndex, variant: variant.id, bench })),
  );

  if (benches.length === 0) return null;

  benches.sort(
    (benchA, benchB) =>
      benchA.variantIndex - benchB.variantIndex ||
      KIND_ORDER[benchA.bench.kind] - KIND_ORDER[benchB.bench.kind] ||
      SIZE_ORDER[benchA.bench.size] - SIZE_ORDER[benchB.bench.size] ||
      benchA.bench.case.localeCompare(benchB.bench.case),
  );

  const multipleVariants = result.variants.length > 1;
  const headers = [
    ...(multipleVariants ? [labels.variant] : []),
    labels.caseName,
    labels.currentOpsPerSec,
    labels.referenceOpsPerSec,
    labels.ratio,
  ];
  const rows = benches.map(({ variant, bench }) => [
    ...(multipleVariants ? [variant] : []),
    bench.case,
    formatOpsPerSec(bench.current.opsPerSec),
    formatOpsPerSec(bench.reference.opsPerSec),
    formatRatio(bench.ratio),
  ]);
  const alignments: ColumnAlignment[] = [
    ...(multipleVariants ? (["left"] as const) : []),
    "left",
    "right",
    "right",
    "right",
  ];
  const blocks = [renderHeading(level, labels.benchmarks), renderTable(headers, rows, alignments)];
  const ratios = benches.map(({ bench }) => bench.ratio).filter((ratio) => ratio > 0);

  if (ratios.length > 0) {
    const summary = labels.benchmarkSummary(formatRatio(geometricMean(ratios)), ratios.length);

    blocks.push(summary);
  }

  return blocks.join("\n\n");
};

/** A scaling result together with its variant index */
interface VariantScalingResult {
  /** Index of the variant in the result file */
  readonly variantIndex: number;
  /** Variant id */
  readonly variant: string;
  /** Scaling result */
  readonly scaling: ScalingResult;
}

/**
 * Render the scaling section of one package
 *
 * @param result - Comparison result
 * @param labels - Locale labels
 * @param level - Heading level of the section
 * @returns Markdown section, or `null` when there is no scaling data
 */
const renderScalingSection = (
  result: ComparisonResult,
  labels: ReportLabels,
  level: number,
): string | null => {
  const scalings: VariantScalingResult[] = result.variants.flatMap((variant, variantIndex) =>
    variant.scaling.map((scaling) => ({ variantIndex, variant: variant.id, scaling })),
  );

  if (scalings.length === 0) return null;

  scalings.sort(
    (scalingA, scalingB) =>
      scalingA.variantIndex - scalingB.variantIndex ||
      scalingA.scaling.case.localeCompare(scalingB.scaling.case),
  );

  const multipleVariants = result.variants.length > 1;
  const headers = [
    ...(multipleVariants ? [labels.variant] : []),
    labels.series,
    labels.sizes,
    labels.currentExponent,
    labels.referenceExponent,
  ];
  const rows = scalings.map(({ variant, scaling }) => {
    const row = [
      scaling.case,
      scaling.sizes.join(" / "),
      formatExponent(scaling.currentExponent),
      formatExponent(scaling.referenceExponent),
    ];

    if (multipleVariants) row.unshift(variant);

    return row;
  });

  const alignments: ColumnAlignment[] = [
    ...(multipleVariants ? (["left"] as const) : []),
    "left",
    "left",
    "right",
    "right",
  ];

  return [
    renderHeading(level, labels.scaling),
    renderTable(headers, rows, alignments),
    labels.scalingNote,
  ].join("\n\n");
};

/**
 * Render the package size section of one package
 *
 * @param size - Package size data
 * @param labels - Locale labels
 * @param level - Heading level of the section
 * @returns Markdown section
 */
const renderSizeSection = (size: PackageSize, labels: ReportLabels, level: number): string => {
  const rows = [
    [
      `${size.current.name}${labels.currentSuffix}`,
      formatBytes(size.current.unpackedBytes),
      formatBytes(size.current.entryGzipBytes),
    ],
    [
      `${size.upstream.name}@${size.upstream.version}${labels.referenceSuffix}`,
      formatBytes(size.upstream.unpackedBytes),
      formatBytes(size.upstream.entryGzipBytes),
    ],
  ];

  return [
    renderHeading(level, labels.packageSize),
    renderTable([labels.package, labels.unpackedSize, labels.entryGzip], rows, [
      "left",
      "right",
      "right",
    ]),
  ].join("\n\n");
};

/**
 * Render the notes section of a comparison block
 *
 * @param results - Comparison results
 * @param sizes - Size data
 * @param labels - Locale labels
 * @param single - Whether the block documents a single package
 * @returns Markdown section
 */
const renderNotesSection = (
  results: readonly ComparisonResult[],
  sizes: SizeData,
  labels: ReportLabels,
  single: boolean,
): string => {
  const bullets: string[] = [];

  for (const result of results) {
    const packageName = sizes.packages[result.plugin]?.current.name ?? result.plugin;

    for (const note of result.notes) {
      bullets.push(
        single
          ? `- ${normalizeInlineCodeSpans(note)}`
          : `- **${packageName}**: ${normalizeInlineCodeSpans(note)}`,
      );
    }
  }

  for (const note of labels.methodNotes) bullets.push(`- ${note}`);

  return [renderHeading(3, labels.notes), bullets.join("\n")].join("\n\n");
};

/**
 * Render the comparison block of a documentation page
 *
 * The result is deterministic: it only depends on the committed result and size data, so the
 * generators produce byte-identical output on every run.
 *
 * @param results - Comparison results covered by the page, sorted by package directory
 * @param sizes - Committed size data
 * @param locale - Report locale
 * @returns Markdown content between the comparison markers
 */
export const renderComparisonBlock = (
  results: readonly ComparisonResult[],
  sizes: SizeData,
  locale: ReportLocale,
): string => {
  const labels = LABELS[locale];
  const single = results.length === 1;
  const level = single ? 3 : 4;
  const blocks = [renderHeading(2, labels.comparison)];

  if (!single) blocks.push(labels.multiIntro);

  for (const result of results) {
    const size = sizes.packages[result.plugin];

    if (size == null) {
      throw new Error(
        `[compare] \`scripts/compare/results/sizes.json\` has no size data for ${result.plugin}. Run \`pnpm run compare:sizes\` first.`,
      );
    }

    if (!single) blocks.push(renderHeading(3, size.current.name));

    blocks.push(labels.intro(result));

    for (const section of [
      renderCorrectnessSection(result, labels, level),
      renderBenchSection(result, labels, level),
      renderScalingSection(result, labels, level),
      renderSizeSection(size, labels, level),
    ])
      if (section) blocks.push(section);
  }

  blocks.push(renderNotesSection(results, sizes, labels, single));

  return blocks.join("\n\n");
};

/** Options of a README comparison section */
export interface ReadmeComparisonOptions {
  /** URL of the English documentation page */
  readonly docsUrl?: string;
  /** URL of the Chinese documentation page */
  readonly zhDocsUrl?: string;
}

/**
 * Render the comparison section of a package README
 *
 * The README is bilingual: the section heading is bilingual while the summary keeps the English
 * body used by the other generated README sections.
 *
 * @param result - Comparison result
 * @param size - Package size data, omitted when it has not been generated yet
 * @param options - README links
 * @returns Markdown section without a trailing newline
 */
export const renderReadmeComparison = (
  result: ComparisonResult,
  size: PackageSize | null,
  { docsUrl, zhDocsUrl }: ReadmeComparisonOptions = {},
): string => {
  const { variants } = result;
  const total = sumCorrectness(variants, "total");
  const exact = sumCorrectness(variants, "exact");
  const normalized = sumCorrectness(variants, "normalized");
  const diff = sumCorrectness(variants, "diff");
  const error = sumCorrectness(variants, "error");
  const ratios = variants
    .flatMap((variant) => variant.bench.map((bench) => bench.ratio))
    .filter((ratio) => ratio > 0);
  const bullets: string[] = [];

  if (total > 0) {
    const details = [
      normalized > 0 ? `${normalized} matching after normalization` : "",
      diff > 0 ? `${diff} documented differences` : "",
      error > 0 ? `${error} rendering errors` : "",
    ].filter(Boolean);

    bullets.push(
      `- Correctness: **${exact}/${total}** cases match the reference exactly${
        details.length > 0 ? ` (${details.join(", ")})` : ""
      }.`,
    );
  }

  if (ratios.length > 0) {
    bullets.push(
      `- Throughput: **${formatRatio(geometricMean(ratios))}** the reference (geometric mean across ${ratios.length} benchmark cases; above 1× means faster).`,
    );
  }

  if (size) {
    bullets.push(
      `- Package size: **${formatBytes(size.current.unpackedBytes)}** unpacked and **${formatBytes(size.current.entryGzipBytes)}** gzip entry, versus **${formatBytes(size.upstream.unpackedBytes)}** and **${formatBytes(size.upstream.entryGzipBytes)}** for the reference.`,
    );
  }

  const blocks = [
    "## Comparison / 对比",
    `Compared against the upstream [\`${result.reference}\`](${getNpmPackageUrl(result.reference)}) package \`${result.referenceVersion}\`.`,
  ];

  if (bullets.length > 0) blocks.push(bullets.join("\n"));

  if (docsUrl) {
    const links = [`[English docs](${docsUrl})`];

    if (zhDocsUrl) links.push(`[中文文档](${zhDocsUrl})`);

    blocks.push(
      `See the comparison tables in the ${links.join(" or ")} for details and methodology.`,
    );
  }

  return blocks.join("\n\n");
};
