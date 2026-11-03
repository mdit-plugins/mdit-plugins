<script setup lang="ts">
// The report keeps its data mapping, copy and view logic in one SFC.
// oxlint-disable max-lines
import { computed, ref, watch } from "vue";

import data from "../data/comparison.json";

type Locale = "en" | "zh";

type CorrectnessStatus = "exact" | "normalized" | "diff" | "error";

type CaseCategory = "reference-error" | "difference";

type SkipCategory = "feature-gap" | "internal" | "packaging";

interface ComparisonNote {
  readonly en: string;
  readonly zh: string;
}

interface ComparisonIssue {
  readonly id: string;
  readonly category?: CaseCategory;
  readonly note?: ComparisonNote;
  readonly cases?: readonly string[];
}

interface CorrectnessCase {
  readonly name: string;
  readonly status: CorrectnessStatus;
  readonly issue?: string;
  readonly category?: CaseCategory;
  readonly note?: ComparisonNote;
}

interface Correctness {
  readonly total: number;
  readonly exact: number;
  readonly normalized: number;
  readonly diff: number;
  readonly referenceErrors?: number;
  readonly differences?: number;
  readonly issues?: readonly ComparisonIssue[];
  readonly error: number;
  readonly cases: readonly CorrectnessCase[];
}

interface BenchCase {
  readonly case: string;
  readonly kind: string;
  readonly size: string;
  readonly current: number;
  readonly reference: number;
  readonly ratio: number;
}

interface ScalingSeries {
  readonly case: string;
  readonly sizes: readonly number[];
  readonly currentExponent: number;
  readonly referenceExponent: number;
}

interface Variant {
  readonly id: string;
  readonly correctness: Correctness;
  readonly bench: readonly BenchCase[];
  readonly scaling: readonly ScalingSeries[];
}

interface PackageSizeSide {
  readonly name: string;
  readonly version: string;
  readonly unpackedBytes: number;
  readonly entryFileCount: number;
  readonly entryGzipBytes: number;
}

interface PackageSize {
  readonly current: PackageSizeSide;
  readonly upstream: PackageSizeSide;
}

type TestSuiteStatus = "passed" | "failed" | "skipped";

interface TestSuiteCase {
  readonly file: string;
  readonly name: string;
  readonly status: TestSuiteStatus;
  readonly message?: string;
  readonly skipCategory?: SkipCategory;
  readonly skipReason?: ComparisonNote;
}

interface TestSuite {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly skippedByCategory?: Readonly<Partial<Record<SkipCategory, number>>>;
  readonly tests: readonly TestSuiteCase[];
  readonly error?: string;
}

interface ComparisonPackage {
  readonly plugin: string;
  readonly packageName: string;
  readonly docsSlug: string;
  readonly reference: string;
  readonly referenceVersion: string;
  readonly variants: readonly Variant[];
  readonly testSuite: TestSuite | null;
  readonly size: PackageSize | null;
}

interface MachineInfo {
  readonly platform: string;
  readonly arch: string;
  readonly node: string;
  readonly cpu: string;
  readonly memoryGB: number;
}

interface ComparisonTotals {
  readonly packages: number;
  readonly variants: number;
  readonly cases: number;
  readonly exact: number;
  readonly normalized: number;
  readonly diff: number;
  readonly referenceErrors?: number;
  readonly differences?: number;
  readonly error: number;
  readonly benchCases: number;
  readonly testCases: number;
  readonly testPassed: number;
  readonly testFailed: number;
  readonly testSkipped: number;
  readonly testSkippedFeatureGap?: number;
  readonly testSkippedInternal?: number;
  readonly testSkippedPackaging?: number;
}

interface ComparisonData {
  readonly generatedAt: string;
  readonly date: string;
  readonly machine: MachineInfo;
  readonly methodNotes: Readonly<Record<Locale, readonly string[]>>;
  readonly totals: ComparisonTotals;
  readonly packages: readonly ComparisonPackage[];
}

interface CorrectnessTotals {
  readonly total: number;
  readonly exact: number;
  readonly referenceErrors: number;
  readonly differences: number;
}

interface IssueGroup {
  readonly id: string;
  readonly category: CaseCategory;
  readonly note?: ComparisonNote;
  readonly cases: readonly string[];
}

interface PackageRow {
  readonly pkg: ComparisonPackage;
  readonly correctness: CorrectnessTotals;
  readonly ratio: number;
}

interface InlineSegment {
  readonly text: string;
  readonly code: boolean;
}

interface Copy {
  readonly packages: string;
  readonly packagesUnit: string;
  readonly variantsUnit: string;
  readonly correctness: string;
  readonly casesUnit: string;
  readonly exact: string;
  readonly normalized: string;
  readonly referenceErrors: string;
  readonly differences: string;
  readonly referenceErrorsShort: string;
  readonly differencesShort: string;
  readonly renderingErrors: string;
  readonly errorsShort: string;
  readonly benchmarks: string;
  readonly benchmarkCasesUnit: string;
  readonly benchmarkMeta: string;
  readonly ourTestSuites: string;
  readonly testSuiteTitle: string;
  readonly testsPass: string;
  readonly passed: string;
  readonly failed: string;
  readonly featureGaps: string;
  readonly featureGapTests: string;
  readonly internalSkipped: string;
  readonly packagingSkipped: string;
  readonly skippedAggregatePrefix: string;
  readonly failedTests: string;
  readonly allTestsPass: string;
  readonly testSuiteError: string;
  readonly measurement: string;
  readonly filterLabel: string;
  readonly filterPlaceholder: string;
  readonly onlyDifferences: string;
  readonly variant: string;
  readonly allVariants: string;
  readonly showing: string;
  readonly package: string;
  readonly reference: string;
  readonly throughput: string;
  readonly throughputHint: string;
  readonly showDetails: string;
  readonly hideDetails: string;
  readonly noResults: string;
  readonly issueSectionTitle: string;
  readonly noIssues: string;
  readonly noNote: string;
  readonly casesLabel: string;
  readonly categories: Readonly<Record<CaseCategory, string>>;
  readonly caseLabel: string;
  readonly currentOps: string;
  readonly referenceOps: string;
  readonly ratio: string;
  readonly scaling: string;
  readonly series: string;
  readonly sizes: string;
  readonly currentExponent: string;
  readonly referenceExponent: string;
  readonly superlinear: string;
  readonly packageSize: string;
  readonly metric: string;
  readonly current: string;
  readonly entryGzip: string;
  readonly sizeUnavailable: string;
  readonly methodology: string;
}

const COPY: Readonly<Record<Locale, Copy>> = {
  en: {
    packages: "Packages",
    packagesUnit: "packages",
    variantsUnit: "variants",
    correctness: "Correctness",
    casesUnit: "cases",
    exact: "exact",
    normalized: "normalized",
    referenceErrors: "reference errors",
    differences: "differences",
    referenceErrorsShort: "errors",
    differencesShort: "diffs",
    renderingErrors: "rendering errors",
    errorsShort: "errors",
    benchmarks: "Benchmarks",
    benchmarkCasesUnit: "benchmark cases",
    benchmarkMeta: "normal + heavy corpora · small / medium / large",
    ourTestSuites: "Our test suites",
    correctnessTests: "Correctness & tests",
    correctnessTestsHint:
      "Our package passes all counted tests; the second number is how many of them the reference passes.",
    exactShort: "exact",
    vs: "vs",
    testSuiteTitle: "Our test suite against the reference",
    testsPass: "tests pass",
    passed: "passed",
    failed: "failed",
    featureGaps: "feature gaps",
    featureGapTests: "Feature-gap tests",
    internalSkipped: "internal tests skipped",
    packagingSkipped: "packaging tests skipped",
    skippedAggregatePrefix: "+",
    failedTests: "Failed tests",
    allTestsPass: "All counted tests pass against the reference.",
    testSuiteError: "Test suite could not run",
    measurement: "Measurement",
    filterLabel: "Filter packages",
    filterPlaceholder: "Filter by package or reference…",
    onlyDifferences: "Only packages with reference errors or differences",
    variant: "Variant",
    allVariants: "All variants",
    showing: "Showing",
    package: "Package",
    reference: "Reference",
    throughput: "Throughput",
    throughputHint:
      "Geometric mean of current / reference throughput across all variants and benchmark cases. Above 1× means faster.",
    entryGzipHeader: "Entry gzip",
    showDetails: "Show details for",
    hideDetails: "Hide details for",
    noResults: "No package matches the current filters.",
    issueSectionTitle: "Reference errors and differences",
    noIssues: "No reference errors or differences.",
    noNote: "No note provided.",
    casesLabel: "Cases:",
    moreCases: (count: number) => `+${count} more`,
    categories: {
      "reference-error": "Reference error",
      difference: "Difference",
    },
    caseLabel: "Case",
    currentOps: "Current (ops/s)",
    referenceOps: "Reference (ops/s)",
    ratio: "Ratio",
    scaling: "Complexity scaling",
    series: "Series",
    sizes: "Sizes",
    currentExponent: "Current exponent",
    referenceExponent: "Reference exponent",
    superlinear: "superlinear",
    packageSize: "Import cost (entry gzip)",
    metric: "Metric",
    current: "Current",
    entryGzip: "Entry gzip",
    entryFiles: "Entry files",
    sizeUnavailable: "Package size data is not available for this package.",
    methodology: "Methodology",
  },
  zh: {
    packages: "包",
    packagesUnit: "个包",
    variantsUnit: "个变体",
    correctness: "正确性",
    casesUnit: "个用例",
    exact: "完全一致",
    normalized: "归一化一致",
    referenceErrors: "参考包错误",
    differences: "差异",
    referenceErrorsShort: "参考包错误",
    differencesShort: "差异",
    renderingErrors: "渲染错误",
    errorsShort: "错误",
    benchmarks: "基准测试",
    benchmarkCasesUnit: "个基准用例",
    benchmarkMeta: "normal + heavy 语料 · 小 / 中 / 大 三种规模",
    ourTestSuites: "我们的测试套件",
    correctnessTests: "正确性与测试",
    correctnessTestsHint: "本包通过全部计入的测试；第二个数字是参考包通过的数量。",
    exactShort: "完全一致",
    vs: "对比",
    testSuiteTitle: "我们的测试套件与参考实现对比",
    testsPass: "个测试通过",
    passed: "通过",
    failed: "失败",
    featureGaps: "功能缺失",
    featureGapTests: "功能缺失的测试",
    internalSkipped: "个内部实现测试跳过",
    packagingSkipped: "个打包相关测试跳过",
    skippedAggregatePrefix: "另有 ",
    failedTests: "失败的测试",
    allTestsPass: "所有计入的测试均在参考实现上通过。",
    testSuiteError: "测试套件无法运行",
    measurement: "测量",
    filterLabel: "筛选包",
    filterPlaceholder: "按包名或参考包筛选…",
    onlyDifferences: "仅显示有参考包错误或差异的包",
    variant: "变体",
    allVariants: "全部变体",
    showing: "显示",
    package: "包",
    reference: "参考包",
    throughput: "吞吐量",
    throughputHint: "所有变体与基准用例的当前 / 参考吞吐量几何平均值；大于 1× 表示更快。",
    showDetails: "展开详情：",
    hideDetails: "收起详情：",
    noResults: "没有匹配当前筛选条件的包。",
    issueSectionTitle: "参考包错误与差异",
    noIssues: "没有参考包错误或差异。",
    noNote: "未提供说明。",
    casesLabel: "涉及用例：",
    moreCases: (count: number) => `另有 ${count} 个`,
    categories: {
      "reference-error": "参考包错误",
      difference: "差异",
    },
    caseLabel: "用例",
    currentOps: "本包（ops/s）",
    referenceOps: "参考包（ops/s）",
    ratio: "比值",
    scaling: "复杂度缩放",
    series: "系列",
    sizes: "规模",
    currentExponent: "本包指数",
    referenceExponent: "参考包指数",
    superlinear: "超线性",
    packageSize: "入口体积（entry gzip）",
    metric: "指标",
    current: "本包",
    entryGzip: "入口 gzip",
    entryFiles: "入口文件数",
    sizeUnavailable: "该包暂无包体积数据。",
    methodology: "测量方法",
  },
};

/** Ratio above which a fitted scaling exponent is considered superlinear */
const SUPERLINEAR_THRESHOLD = 1.4;

const KIND_ORDER: Readonly<Record<string, number>> = { normal: 0, heavy: 1 };
const SIZE_ORDER: Readonly<Record<string, number>> = { small: 0, medium: 1, large: 2 };

const props = defineProps<{ locale: Locale }>();

const report = data as unknown as ComparisonData;

const text = computed(() => COPY[props.locale]);
const query = ref("");
const onlyDifferences = ref(false);
const variantFilter = ref("all");
const expandedPlugin = ref<string | null>(null);

const variantOptions = computed<string[]>(() =>
  [...new Set(report.packages.flatMap((pkg) => pkg.variants.map((variant) => variant.id)))].sort(
    (a, b) => a.localeCompare(b, "en"),
  ),
);

const toCategory = (category: CaseCategory | undefined): CaseCategory =>
  category === "reference-error" ? "reference-error" : "difference";

// Older generated data only carries per-case notes, so cases sharing a note are treated as one
// root cause until the generated issue list is available.
const derivedIssues = (correctness: Correctness): readonly IssueGroup[] => {
  const groups = new Map<
    string,
    { id: string; category: CaseCategory; note?: ComparisonNote; cases: string[] }
  >();

  for (const testCase of correctness.cases) {
    if (testCase.status !== "diff") continue;

    const category = toCategory(testCase.category);
    const id = testCase.issue ?? `${category}:${testCase.note?.en ?? testCase.name}`;
    const group = groups.get(id);

    if (group) {
      group.cases.push(testCase.name);
    } else {
      groups.set(id, {
        id,
        category,
        ...(testCase.note ? { note: testCase.note } : {}),
        cases: [testCase.name],
      });
    }
  }

  return [...groups.values()];
};

const issueGroups = (correctness: Correctness): readonly IssueGroup[] => {
  const groups: readonly IssueGroup[] =
    correctness.issues && correctness.issues.length > 0
      ? correctness.issues.map((issue) => ({
          id: issue.id,
          category: toCategory(issue.category),
          ...(issue.note ? { note: issue.note } : {}),
          cases: issue.cases ?? [],
        }))
      : derivedIssues(correctness);

  // Reference errors come first, then accepted differences.
  return [...groups].sort(
    (groupA, groupB) =>
      Number(groupB.category === "reference-error") - Number(groupA.category === "reference-error"),
  );
};

const countIssues = (correctness: Correctness, category: CaseCategory): number =>
  issueGroups(correctness).filter((issue) => issue.category === category).length;

const hasIssueBreakdown = (correctness: Correctness): boolean =>
  (correctness.issues?.length ?? 0) > 0 ||
  (correctness.referenceErrors ?? 0) > 0 ||
  (correctness.differences ?? 0) > 0;

const referenceErrorCount = (correctness: Correctness): number =>
  hasIssueBreakdown(correctness)
    ? (correctness.referenceErrors ?? countIssues(correctness, "reference-error"))
    : countIssues(correctness, "reference-error");

const differenceCount = (correctness: Correctness): number =>
  hasIssueBreakdown(correctness)
    ? (correctness.differences ?? countIssues(correctness, "difference"))
    : countIssues(correctness, "difference");

const summarizeCorrectness = (variants: readonly Variant[]): CorrectnessTotals =>
  variants.reduce<CorrectnessTotals>(
    (totals, variant) => ({
      total: totals.total + variant.correctness.total,
      exact: totals.exact + variant.correctness.exact,
      referenceErrors: totals.referenceErrors + referenceErrorCount(variant.correctness),
      differences: totals.differences + differenceCount(variant.correctness),
    }),
    { total: 0, exact: 0, referenceErrors: 0, differences: 0 },
  );

const correctnessTotals = computed<{ referenceErrors: number; differences: number }>(() => {
  let referenceErrors = 0;
  let differences = 0;

  for (const pkg of report.packages) {
    for (const variant of pkg.variants) {
      referenceErrors += referenceErrorCount(variant.correctness);
      differences += differenceCount(variant.correctness);
    }
  }

  return { referenceErrors, differences };
});

const geometricMean = (values: readonly number[]): number =>
  values.length === 0
    ? Number.NaN
    : Math.exp(values.reduce((total, value) => total + Math.log(value), 0) / values.length);

const throughputRatios = (pkg: ComparisonPackage): number[] =>
  pkg.variants
    .flatMap((variant) => variant.bench.map((bench) => bench.ratio))
    .filter((ratio) => Number.isFinite(ratio) && ratio > 0);

const rows = computed<PackageRow[]>(() => {
  const needle = query.value.trim().toLowerCase();

  return report.packages
    .filter((pkg) => {
      if (
        needle !== "" &&
        !`${pkg.packageName} ${pkg.plugin} ${pkg.docsSlug} ${pkg.reference}`
          .toLowerCase()
          .includes(needle)
      )
        return false;

      if (onlyDifferences.value && !pkg.variants.some((variant) => variant.correctness.diff > 0))
        return false;

      if (
        variantFilter.value !== "all" &&
        !pkg.variants.some((variant) => variant.id === variantFilter.value)
      )
        return false;

      return true;
    })
    .map((pkg) => ({
      pkg,
      correctness: summarizeCorrectness(pkg.variants),
      ratio: geometricMean(throughputRatios(pkg)),
    }));
});

const machineSummary = computed<string>(() => {
  const { cpu, memoryGB, platform, arch } = report.machine;

  return [
    cpu,
    memoryGB > 0 ? `${memoryGB} GB` : "",
    platform !== "" && arch !== "" ? `${platform}/${arch}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
});

const formatInteger = (value: number): string => {
  if (!Number.isFinite(value)) return "—";

  return Math.round(value)
    .toString()
    .replaceAll(/\B(?=(?:\d{3})+(?!\d))/gu, ",");
};

const formatRatio = (ratio: number): string =>
  Number.isFinite(ratio) ? `${ratio.toFixed(2)}×` : "—";

const formatExponent = (exponent: number): string =>
  Number.isFinite(exponent) ? `~${exponent.toFixed(2)}` : "—";

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} kB`;

  return `${(bytes / 1_000_000).toFixed(2)} MB`;
};

const formatSizes = (sizes: readonly number[]): string =>
  sizes.map((size) => formatInteger(size)).join(" · ");

const parseInline = (value: string): InlineSegment[] => {
  const segments: InlineSegment[] = [];
  let index = 0;

  while (index < value.length) {
    const start = value.indexOf("`", index);

    if (start === -1) {
      segments.push({ text: value.slice(index), code: false });
      break;
    }

    if (start > index) segments.push({ text: value.slice(index, start), code: false });

    const end = value.indexOf("`", start + 1);

    if (end === -1) {
      segments.push({ text: value.slice(start), code: false });
      break;
    }

    if (end > start + 1) segments.push({ text: value.slice(start + 1, end), code: true });
    index = end + 1;
  }

  return segments;
};

const packageHref = (pkg: ComparisonPackage): string =>
  props.locale === "zh" ? `/zh/${pkg.docsSlug}.html` : `/${pkg.docsSlug}.html`;

const variantSummary = (pkg: ComparisonPackage): string =>
  `${pkg.variants.length} ${COPY[props.locale].variantsUnit}`;

const detailsId = (pkg: ComparisonPackage): string => `comparison-details-${pkg.plugin}`;

const isExpanded = (plugin: string): boolean => expandedPlugin.value === plugin;

const toggle = (plugin: string): void => {
  expandedPlugin.value = expandedPlugin.value === plugin ? null : plugin;
};

const ratioClass = (ratio: number): string => {
  if (!Number.isFinite(ratio)) return "is-even";

  // Classify the ratio as it is displayed, so `1.00×` is never coloured as faster or slower.
  const displayedRatio = Number(ratio.toFixed(2));

  if (displayedRatio === 1) return "is-even";
  if (displayedRatio > 1) return "is-faster";

  // Slightly slower results are a warning rather than a failure.
  return displayedRatio >= 0.95 ? "is-warning" : "is-slower";
};

const failedTests = (suite: TestSuite): readonly TestSuiteCase[] =>
  suite.tests.filter((test) => test.status === "failed");

const featureGapTests = (suite: TestSuite): readonly TestSuiteCase[] =>
  suite.tests.filter((test) => test.status === "skipped" && test.skipCategory === "feature-gap");

const skippedByCategory = (suite: TestSuite, category: SkipCategory): number =>
  suite.skippedByCategory?.[category] ??
  suite.tests.filter((test) => test.status === "skipped" && test.skipCategory === category).length;

const testRatioClass = (suite: TestSuite): string => (suite.failed > 0 ? "is-failed" : "is-passed");

const featureGapCount = (suite: TestSuite): number => skippedByCategory(suite, "feature-gap");

const testSkipTotals = computed<{
  featureGaps: number;
  internal: number;
  packaging: number;
}>(() => {
  let featureGaps = 0;
  let internal = 0;
  let packaging = 0;

  for (const pkg of report.packages) {
    const suite = pkg.testSuite;

    if (!suite) continue;

    featureGaps += featureGapCount(suite);
    internal += skippedByCategory(suite, "internal");
    packaging += skippedByCategory(suite, "packaging");
  }

  return {
    featureGaps: report.totals.testSkippedFeatureGap ?? featureGaps,
    internal: report.totals.testSkippedInternal ?? internal,
    packaging: report.totals.testSkippedPackaging ?? packaging,
  };
});

const firstLine = (message: string | undefined): string => message?.split("\n")[0]?.trim() ?? "";

const skipReasonText = (test: TestSuiteCase): string =>
  test.skipReason?.[props.locale] ?? test.skipReason?.en ?? "";

const issueNoteText = (group: IssueGroup): string =>
  group.note?.[props.locale] ?? group.note?.en ?? "";

const issueNoteSegments = (group: IssueGroup): InlineSegment[] => parseInline(issueNoteText(group));

/** Maximum number of case names shown inline for one issue */
const MAX_VISIBLE_CASES = 8;

/**
 * Limit the affected case names of an issue for a compact rendering
 *
 * @param group - Issue group
 * @returns The visible case names
 */
const visibleCases = (group: IssueGroup): readonly string[] =>
  group.cases.length > MAX_VISIBLE_CASES ? group.cases.slice(0, MAX_VISIBLE_CASES) : group.cases;

const isSuperlinear = (exponent: number): boolean =>
  Number.isFinite(exponent) && exponent > SUPERLINEAR_THRESHOLD;

const sortedBench = (variant: Variant): readonly BenchCase[] =>
  [...variant.bench].sort(
    (a, b) =>
      (KIND_ORDER[a.kind] ?? Number.MAX_SAFE_INTEGER) -
        (KIND_ORDER[b.kind] ?? Number.MAX_SAFE_INTEGER) ||
      (SIZE_ORDER[a.size] ?? Number.MAX_SAFE_INTEGER) -
        (SIZE_ORDER[b.size] ?? Number.MAX_SAFE_INTEGER),
  );

watch([query, onlyDifferences, variantFilter], () => {
  expandedPlugin.value = null;
});
</script>

<template>
  <section class="comparison-report" :lang="locale === 'zh' ? 'zh-CN' : 'en'">
    <div class="cr-cards">
      <article class="cr-card">
        <p class="cr-card-label">{{ text.packages }}</p>
        <p class="cr-card-value">{{ report.totals.packages }}</p>
        <p class="cr-card-meta">{{ report.totals.variants }} {{ text.variantsUnit }}</p>
      </article>

      <article class="cr-card">
        <p class="cr-card-label">{{ text.correctness }}</p>
        <p class="cr-card-value">
          {{ report.totals.cases }}{{ " " }}<span class="cr-card-unit">{{ text.casesUnit }}</span>
        </p>
        <p class="cr-chips">
          <span class="cr-chip is-exact">{{ report.totals.exact }} {{ text.exact }}</span>
          <span v-if="report.totals.normalized > 0" class="cr-chip is-normalized">
            {{ report.totals.normalized }} {{ text.normalized }}
          </span>
          <span v-if="correctnessTotals.referenceErrors > 0" class="cr-chip is-error">
            {{ correctnessTotals.referenceErrors }} {{ text.referenceErrors }}
          </span>
          <span v-if="correctnessTotals.differences > 0" class="cr-chip is-diff">
            {{ correctnessTotals.differences }} {{ text.differences }}
          </span>
          <span v-if="report.totals.error > 0" class="cr-chip is-error">
            {{ report.totals.error }} {{ text.renderingErrors }}
          </span>
          <span
            v-if="correctnessTotals.referenceErrors === 0 && correctnessTotals.differences === 0"
            class="cr-chips-empty"
          >
            {{ text.noIssues }}
          </span>
          <span
            v-if="correctnessTotals.referenceErrors === 0 && correctnessTotals.differences > 0"
            class="cr-visually-hidden"
          >
            0 {{ text.referenceErrors }}
          </span>
          <span
            v-if="correctnessTotals.differences === 0 && correctnessTotals.referenceErrors > 0"
            class="cr-visually-hidden"
          >
            0 {{ text.differences }}
          </span>
        </p>
      </article>

      <article v-if="report.totals.testCases > 0" class="cr-card">
        <p class="cr-card-label">{{ text.ourTestSuites }}</p>
        <p class="cr-card-value cr-card-value--tests">
          <span class="cr-card-ratio">
            {{ report.totals.testPassed }} / {{ report.totals.testCases }}
          </span>
          <span class="cr-card-unit">{{ text.passed }}</span>
        </p>
        <p class="cr-chips">
          <span class="cr-chip" :class="report.totals.testFailed > 0 ? 'is-error' : 'is-zero'">
            {{ formatInteger(report.totals.testFailed) }} {{ text.failed }}
          </span>
          <span
            class="cr-chip"
            :class="testSkipTotals.featureGaps > 0 ? 'is-feature-gap' : 'is-zero'"
          >
            {{ formatInteger(testSkipTotals.featureGaps) }} {{ text.featureGaps }}
          </span>
        </p>
        <p
          v-if="testSkipTotals.internal > 0 || testSkipTotals.packaging > 0"
          class="cr-card-meta cr-card-meta--subtle"
        >
          <span v-if="testSkipTotals.internal > 0" class="cr-skip-line">
            {{ text.skippedAggregatePrefix }}{{ formatInteger(testSkipTotals.internal) }}
            {{ text.internalSkipped }}
          </span>
          <span v-if="testSkipTotals.packaging > 0" class="cr-skip-line">
            {{ text.skippedAggregatePrefix }}{{ formatInteger(testSkipTotals.packaging) }}
            {{ text.packagingSkipped }}
          </span>
        </p>
      </article>

      <article class="cr-card">
        <p class="cr-card-label">{{ text.benchmarks }}</p>
        <p class="cr-card-value">
          {{ report.totals.benchCases }}{{ " "
          }}<span class="cr-card-unit">{{ text.benchmarkCasesUnit }}</span>
        </p>
        <p class="cr-card-meta">{{ text.benchmarkMeta }}</p>
      </article>

      <article class="cr-card">
        <p class="cr-card-label">{{ text.measurement }}</p>
        <p class="cr-card-value cr-card-value--date" :title="report.generatedAt">
          {{ report.date }}
        </p>
        <p class="cr-card-meta">Node {{ report.machine.node }}</p>
        <p class="cr-card-meta cr-card-meta--subtle">{{ machineSummary }}</p>
      </article>
    </div>

    <div class="cr-toolbar">
      <label class="cr-search">
        <span class="cr-visually-hidden">{{ text.filterLabel }}</span>
        <svg
          class="cr-search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          v-model="query"
          type="search"
          autocomplete="off"
          spellcheck="false"
          :placeholder="text.filterPlaceholder"
        />
      </label>

      <label class="cr-switch">
        <input v-model="onlyDifferences" type="checkbox" />
        <span>{{ text.onlyDifferences }}</span>
      </label>

      <label class="cr-select">
        <span>{{ text.variant }}</span>
        <select v-model="variantFilter">
          <option value="all">{{ text.allVariants }}</option>
          <option v-for="variantId in variantOptions" :key="variantId" :value="variantId">
            {{ variantId }}
          </option>
        </select>
      </label>

      <span class="cr-result-count" role="status" aria-live="polite">
        {{ text.showing }} <strong>{{ rows.length }}</strong> / {{ report.packages.length }}
        {{ text.packagesUnit }}
      </span>
    </div>

    <div v-if="rows.length > 0" class="cr-table-wrap">
      <table class="cr-table cr-overview">
        <thead>
          <tr>
            <th scope="col">{{ text.package }}</th>
            <th scope="col">{{ text.correctnessTests }}</th>
            <th scope="col" class="cr-num" :title="text.throughputHint">{{ text.throughput }}</th>
            <th scope="col" class="cr-num">{{ text.entryGzipHeader }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in rows" :key="row.pkg.plugin">
            <tr
              class="cr-package-row"
              :class="{ 'is-expanded': isExpanded(row.pkg.plugin) }"
              @click="toggle(row.pkg.plugin)"
            >
              <td class="cr-package-cell">
                <span class="cr-package-line">
                  <button
                    type="button"
                    class="cr-toggle"
                    :aria-expanded="isExpanded(row.pkg.plugin)"
                    :aria-controls="isExpanded(row.pkg.plugin) ? detailsId(row.pkg) : undefined"
                    :aria-label="`${isExpanded(row.pkg.plugin) ? text.hideDetails : text.showDetails} ${row.pkg.packageName}`"
                    @click.stop="toggle(row.pkg.plugin)"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </button>
                  <a class="cr-package-link" :href="packageHref(row.pkg)" @click.stop>
                    {{ row.pkg.packageName }}
                  </a>
                </span>
                <span class="cr-package-meta">
                  <span class="cr-reference">
                    <span class="cr-reference-name">{{ row.pkg.reference }}</span
                    ><span class="cr-reference-version">@{{ row.pkg.referenceVersion }}</span>
                  </span>
                  <span v-if="row.pkg.variants.length > 1" class="cr-package-variants">
                    <span class="cr-meta-separator" aria-hidden="true">·</span>
                    <span>{{ variantSummary(row.pkg) }}</span>
                  </span>
                </span>
              </td>

              <td>
                <span class="cr-correctness">
                  <span class="cr-correctness-tests" :title="text.correctnessTestsHint">
                    <template
                      v-if="
                        row.pkg.testSuite && !row.pkg.testSuite.error && row.pkg.testSuite.total > 0
                      "
                    >
                      <span class="cr-test-our">
                        {{ row.pkg.testSuite.total }}/{{ row.pkg.testSuite.total }}
                      </span>
                      <span class="cr-test-vs">{{ text.vs }}</span>
                      <span
                        class="cr-test-ref"
                        :class="row.pkg.testSuite.failed > 0 ? 'is-failed' : 'is-passed'"
                      >
                        {{ row.pkg.testSuite.passed }}/{{ row.pkg.testSuite.total }}
                      </span>
                    </template>
                    <span v-else class="cr-muted">—</span>
                  </span>
                  <span class="cr-correctness-details">
                    <span class="cr-correctness-detail">
                      {{ row.correctness.exact }}/{{ row.correctness.total }}
                      {{ text.exactShort }}
                    </span>
                    <span
                      v-if="row.correctness.referenceErrors > 0"
                      class="cr-correctness-detail is-error"
                      :title="text.referenceErrors"
                    >
                      {{ row.correctness.referenceErrors }} {{ text.referenceErrorsShort }}
                    </span>
                    <span
                      v-if="row.correctness.differences > 0"
                      class="cr-correctness-detail is-diff"
                      :title="text.differences"
                    >
                      {{ row.correctness.differences }} {{ text.differencesShort }}
                    </span>
                    <span
                      v-if="row.pkg.testSuite && featureGapCount(row.pkg.testSuite) > 0"
                      class="cr-correctness-detail is-feature-gap"
                      :title="text.featureGapTests"
                    >
                      {{ featureGapCount(row.pkg.testSuite) }} {{ text.featureGaps }}
                    </span>
                  </span>
                </span>
              </td>

              <td class="cr-num">
                <span v-if="row.ratio > 0" class="cr-ratio" :class="ratioClass(row.ratio)">
                  {{ formatRatio(row.ratio) }}
                </span>
                <span v-else class="cr-muted">—</span>
              </td>

              <td class="cr-num">
                <template v-if="row.pkg.size">
                  <span class="cr-size-compare">
                    <span class="cr-size-current" :title="text.current">
                      {{ formatBytes(row.pkg.size.current.entryGzipBytes) }}
                    </span>
                    <span class="cr-size-vs">{{ text.vs }}</span>
                    <span class="cr-size-reference" :title="text.reference">
                      {{ formatBytes(row.pkg.size.upstream.entryGzipBytes) }}
                    </span>
                  </span>
                </template>
                <span v-else class="cr-muted">—</span>
              </td>
            </tr>

            <tr v-if="isExpanded(row.pkg.plugin)" :id="detailsId(row.pkg)" class="cr-detail-row">
              <td colspan="4">
                <div class="cr-detail">
                  <article v-for="variant in row.pkg.variants" :key="variant.id" class="cr-variant">
                    <header class="cr-variant-head">
                      <h4 class="cr-variant-title">
                        <span class="cr-variant-label">{{ text.variant }}</span>
                        <code>{{ variant.id }}</code>
                      </h4>
                      <p class="cr-chips">
                        <span class="cr-chip is-exact">
                          {{ variant.correctness.exact }}/{{ variant.correctness.total }}
                          {{ text.exact }}
                        </span>
                        <span
                          v-if="variant.correctness.normalized > 0"
                          class="cr-chip is-normalized"
                        >
                          +{{ variant.correctness.normalized }} {{ text.normalized }}
                        </span>
                        <span
                          v-if="referenceErrorCount(variant.correctness) > 0"
                          class="cr-chip is-error"
                        >
                          {{ referenceErrorCount(variant.correctness) }}
                          {{ text.referenceErrors }}
                        </span>
                        <span
                          v-if="differenceCount(variant.correctness) > 0"
                          class="cr-chip is-diff"
                        >
                          {{ differenceCount(variant.correctness) }} {{ text.differences }}
                        </span>
                        <span v-if="variant.correctness.error > 0" class="cr-chip is-error">
                          {{ variant.correctness.error }} {{ text.renderingErrors }}
                        </span>
                      </p>
                    </header>

                    <div class="cr-subsection">
                      <h5 class="cr-subtitle">{{ text.issueSectionTitle }}</h5>
                      <ul v-if="issueGroups(variant.correctness).length > 0" class="cr-issues">
                        <li
                          v-for="group in issueGroups(variant.correctness)"
                          :key="group.id"
                          class="cr-issue"
                          :class="`is-${group.category}`"
                        >
                          <div class="cr-issue-head">
                            <span
                              class="cr-issue-badge"
                              :class="group.category === 'reference-error' ? 'is-error' : 'is-diff'"
                            >
                              {{ text.categories[group.category] }}
                            </span>
                            <span class="cr-issue-note">
                              <template v-if="group.note">
                                <span
                                  v-for="(segment, segmentIndex) in issueNoteSegments(group)"
                                  :key="segmentIndex"
                                  class="cr-inline"
                                >
                                  <code v-if="segment.code">{{ segment.text }}</code>
                                  <template v-else>{{ segment.text }}</template>
                                </span>
                              </template>
                              <span v-else class="cr-muted">{{ text.noNote }}</span>
                            </span>
                          </div>
                          <div v-if="group.cases.length > 0" class="cr-issue-cases">
                            <span class="cr-issue-cases-label">{{ text.casesLabel }}</span>
                            <span class="cr-issue-case-list" :title="group.cases.join(', ')">
                              <template
                                v-for="(caseName, caseIndex) in visibleCases(group)"
                                :key="caseName"
                              >
                                <span v-if="caseIndex > 0" class="cr-case-separator">,</span>
                                <code class="cr-case-name">{{ caseName }}</code>
                              </template>
                              <span v-if="group.cases.length > MAX_VISIBLE_CASES" class="cr-muted">
                                {{ " "
                                }}{{ text.moreCases(group.cases.length - MAX_VISIBLE_CASES) }}
                              </span>
                            </span>
                          </div>
                        </li>
                      </ul>
                      <p v-else class="cr-muted cr-empty-note">{{ text.noIssues }}</p>
                    </div>

                    <div class="cr-subsection">
                      <h5 class="cr-subtitle">{{ text.benchmarks }}</h5>
                      <div class="cr-table-wrap">
                        <table class="cr-table cr-bench-table">
                          <thead>
                            <tr>
                              <th scope="col">{{ text.caseLabel }}</th>
                              <th scope="col" class="cr-num">{{ text.currentOps }}</th>
                              <th scope="col" class="cr-num">{{ text.referenceOps }}</th>
                              <th scope="col" class="cr-num">{{ text.ratio }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="bench in sortedBench(variant)" :key="bench.case">
                              <td>
                                <code class="cr-case-name">{{ bench.case }}</code>
                              </td>
                              <td class="cr-num">{{ formatInteger(bench.current) }}</td>
                              <td class="cr-num cr-muted">{{ formatInteger(bench.reference) }}</td>
                              <td class="cr-num">
                                <span class="cr-ratio" :class="ratioClass(bench.ratio)">
                                  {{ formatRatio(bench.ratio) }}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div v-if="variant.scaling.length > 0" class="cr-subsection">
                      <h5 class="cr-subtitle">{{ text.scaling }}</h5>
                      <div class="cr-table-wrap">
                        <table class="cr-table cr-scaling-table">
                          <thead>
                            <tr>
                              <th scope="col">{{ text.series }}</th>
                              <th scope="col">{{ text.sizes }}</th>
                              <th scope="col" class="cr-num">{{ text.currentExponent }}</th>
                              <th scope="col" class="cr-num">{{ text.referenceExponent }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="series in variant.scaling" :key="series.case">
                              <td>
                                <code class="cr-case-name">{{ series.case }}</code>
                              </td>
                              <td class="cr-sizes">{{ formatSizes(series.sizes) }}</td>
                              <td class="cr-num">
                                <span
                                  class="cr-exponent"
                                  :class="{
                                    'is-superlinear': isSuperlinear(series.currentExponent),
                                  }"
                                >
                                  {{ formatExponent(series.currentExponent) }}
                                </span>
                                <span
                                  v-if="isSuperlinear(series.currentExponent)"
                                  class="cr-superlinear-tag"
                                >
                                  {{ text.superlinear }}
                                </span>
                              </td>
                              <td class="cr-num">
                                <span
                                  class="cr-exponent"
                                  :class="{
                                    'is-superlinear': isSuperlinear(series.referenceExponent),
                                  }"
                                >
                                  {{ formatExponent(series.referenceExponent) }}
                                </span>
                                <span
                                  v-if="isSuperlinear(series.referenceExponent)"
                                  class="cr-superlinear-tag"
                                >
                                  {{ text.superlinear }}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </article>

                  <section class="cr-package-size">
                    <h4 class="cr-section-title">{{ text.packageSize }}</h4>
                    <div v-if="row.pkg.size" class="cr-table-wrap">
                      <table class="cr-table cr-size-table">
                        <thead>
                          <tr>
                            <th scope="col">{{ text.metric }}</th>
                            <th scope="col">
                              <span class="cr-size-side-label">{{ text.current }}</span>
                              <span class="cr-size-side-name">
                                {{ row.pkg.size.current.name }}@{{ row.pkg.size.current.version }}
                              </span>
                            </th>
                            <th scope="col">
                              <span class="cr-size-side-label">{{ text.reference }}</span>
                              <span class="cr-size-side-name">
                                {{ row.pkg.size.upstream.name }}@{{ row.pkg.size.upstream.version }}
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">{{ text.entryGzip }}</th>
                            <td>{{ formatBytes(row.pkg.size.current.entryGzipBytes) }}</td>
                            <td>{{ formatBytes(row.pkg.size.upstream.entryGzipBytes) }}</td>
                          </tr>
                          <tr>
                            <th scope="row">{{ text.entryFiles }}</th>
                            <td>{{ formatInteger(row.pkg.size.current.entryFileCount) }}</td>
                            <td>{{ formatInteger(row.pkg.size.upstream.entryFileCount) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p v-else class="cr-muted cr-empty-note">{{ text.sizeUnavailable }}</p>
                  </section>

                  <section v-if="row.pkg.testSuite" class="cr-package-tests">
                    <h4 class="cr-section-title">{{ text.testSuiteTitle }}</h4>
                    <p v-if="row.pkg.testSuite.error" class="cr-test-error">
                      <span class="cr-test-error-label">{{ text.testSuiteError }}</span>
                      {{ row.pkg.testSuite.error }}
                    </p>
                    <template v-else>
                      <p class="cr-test-summary">
                        <span
                          class="cr-test-summary-score"
                          :class="testRatioClass(row.pkg.testSuite)"
                        >
                          {{ row.pkg.testSuite.passed }}/{{ row.pkg.testSuite.total }}
                        </span>
                        <span>{{ text.testsPass }}</span>
                        <span v-if="row.pkg.testSuite.failed > 0" class="cr-chip is-error">
                          {{ formatInteger(row.pkg.testSuite.failed) }} {{ text.failed }}
                        </span>
                        <span
                          v-if="featureGapCount(row.pkg.testSuite) > 0"
                          class="cr-chip is-feature-gap"
                        >
                          {{ formatInteger(featureGapCount(row.pkg.testSuite)) }}
                          {{ text.featureGaps }}
                        </span>
                      </p>

                      <p
                        v-if="
                          skippedByCategory(row.pkg.testSuite, 'internal') > 0 ||
                          skippedByCategory(row.pkg.testSuite, 'packaging') > 0
                        "
                        class="cr-test-skip-aggregate"
                      >
                        <span
                          v-if="skippedByCategory(row.pkg.testSuite, 'internal') > 0"
                          class="cr-skip-line"
                        >
                          {{ text.skippedAggregatePrefix
                          }}{{ formatInteger(skippedByCategory(row.pkg.testSuite, "internal")) }}
                          {{ text.internalSkipped }}
                        </span>
                        <span
                          v-if="skippedByCategory(row.pkg.testSuite, 'packaging') > 0"
                          class="cr-skip-line"
                        >
                          {{ text.skippedAggregatePrefix
                          }}{{ formatInteger(skippedByCategory(row.pkg.testSuite, "packaging")) }}
                          {{ text.packagingSkipped }}
                        </span>
                      </p>

                      <div v-if="failedTests(row.pkg.testSuite).length > 0" class="cr-subsection">
                        <h5 class="cr-subtitle">{{ text.failedTests }}</h5>
                        <ul class="cr-test-list">
                          <li
                            v-for="test in failedTests(row.pkg.testSuite)"
                            :key="`${test.file}:${test.name}`"
                            class="cr-test-item is-failed"
                          >
                            <span class="cr-test-head">
                              <code class="cr-test-file">{{ test.file }}</code>
                              <span class="cr-test-separator" aria-hidden="true">&gt;</span>
                              <span class="cr-test-name">{{ test.name }}</span>
                            </span>
                            <span v-if="firstLine(test.message)" class="cr-test-message">
                              {{ firstLine(test.message) }}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div
                        v-if="featureGapTests(row.pkg.testSuite).length > 0"
                        class="cr-subsection"
                      >
                        <h5 class="cr-subtitle">{{ text.featureGapTests }}</h5>
                        <ul class="cr-test-list">
                          <li
                            v-for="test in featureGapTests(row.pkg.testSuite)"
                            :key="`${test.file}:${test.name}`"
                            class="cr-test-item is-feature-gap"
                          >
                            <span class="cr-test-head">
                              <code class="cr-test-file">{{ test.file }}</code>
                              <span class="cr-test-separator" aria-hidden="true">&gt;</span>
                              <span class="cr-test-name">{{ test.name }}</span>
                            </span>
                            <span v-if="skipReasonText(test)" class="cr-test-message">
                              {{ skipReasonText(test) }}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <p
                        v-if="failedTests(row.pkg.testSuite).length === 0"
                        class="cr-muted cr-empty-note"
                      >
                        {{ text.allTestsPass }}
                      </p>
                    </template>
                  </section>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p v-else class="cr-empty" role="status">{{ text.noResults }}</p>

    <details class="cr-methodology">
      <summary>{{ text.methodology }}</summary>
      <div class="cr-methodology-body">
        <ol>
          <li v-for="(note, noteIndex) in report.methodNotes[locale]" :key="noteIndex">
            <span
              v-for="(segment, segmentIndex) in parseInline(note)"
              :key="segmentIndex"
              class="cr-inline"
            >
              <code v-if="segment.code">{{ segment.text }}</code>
              <template v-else>{{ segment.text }}</template>
            </span>
          </li>
        </ol>
      </div>
    </details>
  </section>
</template>

<style scoped>
.comparison-report {
  --cr-text: var(--vp-c-text, #3c3c43);
  --cr-text-mute: var(--vp-c-text-mute, #67676c);
  --cr-text-subtle: var(--vp-c-text-subtle, #8e8e93);
  --cr-bg: var(--vp-c-bg, #fff);
  --cr-bg-alt: var(--vp-c-bg-alt, #f6f6f7);
  --cr-bg-soft: var(--vp-c-bg-soft, #f9f9fa);
  --cr-border: var(--vp-c-border, #c2c2c4);
  --cr-divider: var(--vp-c-divider, #e2e2e3);
  --cr-accent: var(--vp-c-accent, #0771ab);
  --cr-accent-soft: var(--vp-c-accent-soft, #147db829);
  --cr-green: var(--vp-c-green-text, #18794e);
  --cr-green-soft: var(--vp-c-green-soft, #18794e19);
  --cr-red: var(--vp-c-red-text, #b8272c);
  --cr-red-soft: var(--vp-c-red-soft, #b8272c19);
  --cr-yellow: var(--vp-c-yellow-text, #915930);
  --cr-yellow-soft: var(--vp-c-yellow-soft, #91593019);

  margin-block: 1.5rem;
  color: var(--cr-text);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.cr-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.75rem;
  margin-block-end: 1.25rem;
}

.cr-card {
  padding: 0.9rem 0.85rem;
  border: 1px solid var(--cr-divider);
  border-radius: 0.5rem;
  background: var(--cr-bg-alt);
}

.cr-card-label {
  margin: 0 0 0.35rem;
  color: var(--cr-text-mute);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.cr-card-value {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}

.cr-card-value--date {
  font-size: 1.2rem;
  white-space: nowrap;
}

.cr-card-value--tests {
  font-size: 1.35rem;
}

.cr-card-ratio {
  white-space: nowrap;
}

.cr-card-value--tests .cr-card-unit {
  display: block;
  margin-inline-start: 0;
}

.cr-card-unit {
  margin-inline-start: 0.3rem;
  color: var(--cr-text-mute);
  font-size: 0.78rem;
  font-weight: 500;
}

.cr-card-meta {
  margin: 0.4rem 0 0;
  color: var(--cr-text-mute);
  font-size: 0.78rem;
  line-height: 1.45;
}

.cr-card-meta--subtle {
  margin-block-start: 0.1rem;
  color: var(--cr-text-subtle);
}

.cr-chips-empty {
  color: var(--cr-text-mute);
  font-size: 0.72rem;
  line-height: 1.5;
}

.cr-skip-line {
  display: block;
}

.cr-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin: 0.55rem 0 0;
}

.cr-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.08rem 0.4rem;
  border-radius: 0.3rem;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.cr-chip.is-exact {
  color: var(--cr-green);
  background: var(--cr-green-soft);
}

.cr-chip.is-normalized {
  color: var(--cr-accent);
  background: var(--cr-accent-soft);
}

.cr-chip.is-diff {
  color: var(--cr-yellow);
  background: var(--cr-yellow-soft);
}

.cr-chip.is-error {
  color: var(--cr-red);
  background: var(--cr-red-soft);
}

.cr-chip.is-zero {
  color: var(--cr-text-mute);
  background: var(--cr-bg-soft);
}

.cr-chip.is-feature-gap {
  color: var(--cr-accent);
  background: var(--cr-accent-soft);
}

.cr-card .cr-chip {
  box-sizing: border-box;
  max-width: 100%;
  white-space: normal;
}

.cr-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin-block-end: 0.75rem;
}

.cr-search {
  position: relative;
  display: flex;
  flex: 1 1 15rem;
  align-items: center;
  min-width: 0;
}

.cr-search-icon {
  position: absolute;
  inset-inline-start: 0.6rem;
  width: 1rem;
  height: 1rem;
  color: var(--cr-text-subtle);
  pointer-events: none;
}

.cr-search input {
  width: 100%;
  padding: 0.42rem 0.7rem 0.42rem 2rem;
  border: 1px solid var(--cr-border);
  border-radius: 0.4rem;
  background: var(--cr-bg);
  color: var(--cr-text);
  font: inherit;
  font-size: 0.85rem;
}

.cr-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--cr-text-mute);
  font-size: 0.82rem;
  cursor: pointer;
  user-select: none;
}

.cr-switch input {
  width: 1rem;
  height: 1rem;
  margin: 0;
  accent-color: var(--cr-accent);
  cursor: pointer;
}

.cr-select {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--cr-text-mute);
  font-size: 0.82rem;
}

.cr-select select {
  padding: 0.28rem 0.4rem;
  border: 1px solid var(--cr-border);
  border-radius: 0.35rem;
  background: var(--cr-bg);
  color: var(--cr-text);
  font: inherit;
  font-size: 0.82rem;
}

.cr-search input:focus-visible,
.cr-select select:focus-visible,
.cr-toggle:focus-visible,
.cr-switch input:focus-visible,
.cr-methodology summary:focus-visible {
  outline: 2px solid var(--cr-accent);
  outline-offset: 2px;
}

.cr-result-count {
  margin-inline-start: auto;
  color: var(--cr-text-mute);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.cr-result-count strong {
  color: var(--cr-text);
}

.cr-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--cr-border);
  border-radius: 0.5rem;
  background: var(--cr-bg);
  -webkit-overflow-scrolling: touch;
}

.cr-table {
  display: table;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.cr-overview {
  min-width: 44rem;
}

.cr-bench-table,
.cr-scaling-table,
.cr-size-table {
  min-width: 32rem;
}

.cr-table th,
.cr-table td {
  padding: 0.5rem 0.65rem;
  /* The docs theme gives every th/td a grid border; the table only needs row separators. */
  border: 0;
  border-block-end: 1px solid var(--cr-divider);
  text-align: start;
  vertical-align: top;
}

/* Neutralize the docs theme zebra striping so row states stay under the component's control. */
.cr-table tbody tr:nth-child(odd) {
  background: transparent;
}

.cr-table thead th {
  background: var(--cr-bg-alt);
  color: var(--cr-text-mute);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  white-space: nowrap;
}

.cr-table tbody tr:last-child > td,
.cr-table tbody tr:last-child > th {
  border-block-end: 0;
}

.cr-package-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.cr-package-row:hover {
  background: var(--cr-bg-alt);
}

.cr-package-row.is-expanded {
  background: var(--cr-accent-soft);
}

.cr-package-cell {
  min-width: 13rem;
}

.cr-package-line {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.cr-package-link {
  color: var(--cr-accent);
  font-weight: 600;
  text-decoration: none;
}

.cr-package-link:hover {
  text-decoration: underline;
}

.cr-package-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.1rem 0.35rem;
  margin-block-start: 0.2rem;
  color: var(--cr-text-mute);
  font-size: 0.76rem;
  line-height: 1.45;
}

.cr-reference {
  font-family: var(--vp-font-mono, ui-monospace, monospace);
  white-space: nowrap;
}

.cr-reference-version {
  color: var(--cr-text-subtle);
}

.cr-meta-separator {
  color: var(--cr-text-subtle);
}

.cr-package-variants {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  white-space: nowrap;
}

.cr-correctness {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.cr-correctness-tests,
.cr-correctness-details {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem;
}

.cr-correctness-tests {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cr-test-our {
  color: var(--cr-green);
}

.cr-test-ref.is-passed {
  color: var(--cr-green);
}

.cr-test-ref.is-failed {
  color: var(--cr-red);
}

.cr-test-vs {
  color: var(--cr-text-mute);
  font-size: 0.76rem;
  font-weight: 400;
}

.cr-correctness-detail {
  color: var(--cr-text-mute);
  font-size: 0.76rem;
  white-space: nowrap;
}

.cr-correctness-detail.is-diff {
  color: var(--cr-yellow);
}

.cr-correctness-detail.is-error {
  color: var(--cr-red);
}

.cr-correctness-detail.is-feature-gap {
  color: var(--cr-accent);
}

.cr-test-skip-aggregate {
  margin: 0 0 0.7rem;
  color: var(--cr-text-mute);
  font-size: 0.78rem;
  line-height: 1.45;
}

.cr-num {
  font-variant-numeric: tabular-nums;
  text-align: end;
  white-space: nowrap;
}

.cr-ratio {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.cr-ratio.is-faster {
  color: var(--cr-green);
}

.cr-ratio.is-slower {
  color: var(--cr-red);
}

.cr-ratio.is-warning {
  color: var(--cr-yellow);
}

.cr-ratio.is-even {
  color: var(--cr-text-mute);
}

.cr-size-compare {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  white-space: nowrap;
}

.cr-size-vs {
  color: var(--cr-text-mute);
  font-size: 0.76rem;
}

.cr-size-current {
  font-weight: 600;
}

.cr-size-reference {
  color: var(--cr-text-mute);
  font-size: 0.78rem;
}

.cr-muted {
  color: var(--cr-text-mute);
}

.cr-toggle {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 0.3rem;
  background: transparent;
  color: var(--cr-text-subtle);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.cr-toggle:hover {
  background: var(--cr-bg-soft);
  color: var(--cr-accent);
}

.cr-toggle svg {
  width: 0.9rem;
  height: 0.9rem;
  transition: transform 0.15s ease;
}

.cr-toggle[aria-expanded="true"] svg {
  transform: rotate(90deg);
}

.cr-detail-row > td {
  padding: 0;
  background: var(--cr-bg-alt);
}

.cr-detail {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
}

.cr-variant,
.cr-package-size,
.cr-package-tests {
  padding: 0.9rem;
  border: 1px solid var(--cr-divider);
  border-radius: 0.5rem;
  background: var(--cr-bg);
}

.cr-variant-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem 0.75rem;
  margin-block-end: 0.65rem;
}

.cr-variant-title,
.cr-section-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.4;
}

.cr-section-title {
  margin-block-end: 0.55rem;
}

.cr-variant-title code {
  padding: 0.05rem 0.3rem;
  border-radius: 0.25rem;
  background: var(--cr-bg-alt);
  color: var(--cr-text);
  font-family: var(--vp-font-mono, ui-monospace, monospace);
  font-size: 0.82rem;
}

.cr-variant-label {
  color: var(--cr-text-mute);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.cr-variant-head .cr-chips {
  margin: 0;
}

.cr-subsection + .cr-subsection {
  margin-block-start: 0.85rem;
}

.cr-subtitle {
  margin: 0 0 0.4rem;
  padding: 0;
  border: 0;
  color: var(--cr-text);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.4;
}

.cr-issues {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cr-issue {
  display: grid;
  gap: 0.35rem;
  padding: 0.5rem 0.6rem;
  border-inline-start: 2px solid var(--cr-divider);
  border-radius: 0 0.35rem 0.35rem 0;
  background: var(--cr-bg-alt);
  font-size: 0.82rem;
}

.cr-issue.is-reference-error {
  border-inline-start-color: var(--cr-red);
}

.cr-issue.is-difference {
  border-inline-start-color: var(--cr-yellow);
}

.cr-issue-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.3rem 0.45rem;
}

.cr-issue-badge {
  flex: none;
  padding: 0.02rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.cr-issue-badge.is-diff {
  color: var(--cr-yellow);
  background: var(--cr-yellow-soft);
}

.cr-issue-badge.is-error {
  color: var(--cr-red);
  background: var(--cr-red-soft);
}

.cr-issue-note {
  flex: 1 1 14rem;
  min-width: 0;
}

.cr-case-name {
  padding: 0.05rem 0.25rem;
  border-radius: 0.25rem;
  background: var(--cr-bg-soft);
  color: var(--cr-text);
  font-family: var(--vp-font-mono, ui-monospace, monospace);
  font-size: 0.76rem;
  white-space: nowrap;
}

.cr-issue-cases {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.15rem 0.3rem;
  color: var(--cr-text-mute);
  font-size: 0.78rem;
}

.cr-issue-cases-label {
  font-weight: 600;
}

.cr-issue-case-list {
  display: inline-flex;
  flex: 1 1 14rem;
  flex-wrap: wrap;
  align-items: flex-start;
  min-width: 0;
  gap: 0.1rem 0;
}

.cr-case-list {
  display: grid;
  flex: 1 1 14rem;
  gap: 0.2rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cr-case-entry {
  display: grid;
  gap: 0.05rem;
}

.cr-case-entry .cr-case-name {
  justify-self: start;
}

.cr-case-separator {
  align-self: flex-start;
  margin-inline: 0.15rem;
  color: var(--cr-text-subtle);
}

.cr-case-note {
  color: var(--cr-text-mute);
  font-size: 0.74rem;
  line-height: 1.4;
}

.cr-issue-note code,
.cr-case-note code,
.cr-methodology-body code {
  padding: 0.05rem 0.25rem;
  border-radius: 0.2rem;
  background: var(--cr-bg-soft);
  font-size: 0.92em;
}

.cr-empty-note {
  margin: 0;
  font-size: 0.8rem;
}

.cr-sizes {
  color: var(--cr-text-mute);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cr-exponent {
  font-variant-numeric: tabular-nums;
}

.cr-exponent.is-superlinear {
  color: var(--cr-red);
  font-weight: 700;
}

.cr-superlinear-tag {
  margin-inline-start: 0.3rem;
  padding: 0.02rem 0.25rem;
  border-radius: 0.25rem;
  background: var(--cr-red-soft);
  color: var(--cr-red);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.cr-size-table th[scope="row"] {
  font-weight: 600;
  white-space: nowrap;
}

.cr-size-side-label {
  display: block;
  color: var(--cr-text-mute);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.cr-size-side-name {
  display: block;
  color: var(--cr-text);
  font-family: var(--vp-font-mono, ui-monospace, monospace);
  font-size: 0.74rem;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  white-space: nowrap;
}

.cr-test-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem 0.5rem;
  margin: 0 0 0.7rem;
  font-size: 0.85rem;
}

.cr-test-summary-score {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.cr-test-summary-score.is-passed {
  color: var(--cr-green);
}

.cr-test-summary-score.is-failed {
  color: var(--cr-red);
}

.cr-test-list {
  display: grid;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cr-test-item {
  display: grid;
  gap: 0.15rem;
  padding: 0.35rem 0.55rem;
  border-inline-start: 2px solid var(--cr-divider);
  border-radius: 0 0.3rem 0.3rem 0;
  background: var(--cr-bg-alt);
  font-size: 0.8rem;
}

.cr-test-item.is-failed {
  border-inline-start-color: var(--cr-red);
}

.cr-test-item.is-feature-gap {
  border-inline-start-color: var(--cr-accent);
}

.cr-test-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.2rem 0.35rem;
}

.cr-test-file {
  padding: 0.05rem 0.25rem;
  border-radius: 0.25rem;
  background: var(--cr-bg-soft);
  color: var(--cr-text);
  font-family: var(--vp-font-mono, ui-monospace, monospace);
  font-size: 0.74rem;
  white-space: nowrap;
}

.cr-test-separator {
  color: var(--cr-text-subtle);
}

.cr-test-name {
  flex: 1 1 12rem;
  min-width: 0;
  overflow-wrap: anywhere;
}

.cr-test-message {
  color: var(--cr-text-mute);
  font-size: 0.76rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.cr-test-error {
  margin: 0;
  padding: 0.5rem 0.6rem;
  border-radius: 0.35rem;
  background: var(--cr-red-soft);
  color: var(--cr-red);
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}

.cr-test-error-label {
  display: block;
  margin-block-end: 0.15rem;
  font-weight: 700;
}

.cr-empty {
  margin: 0;
  padding: 1rem;
  border: 1px dashed var(--cr-border);
  border-radius: 0.5rem;
  color: var(--cr-text-mute);
  text-align: center;
}

.cr-methodology {
  margin-block-start: 1.5rem;
  border: 1px solid var(--cr-divider);
  border-radius: 0.5rem;
  background: var(--cr-bg-alt);
}

.cr-methodology > summary {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 0.9rem;
  color: var(--cr-text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
}

.cr-methodology > summary::-webkit-details-marker {
  display: none;
}

.cr-methodology > summary::before {
  content: "▸";

  display: inline-block;
  flex: none;

  color: var(--cr-text-mute);
  font-size: 1.05rem;
  line-height: 1;
  transition: transform 0.15s ease;
}

.cr-methodology[open] > summary::before {
  transform: rotate(90deg);
}

.cr-methodology-body {
  padding: 0 0.9rem 0.85rem;
}

.cr-methodology-body ol {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding-inline-start: 1.25rem;
  color: var(--cr-text-mute);
  font-size: 0.82rem;
}

.cr-visually-hidden {
  position: absolute;

  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;

  border: 0;

  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 719px) {
  .cr-card-value {
    font-size: 1.4rem;
  }

  .cr-card-value--date {
    font-size: 1.05rem;
  }

  .cr-result-count {
    margin-inline-start: 0;
  }

  .cr-detail {
    padding: 0.75rem;
  }

  .cr-variant,
  .cr-package-size,
  .cr-package-tests {
    padding: 0.7rem;
  }

  .cr-table {
    font-size: 0.8rem;
  }
}

@media (max-width: 419px) {
  .cr-detail {
    padding: 0.6rem;
  }

  .cr-table th,
  .cr-table td {
    padding: 0.4rem 0.5rem;
  }
}
</style>
