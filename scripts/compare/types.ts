import type { MarkdownIt } from "markdown-it";

/** A plugin module namespace loaded from a built package or a reference package */
export type PluginModule = Record<string, unknown>;

/** A markdown-it plugin function */
export type PluginFunction = (md: MarkdownIt, options?: unknown) => void;

/** Render markdown into comparable text */
export type CompareRenderer = (markdown: string) => string | Promise<string>;

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
}

/** A markdown case used by the correctness comparison */
export interface CorrectnessCase {
  /** Case name shown in reports */
  readonly name: string;
  /** Markdown input */
  readonly markdown: string;
  /** Explanation for an expected difference */
  readonly note?: string;
}

/** A benchmark case, one per corpus kind and size */
export interface BenchCase {
  /** Case name shown in reports */
  readonly name: string;
  /** Whether the corpus contains sparse or dense plugin syntax */
  readonly kind: "normal" | "heavy";
  /** Corpus size */
  readonly size: "small" | "medium" | "large";
  /** Markdown input */
  readonly markdown: string;
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
  /** Human readable notes rendered in reports */
  readonly notes?: readonly string[];
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

/** Correctness result of one case */
export interface CorrectnessCaseResult {
  /** Case name */
  readonly name: string;
  /** Comparison status */
  readonly status: CorrectnessStatus;
  /** Explanation for an expected difference */
  readonly note?: string;
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
  readonly notes: readonly string[];
}
