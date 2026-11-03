import type { MarkdownIt } from "markdown-it";

/** A plugin module namespace loaded from a built package or a reference package */
export type PluginModule = Record<string, unknown>;

/** A markdown-it plugin function */
export type PluginFunction = (md: MarkdownIt, options?: unknown) => void;

/** Render markdown into comparable text */
export type CompareRenderer = (markdown: string) => string | Promise<string>;

/** A bilingual note rendered on the English and Chinese pages */
export interface ComparisonNote {
  /** English text */
  readonly en: string;
  /** Chinese text */
  readonly zh: string;
}

/** One comparable variant of a plugin package */
export interface ComparisonVariant {
  /** Variant id used in result files and reports, e.g. `"light"` */
  readonly id: string;
  /** Export name in the current package, defaults to `"default"` */
  readonly ourExport?: string;
  /** Export name in the reference package, defaults to `"default"` */
  readonly referenceExport?: string;
  /** Options passed to the current plugin */
  readonly ourOptions?: unknown;
  /** Options passed to the reference plugin */
  readonly referenceOptions?: unknown;
  /** Build a custom renderer for the current plugin */
  readonly createOurRenderer?: (module: PluginModule) => CompareRenderer;
  /** Build a custom renderer for the reference plugin */
  readonly createReferenceRenderer?: (module: PluginModule) => CompareRenderer;
  /**
   * Compare the parsed token streams in addition to the rendered HTML
   *
   * Defaults to `true` when no custom renderer is used; a custom renderer already defines what is
   * compared (HTML, a token dump, ...), so token comparison is skipped for those variants.
   */
  readonly compareTokens?: boolean;
}

/** A markdown case used by the correctness comparison */
export interface CorrectnessCase {
  /** Case name shown in reports */
  readonly name: string;
  /** Markdown input */
  readonly markdown: string;
  /** Explanation for an expected difference */
  readonly note?: ComparisonNote;
}

/** A benchmark case, one per corpus kind and size */
export interface BenchCase {
  /** Case name shown in reports */
  readonly name: string;
  /** Whether the corpus contains sparse or dense plugin syntax */
  readonly kind: "normal" | "heavy";
  /** Corpus size */
  readonly size: "small" | "medium" | "large";
  /** Base benchmark corpus document, relative to the `compare/` directory; repeated per size */
  readonly file: string;
  /** Target duration of one sample in milliseconds */
  readonly targetMs?: number;
}

/** A scaling series used to detect superlinear complexity */
export interface ScalingCase {
  /** Case name shown in reports */
  readonly name: string;
  /** Build the markdown input for a given size */
  readonly build: (size: number) => string;
  /** Sizes measured, defaults to `[64, 128, 256, 512]` */
  readonly sizes?: readonly number[];
  /** Target duration of one sample in milliseconds */
  readonly targetMs?: number;
}

/** One test of the package test suite that is skipped when run against the reference */
export interface TestSuiteSkip {
  /** Substring of the test name (suite name plus test title) */
  readonly name: string;
  /** Optional substring of the test file name, e.g. `source-map.spec.ts` */
  readonly file?: string;
  /** Bilingual explanation of why the test only covers internal behavior */
  readonly why: ComparisonNote;
}

/** A plugin comparison definition */
export interface ComparisonSpec {
  /** Package directory under `packages/`, e.g. `plugin-attrs` */
  readonly plugin: string;
  /** Reference npm package, e.g. `markdown-it-attrs` */
  readonly reference: string;
  /** Comparable variants of the package */
  readonly variants: readonly ComparisonVariant[];
  /** Correctness cases */
  readonly correctness: readonly CorrectnessCase[];
  /** Benchmark cases */
  readonly bench: readonly BenchCase[];
  /** Scaling series */
  readonly scaling?: readonly ScalingCase[];
  /** Normalize the rendered output of both sides before comparing */
  readonly normalize?: (html: string) => string;
  /** Tests that are skipped when the package test suite runs against the reference */
  readonly testSuiteSkips?: readonly TestSuiteSkip[];
  /**
   * Extra export aliases for the test suite shim, mapping names imported by the tests to reference
   * exports when they differ from the compared variant exports (e.g. an alias such as `mathjax`).
   */
  readonly testSuiteExports?: Readonly<Record<string, string>>;
  /** Human readable notes rendered in reports */
  readonly notes?: readonly ComparisonNote[];
}

/**
 * Define a comparison spec with type checking
 *
 * @param spec - Comparison spec
 * @returns The comparison spec
 */
export const defineComparison = (spec: ComparisonSpec): ComparisonSpec => spec;

/** One benchmark measurement */
export interface Measurement {
  /** Operations per second derived from the median sample */
  readonly opsPerSec: number;
  /** Median milliseconds per operation */
  readonly meanMs: number;
  /** Milliseconds per operation of every sample */
  readonly samples: readonly number[];
}

/** Benchmark result of one case */
export interface BenchResult {
  /** Case name */
  readonly case: string;
  /** Corpus kind */
  readonly kind: "normal" | "heavy";
  /** Corpus size */
  readonly size: "small" | "medium" | "large";
  /** Current package measurement */
  readonly current: Measurement;
  /** Reference package measurement */
  readonly reference: Measurement;
  /** Throughput ratio: current / reference */
  readonly ratio: number;
}

/** One point of a scaling series */
export interface ScalingPoint {
  /** Input size */
  readonly size: number;
  /** Milliseconds per operation */
  readonly ms: number;
}

/** Scaling result of one series */
export interface ScalingResult {
  /** Case name */
  readonly case: string;
  /** Measured sizes */
  readonly sizes: readonly number[];
  /** Current package measurements */
  readonly current: readonly ScalingPoint[];
  /** Reference package measurements */
  readonly reference: readonly ScalingPoint[];
  /** Fitted growth exponent of the current package */
  readonly currentExponent: number;
  /** Fitted growth exponent of the reference package */
  readonly referenceExponent: number;
}

/** Comparison status of one correctness case */
export type CorrectnessStatus = "exact" | "normalized" | "diff" | "error";

/** First difference between the token streams of a correctness case */
export interface TokenDifference {
  /** JSON path of the first difference, e.g. `[1].map` */
  readonly path: string;
  /** Current value, serialized */
  readonly current: string;
  /** Reference value, serialized */
  readonly reference: string;
}

/** Correctness result of one case */
export interface CorrectnessCaseResult {
  /** Case name */
  readonly name: string;
  /** Comparison status */
  readonly status: CorrectnessStatus;
  /** Explanation for an expected difference */
  readonly note?: ComparisonNote;
  /** First token stream difference when the rendered HTML matches */
  readonly tokenDifference?: TokenDifference;
  /** Output of the current package */
  readonly ourHtml?: string;
  /** Output of the reference package */
  readonly referenceHtml?: string;
  /** Error message when a render failed */
  readonly error?: string;
}

/** Correctness summary of one variant */
export interface CorrectnessSummary {
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
  readonly cases: readonly CorrectnessCaseResult[];
}

/** Status of one test of the package test suite */
export type TestSuiteStatus = "passed" | "failed" | "skipped";

/** Result of one test of the package test suite */
export interface TestSuiteCaseResult {
  /** Test file name */
  readonly file: string;
  /** Full test name (suite plus title) */
  readonly name: string;
  /** Test status */
  readonly status: TestSuiteStatus;
  /** First line of the failure message, when the test failed */
  readonly message?: string;
  /** Explanation of a skipped test */
  readonly skipReason?: ComparisonNote;
}

/** Result of running a package test suite against the reference implementation */
export interface TestSuitePackageResult {
  /** Package directory under `packages/` */
  readonly plugin: string;
  /** Reference npm package */
  readonly reference: string;
  /** Number of counted tests (passed + failed) */
  readonly total: number;
  /** Number of passed tests */
  readonly passed: number;
  /** Number of failed tests */
  readonly failed: number;
  /** Number of skipped tests (not counted in total) */
  readonly skipped: number;
  /** Per test results */
  readonly tests: readonly TestSuiteCaseResult[];
  /** Collection error when the suite could not run at all */
  readonly error?: string;
}

/** Committed result of running the package test suites against the reference implementations */
export interface TestSuiteData {
  /** ISO timestamp of the run */
  readonly generatedAt: string;
  /** Commit of the run */
  readonly commit: string;
  /** Per package results */
  readonly packages: readonly TestSuitePackageResult[];
}

/** Comparison result of one variant */
export interface VariantResult {
  /** Variant id */
  readonly id: string;
  /** Correctness summary */
  readonly correctness: CorrectnessSummary;
  /** Benchmark results */
  readonly bench: readonly BenchResult[];
  /** Scaling results */
  readonly scaling: readonly ScalingResult[];
}

/** Environment information of a measurement run */
export interface MachineInfo {
  /** Operating system platform */
  readonly platform: string;
  /** CPU architecture */
  readonly arch: string;
  /** Node.js version */
  readonly node: string;
  /** CPU model */
  readonly cpu: string;
  /** Total memory in GB */
  readonly memoryGB: number;
}

/** Comparison result of one package */
export interface ComparisonResult {
  /** Package directory under `packages/` */
  readonly plugin: string;
  /** Reference npm package */
  readonly reference: string;
  /** Installed reference version */
  readonly referenceVersion: string;
  /** ISO timestamp of the run */
  readonly generatedAt: string;
  /** Git commit of the current tree */
  readonly commit: string;
  /** Environment information */
  readonly machine: MachineInfo;
  /** Variant results */
  readonly variants: readonly VariantResult[];
  /** Notes rendered in reports */
  readonly notes: readonly ComparisonNote[];
}
