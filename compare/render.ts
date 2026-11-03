import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { formatBytes, formatRatio } from "./format.ts";
import { RESULTS_DIR, SIZES_FILE, readSizeData } from "./size.ts";
import type { PackageSize, SizeData } from "./size.ts";
import type {
  BenchResult,
  ComparisonNote,
  ComparisonResult,
  CorrectnessStatus,
  MachineInfo,
  TestSuiteCaseResult,
  TestSuiteData,
  TestSuitePackageResult,
  VariantResult,
} from "./types.ts";

/** Directory of the comparison tooling */
const COMPARE_DIR: string = import.meta.dirname;

/** Committed result of running the package test suites against the reference implementations */
export const TEST_SUITES_FILE: string = path.join(
  path.resolve(COMPARE_DIR, "results"),
  "test-suites.json",
);

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
        .filter(
          (fileName) =>
            fileName.endsWith(".json") &&
            fileName !== "sizes.json" &&
            fileName !== "test-suites.json",
        )
        .sort()
        .map(
          (fileName) =>
            JSON.parse(readFileSync(path.join(resultsDir, fileName), "utf8")) as ComparisonResult,
        )
        .sort((resultA, resultB) => resultA.plugin.localeCompare(resultB.plugin))
    : [];

  return { results, sizes: readSizeData(sizesFile) };
};

/**
 * Load the committed test suite comparison data
 *
 * @param file - Test suite data file
 * @returns Test suite data, or `null` when it has not been generated yet
 */
export const loadTestSuiteData = (file: string = TEST_SUITES_FILE): TestSuiteData | null => {
  if (!existsSync(file)) return null;

  return JSON.parse(readFileSync(file, "utf8")) as TestSuiteData;
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

/** Generated data file consumed by the documentation site */
export const DOCS_DATA_FILE: string = path.resolve(
  COMPARE_DIR,
  "..",
  "docs",
  "src",
  ".vuepress",
  "data",
  "comparison.json",
);

/** Documentation pages that cover more than one package */
export const DOC_SLUG_OVERRIDES: Readonly<Record<string, string>> = {
  "plugin-katex-slim": "katex",
  "plugin-mathjax-slim": "mathjax",
};

/**
 * Get the documentation slug of a compared package
 *
 * @param plugin - Package directory under `packages/`
 * @returns Documentation slug, i.e. the page name without the `.md` extension
 */
export const getDocsSlug = (plugin: string): string =>
  DOC_SLUG_OVERRIDES[plugin] ?? plugin.replace(/^plugin-/u, "");

/**
 * Get the npm URL of a package
 *
 * @param packageName - Npm package name
 * @returns The npm package page URL
 */
const getNpmPackageUrl = (packageName: string): string => {
  const rootName = packageName.startsWith("@")
    ? packageName.split("/").slice(0, 2).join("/")
    : (packageName.split("/")[0] ?? packageName);

  return `${NPM_PACKAGE_URL}${rootName}`;
};

/** One benchmark case of the generated docs data */
export interface DocsBenchCase {
  /** Case name, e.g. `normal/small` */
  readonly case: string;
  /** Corpus kind */
  readonly kind: BenchResult["kind"];
  /** Corpus size */
  readonly size: BenchResult["size"];
  /** Current throughput in operations per second */
  readonly current: number;
  /** Reference throughput in operations per second */
  readonly reference: number;
  /** Throughput ratio: current / reference */
  readonly ratio: number;
}

/** One scaling series of the generated docs data */
export interface DocsScalingSeries {
  /** Series name */
  readonly case: string;
  /** Measured sizes */
  readonly sizes: readonly number[];
  /** Fitted exponent of the current package */
  readonly currentExponent: number;
  /** Fitted exponent of the reference package */
  readonly referenceExponent: number;
}

/** Test suite comparison of the generated docs data */
export interface DocsTestSuite {
  /** Number of counted tests (passed + failed) */
  readonly total: number;
  /** Number of passed tests */
  readonly passed: number;
  /** Number of failed tests */
  readonly failed: number;
  /** Number of skipped tests (not counted) */
  readonly skipped: number;
  /** Failed and skipped tests; passed tests are only counted */
  readonly tests: readonly TestSuiteCaseResult[];
  /** Collection error when the suite could not run */
  readonly error?: string;
}

/** One correctness case of the generated docs data */
export interface DocsCorrectnessCase {
  /** Case name */
  readonly name: string;
  /** Comparison status */
  readonly status: CorrectnessStatus;
  /** Bilingual explanation of a documented difference */
  readonly note?: ComparisonNote;
}

/** Correctness summary of the generated docs data */
export interface DocsCorrectness {
  /** Number of cases */
  readonly total: number;
  /** Number of identical outputs */
  readonly exact: number;
  /** Number of outputs identical after normalization */
  readonly normalized: number;
  /** Number of documented differences */
  readonly diff: number;
  /** Number of rendering errors */
  readonly error: number;
  /** Per case results */
  readonly cases: readonly DocsCorrectnessCase[];
}

/** One variant of the generated docs data */
export interface DocsVariant {
  /** Variant id */
  readonly id: string;
  /** Correctness summary */
  readonly correctness: DocsCorrectness;
  /** Benchmark cases */
  readonly bench: readonly DocsBenchCase[];
  /** Scaling series */
  readonly scaling: readonly DocsScalingSeries[];
}

/** One side of the package size comparison */
export interface DocsPackageSizeSide {
  /** Package name */
  readonly name: string;
  /** Package version */
  readonly version: string;
  /** Unpacked size in bytes */
  readonly unpackedBytes: number;
  /** Gzipped entry size in bytes */
  readonly entryGzipBytes: number;
}

/** Package size comparison of the generated docs data */
export interface DocsPackageSize {
  /** Current package */
  readonly current: DocsPackageSizeSide;
  /** Reference package */
  readonly upstream: DocsPackageSizeSide;
}

/** One compared package of the generated docs data */
export interface DocsComparisonPackage {
  /** Package directory under `packages/` */
  readonly plugin: string;
  /** Package name */
  readonly packageName: string;
  /** Documentation slug */
  readonly docsSlug: string;
  /** Reference npm package */
  readonly reference: string;
  /** Installed reference version */
  readonly referenceVersion: string;
  /** Variants */
  readonly variants: readonly DocsVariant[];
  /** Package size comparison */
  readonly size: DocsPackageSize | null;
  /** Result of running this package's tests against the reference */
  readonly testSuite: DocsTestSuite | null;
}

/** Aggregate totals of the generated docs data */
export interface DocsComparisonTotals {
  /** Number of compared packages */
  readonly packages: number;
  /** Number of compared variants */
  readonly variants: number;
  /** Number of correctness cases */
  readonly cases: number;
  /** Number of exactly matching cases */
  readonly exact: number;
  /** Number of cases that match after normalization */
  readonly normalized: number;
  /** Number of documented differences */
  readonly diff: number;
  /** Number of rendering errors */
  readonly error: number;
  /** Number of benchmark cases */
  readonly benchCases: number;
  /** Number of counted test suite tests */
  readonly testCases: number;
  /** Number of test suite tests that pass against the reference */
  readonly testPassed: number;
  /** Number of test suite tests that fail against the reference */
  readonly testFailed: number;
  /** Number of test suite tests skipped as internal-only differences */
  readonly testSkipped: number;
}

/** Data consumed by the documentation comparison page */
export interface DocsComparisonData {
  /** ISO timestamp of the latest comparison run */
  readonly generatedAt: string;
  /** Measurement date in `YYYY-MM-DD` form */
  readonly date: string;
  /** Machine information of the latest comparison run */
  readonly machine: MachineInfo;
  /** Measurement method notes, per locale */
  readonly methodNotes: Readonly<Record<ReportLocale, readonly string[]>>;
  /** Aggregate totals */
  readonly totals: DocsComparisonTotals;
  /** Compared packages, sorted by package directory */
  readonly packages: readonly DocsComparisonPackage[];
}

/** Measurement method notes rendered on the comparison page */
const METHOD_NOTES: Readonly<Record<ReportLocale, readonly string[]>> = {
  en: [
    "Correctness renders the same markdown with both implementations and compares the output byte for byte after a minimal normalization (attribute order; wrapper markup and generated ids only where both sides emit them by design). For variants without a custom renderer, the parsed token streams are compared as well — token metadata such as source maps is part of the public contract for plugins that build on top of these tokens. Every remaining difference is documented with a reason.",
    "Benchmark throughput and scaling numbers are medians of interleaved samples, so both sides run in the same process under the same load. Corpora are committed markdown files: `normal` is a realistic document with sparse syntax, `heavy` is dense plugin syntax; each is measured at three sizes.",
    "The test suite comparison runs each compared package's own unit tests against the reference implementation by swapping the built package entry for the reference package. Tests that only assert internal implementation details the reference does not provide are skipped with a reason and are not counted; every other failing test is a behavior difference between the two packages.",
    "Scaling exponents are fitted on log-log axes: ~1 is linear and ~2 is quadratic. The series are built to expose the known superlinear paths of the reference implementations.",
    "Package size covers the files published to npm: `dist/**`, `README`, `LICENSE*`, `package.json`, plus any extra file listed in the package `files` field. The reference size is the installed package directory without nested `node_modules`.",
    "Entry gzip is the gzipped size of the ESM entry: the resolved `exports` entry for the current package and the `module` / `exports.import` / `main` entry for the reference.",
  ],
  zh: [
    "正确性对比会用两个实现渲染同一段 Markdown，并在最小化归一化（属性顺序；仅当双方都按设计输出包裹标记和生成 id 时才归一化这些内容）后逐字节比较输出；对于未使用自定义渲染器的变体，还会比较解析后的 token 流——源码映射等 token 元数据对基于这些 token 的下游插件属于公共契约。其余每一处差异都会附带原因说明。",
    "基准性能与复杂度缩放数据为交错采样结果的中位数，因此两侧在同一进程、相同负载下运行。语料为仓库提交的 markdown 文件：`normal` 是语法较稀疏的真实文档，`heavy` 是语法密集的文档；每种语料在三个规模下测量。",
    "测试套件对比会把每个包的单元测试直接跑在参考实现上（用参考包替换插件入口）。只断言参考实现不存在的内部实现细节的测试会被标记为跳过并注明原因，不计入统计；其余失败测试都代表两个包之间的行为差异。",
    "拟合指数基于对数坐标计算：约 1 为线性增长，约 2 为二次增长。各缩放系列针对参考实现已知的超线性路径设计。",
    "包体积按发布到 npm 的文件计算：`dist/**`、`README`、`LICENSE*`、`package.json`，以及包 `files` 字段中列出的其他文件。参考包体积为已安装包目录的大小，不包含嵌套的 `node_modules`。",
    "入口 gzip 为 ESM 入口 gzip 后的大小：本包为 `exports` 解析出的入口，参考包为 `package.json` 中的 `module` / `exports.import` / `main` 入口。",
  ],
};

/**
 * Map a variant result to the generated docs data
 *
 * @param variant - Variant result
 * @returns The docs variant
 */
const mapDocsVariant = (variant: VariantResult): DocsVariant => ({
  id: variant.id,
  correctness: {
    total: variant.correctness.total,
    exact: variant.correctness.exact,
    normalized: variant.correctness.normalized,
    diff: variant.correctness.diff,
    error: variant.correctness.error,
    cases: variant.correctness.cases.map((testCase) => ({
      name: testCase.name,
      status: testCase.status,
      ...(testCase.note ? { note: testCase.note } : {}),
    })),
  },
  bench: variant.bench.map((benchCase) => ({
    case: benchCase.case,
    kind: benchCase.kind,
    size: benchCase.size,
    current: benchCase.current.opsPerSec,
    reference: benchCase.reference.opsPerSec,
    ratio: benchCase.ratio,
  })),
  scaling: variant.scaling.map((scalingCase) => ({
    case: scalingCase.case,
    sizes: scalingCase.sizes,
    currentExponent: scalingCase.currentExponent,
    referenceExponent: scalingCase.referenceExponent,
  })),
});

/**
 * Map a test suite result to the generated docs data
 *
 * Passed tests are only counted; only failed and skipped tests are rendered.
 *
 * @param suite - Test suite result
 * @returns The docs test suite, or `null` when the package was not run
 */
const mapDocsTestSuite = (suite: TestSuitePackageResult | undefined): DocsTestSuite | null =>
  suite == null
    ? null
    : {
        total: suite.total,
        passed: suite.passed,
        failed: suite.failed,
        skipped: suite.skipped,
        tests: suite.tests.filter((test) => test.status !== "passed"),
        ...(suite.error ? { error: suite.error } : {}),
      };

/**
 * Build the data consumed by the documentation comparison page
 *
 * @param data - Committed comparison data
 * @param testSuites - Committed test suite comparison data
 * @returns The generated docs data
 */
export const buildDocsComparisonData = (
  { results, sizes }: ReportData,
  testSuites: TestSuiteData | null = null,
): DocsComparisonData => {
  const packages = results.map((result): DocsComparisonPackage => {
    const size = sizes?.packages[result.plugin] ?? null;

    return {
      plugin: result.plugin,
      packageName: size?.current.name ?? `@mdit/${result.plugin}`,
      docsSlug: getDocsSlug(result.plugin),
      reference: result.reference,
      referenceVersion: result.referenceVersion,
      variants: result.variants.map(mapDocsVariant),
      testSuite: mapDocsTestSuite(
        testSuites?.packages.find((suite) => suite.plugin === result.plugin),
      ),
      size:
        size == null
          ? null
          : {
              current: {
                name: size.current.name,
                version: size.current.version,
                unpackedBytes: size.current.unpackedBytes,
                entryGzipBytes: size.current.entryGzipBytes,
              },
              upstream: {
                name: size.upstream.name,
                version: size.upstream.version,
                unpackedBytes: size.upstream.unpackedBytes,
                entryGzipBytes: size.upstream.entryGzipBytes,
              },
            },
    };
  });

  const variants = results.flatMap((result) => result.variants);
  const latest = results
    .map((result) => result.generatedAt)
    .sort()
    .at(-1);

  return {
    generatedAt: latest ?? "",
    date: latest?.slice(0, 10) ?? "",
    machine: results[0]?.machine ?? {
      platform: "",
      arch: "",
      node: "",
      cpu: "",
      memoryGB: 0,
    },
    methodNotes: METHOD_NOTES,
    totals: {
      packages: packages.length,
      variants: variants.length,
      cases: variants.reduce((total, variant) => total + variant.correctness.total, 0),
      exact: variants.reduce((total, variant) => total + variant.correctness.exact, 0),
      normalized: variants.reduce((total, variant) => total + variant.correctness.normalized, 0),
      diff: variants.reduce((total, variant) => total + variant.correctness.diff, 0),
      error: variants.reduce((total, variant) => total + variant.correctness.error, 0),
      benchCases: variants.reduce((total, variant) => total + variant.bench.length, 0),
      testCases: packages.reduce((total, pkg) => total + (pkg.testSuite?.total ?? 0), 0),
      testPassed: packages.reduce((total, pkg) => total + (pkg.testSuite?.passed ?? 0), 0),
      testFailed: packages.reduce((total, pkg) => total + (pkg.testSuite?.failed ?? 0), 0),
      testSkipped: packages.reduce((total, pkg) => total + (pkg.testSuite?.skipped ?? 0), 0),
    },
    packages,
  };
};

/** Options of a docs data write */
export interface WriteDocsDataOptions {
  /** Data file path */
  readonly dataFile?: string;
  /** Report data, defaults to the committed data */
  readonly reportData?: ReportData;
}

/**
 * Write the generated docs data file
 *
 * @param options - Write options
 * @returns The written data
 */
export const writeDocsComparisonData = ({
  dataFile = DOCS_DATA_FILE,
  reportData = loadReportData(),
}: WriteDocsDataOptions = {}): DocsComparisonData => {
  const data = buildDocsComparisonData(reportData, loadTestSuiteData());

  mkdirSync(path.dirname(dataFile), { recursive: true });
  writeFileSync(dataFile, `${JSON.stringify(data, null, 2)}\n`);

  return data;
};

/**
 * Render the per-page link to the comparison report
 *
 * @param locale - Report locale
 * @returns Markdown content between the comparison markers
 */
export const renderPluginComparisonLink = (locale: ReportLocale): string =>
  locale === "zh"
    ? "---\n\n> 与上游参考实现的完整对比见[对比报告](compare.md)。"
    : "---\n\n> See the [comparison report](compare.md) for the full upstream comparison.";

/** Options of a README comparison section */
export interface ReadmeComparisonOptions {
  /** URL of the comparison page in English */
  readonly compareUrl?: string;
  /** URL of the comparison page in Chinese */
  readonly zhCompareUrl?: string;
}

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
 * Render the comparison section of a package README
 *
 * The README keeps a compact summary; the full tables live on the dedicated comparison page.
 *
 * @param result - Comparison result
 * @param size - Package size data, omitted when it has not been generated yet
 * @param options - README links
 * @returns Markdown section without a trailing newline
 */
export const renderReadmeComparison = (
  result: ComparisonResult,
  size: PackageSize | null,
  { compareUrl, zhCompareUrl }: ReadmeComparisonOptions = {},
): string => {
  const { variants } = result;
  const total = variants.reduce((sum, variant) => sum + variant.correctness.total, 0);
  const exact = variants.reduce((sum, variant) => sum + variant.correctness.exact, 0);
  const normalized = variants.reduce((sum, variant) => sum + variant.correctness.normalized, 0);
  const diff = variants.reduce((sum, variant) => sum + variant.correctness.diff, 0);
  const error = variants.reduce((sum, variant) => sum + variant.correctness.error, 0);
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

  if (compareUrl) {
    const links = [`[English](${compareUrl})`];

    if (zhCompareUrl) links.push(`[中文](${zhCompareUrl})`);

    blocks.push(`See the full comparison report: ${links.join(" · ")}.`);
  }

  return blocks.join("\n\n");
};
