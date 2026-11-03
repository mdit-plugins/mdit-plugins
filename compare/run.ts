/* oxlint-disable no-await-in-loop -- comparisons are measured sequentially by design */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { Token } from "markdown-it";

import { fitExponent, measurePair, measureScaling } from "./bench.ts";
import {
  createMarkdownIt,
  createRenderer,
  getReferenceVersion,
  loadCurrent,
  loadReference,
} from "./loader.ts";
import { canonicalizeTokens, findTokenDifference, normalizeHtml } from "./normalize.ts";
import type {
  BenchResult,
  ComparisonIssue,
  ComparisonResult,
  ComparisonSpec,
  ComparisonNote,
  CorrectnessCase,
  CorrectnessCaseResult,
  CorrectnessSummary,
  IssueSummary,
  MachineInfo,
  ScalingResult,
  TokenDifference,
  VariantResult,
} from "./types.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const SPECS_DIR = path.join(import.meta.dirname, "specs");
const RESULTS_DIR = path.join(import.meta.dirname, "results");

/** Target document size in bytes for every corpus kind and benchmark size */
const CORPUS_TARGET_BYTES = {
  normal: { small: 2048, medium: 8192, large: 32768 },
  heavy: { small: 4096, medium: 16384, large: 65536 },
} as const;

/**
 * Compute how often the base corpus document is repeated for a benchmark size
 *
 * @param baseCorpus - Committed base document
 * @param kind - Corpus kind
 * @param size - Benchmark size
 * @returns Number of repetitions
 */
const getCorpusRepetitions = (
  baseCorpus: string,
  kind: BenchResult["kind"],
  size: BenchResult["size"],
): number => {
  const target = CORPUS_TARGET_BYTES[kind][size];
  const baseSize = Math.max(Buffer.byteLength(baseCorpus), 1);

  return Math.max(1, Math.ceil(target / baseSize));
};

/** Command line flags of a comparison run */
interface RunFlags {
  /** Whether correctness cases are compared */
  readonly correctness: boolean;
  /** Whether benchmarks are measured */
  readonly bench: boolean;
  /** Whether result files are written */
  readonly write: boolean;
  /** Whether to keep the measured sections of an existing result file */
  readonly merge: boolean;
}

/**
 * List all spec files
 *
 * @returns Spec file names without extension, sorted alphabetically
 */
const listSpecs = (): string[] =>
  existsSync(SPECS_DIR)
    ? readdirSync(SPECS_DIR)
        .filter((fileName) => fileName.endsWith(".ts") && !fileName.startsWith("_"))
        .map((fileName) => fileName.slice(0, -3))
        .sort()
    : [];

/**
 * Import a spec file
 *
 * @param plugin - Spec name, i.e. the package directory name
 * @returns The comparison spec
 */
const importSpec = async (plugin: string): Promise<ComparisonSpec> => {
  const file = path.join(SPECS_DIR, `${plugin}.ts`);

  if (!existsSync(file)) throw new Error(`[compare] spec ${file} does not exist.`);

  const module = (await import(/* @vite-ignore */ pathToFileURL(file).href)) as {
    default?: ComparisonSpec;
  };

  if (!module.default) throw new Error(`[compare] ${file} has no default export.`);

  return module.default;
};

/**
 * Get the commit of the current working tree
 *
 * @returns The commit hash
 */
const getCommit = (): string =>
  execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();

/**
 * Get information about the measurement environment
 *
 * @returns Machine information
 */
const getMachine = (): MachineInfo => ({
  platform: os.platform(),
  arch: os.arch(),
  node: process.version,
  cpu: os.cpus()[0]?.model ?? "unknown",
  memoryGB: Math.round((os.totalmem() / 1024 ** 3) * 10) / 10,
});

/**
 * Create the bilingual note that explains a token stream difference
 *
 * @param difference - First difference between both token streams
 * @returns The bilingual note
 */
const createTokenNote = (difference: TokenDifference): ComparisonNote => ({
  en: `The rendered HTML matches, but the token stream differs at \`${difference.path}\`: current \`${difference.current}\`, reference \`${difference.reference}\`.`,
  zh: `渲染后的 HTML 一致，但 token 流在 \`${difference.path}\` 处不同：当前包为 \`${difference.current}\`，参考包为 \`${difference.reference}\`。`,
});

/**
 * Resolve and validate the issue of a difference case
 *
 * @param spec - Comparison spec
 * @param issueMap - Issues of the spec by id
 * @param testCase - Correctness case
 * @returns The issue of the case
 */
const resolveIssue = (
  spec: ComparisonSpec,
  issueMap: ReadonlyMap<string, ComparisonIssue>,
  testCase: CorrectnessCase,
): ComparisonIssue => {
  if (!testCase.issue) {
    throw new Error(
      `[compare] ${spec.plugin}::${testCase.name} is a difference case without an issue; define it under the spec "issues" and reference it from the case.`,
    );
  }

  const issue = issueMap.get(testCase.issue);

  if (!issue) {
    throw new Error(
      `[compare] ${spec.plugin}::${testCase.name} references unknown issue "${testCase.issue}".`,
    );
  }

  return issue;
};

/**
 * Compare the correctness cases of one variant
 *
 * @param spec - Comparison spec
 * @param ourRenderer - Renderer of the current package
 * @param referenceRenderer - Renderer of the reference package
 * @param ourTokenize - Parse the markdown with the current package, when token streams are compared
 * @param referenceTokenize - Parse the markdown with the reference package, when token streams are
 *   compared
 * @returns Correctness summary
 */
const compareCorrectness = async (
  spec: ComparisonSpec,
  ourRenderer: (markdown: string) => string | Promise<string>,
  referenceRenderer: (markdown: string) => string | Promise<string>,
  ourTokenize?: (markdown: string) => readonly Token[],
  referenceTokenize?: (markdown: string) => readonly Token[],
): Promise<CorrectnessSummary> => {
  const normalize = spec.normalize ?? normalizeHtml;
  const issueMap = new Map((spec.issues ?? []).map((issue) => [issue.id, issue]));
  const cases: CorrectnessCaseResult[] = [];

  for (const testCase of spec.correctness) {
    try {
      const ourHtml = await ourRenderer(testCase.markdown);
      const referenceHtml = await referenceRenderer(testCase.markdown);
      const htmlStatus =
        ourHtml === referenceHtml
          ? "exact"
          : normalize(ourHtml) === normalize(referenceHtml)
            ? "normalized"
            : "diff";
      const tokenDifference =
        htmlStatus === "diff" || ourTokenize == null || referenceTokenize == null
          ? void 0
          : findTokenDifference(
              canonicalizeTokens(ourTokenize(testCase.markdown)),
              canonicalizeTokens(referenceTokenize(testCase.markdown)),
            );
      const status = tokenDifference ? "diff" : htmlStatus;
      const note = testCase.note ?? (tokenDifference ? createTokenNote(tokenDifference) : void 0);
      const issue = status === "diff" ? resolveIssue(spec, issueMap, testCase) : void 0;

      cases.push({
        name: testCase.name,
        status,
        ...(issue ? { issue: issue.id, category: issue.category } : {}),
        ...(note ? { note } : {}),
        ...(tokenDifference ? { tokenDifference } : {}),
        ...(status === "diff" && htmlStatus === "diff" ? { ourHtml, referenceHtml } : {}),
      });
    } catch (err) {
      cases.push({
        name: testCase.name,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        ...(testCase.note ? { note: testCase.note } : {}),
      });
    }
  }

  const count = (status: CorrectnessCaseResult["status"]): number =>
    cases.filter((testCase) => testCase.status === status).length;
  const diffCases = cases.filter((testCase) => testCase.status === "diff");
  const issueIds = [...new Set(diffCases.map((testCase) => testCase.issue))].filter(
    (issueId): issueId is string => issueId != null,
  );
  const issues: IssueSummary[] = issueIds.map((issueId) => {
    const issue = issueMap.get(issueId);

    if (!issue) throw new Error(`[compare] ${spec.plugin} references unknown issue "${issueId}".`);

    return {
      id: issue.id,
      category: issue.category,
      note: issue.note,
      cases: diffCases
        .filter((testCase) => testCase.issue === issue.id)
        .map((testCase) => testCase.name),
    };
  });

  return {
    total: cases.length,
    exact: count("exact"),
    normalized: count("normalized"),
    diff: diffCases.length,
    referenceErrors: issues.filter((issue) => issue.category === "reference-error").length,
    differences: issues.filter((issue) => issue.category === "difference").length,
    issues,
    error: count("error"),
    cases,
  };
};

/**
 * Measure the benchmark cases of one variant
 *
 * @param spec - Comparison spec
 * @param ourRenderer - Renderer of the current package
 * @param referenceRenderer - Renderer of the reference package
 * @returns Benchmark results
 */
const compareBench = async (
  spec: ComparisonSpec,
  ourRenderer: (markdown: string) => string | Promise<string>,
  referenceRenderer: (markdown: string) => string | Promise<string>,
): Promise<BenchResult[]> => {
  const results: BenchResult[] = [];

  for (const benchCase of spec.bench) {
    // The committed corpus files contain the document once; it is repeated until the document
    // reaches the target size, so the repository only stores each document a single time.
    const baseCorpus = readFileSync(path.join(import.meta.dirname, benchCase.file), "utf8");
    const markdown = baseCorpus.repeat(
      getCorpusRepetitions(baseCorpus, benchCase.kind, benchCase.size),
    );
    const measurement = await measurePair(
      () => ourRenderer(markdown),
      () => referenceRenderer(markdown),
      {
        targetMs: benchCase.targetMs ?? 150,
      },
    );

    results.push({
      case: benchCase.name,
      kind: benchCase.kind,
      size: benchCase.size,
      // The committed data keeps the derived numbers only; samples stay in memory.
      current: {
        opsPerSec: measurement.current.opsPerSec,
        meanMs: measurement.current.meanMs,
      },
      reference: {
        opsPerSec: measurement.reference.opsPerSec,
        meanMs: measurement.reference.meanMs,
      },
      ratio: measurement.current.opsPerSec / measurement.reference.opsPerSec,
    });
  }

  return results;
};

/**
 * Measure the scaling series of one variant
 *
 * @param spec - Comparison spec
 * @param ourRenderer - Renderer of the current package
 * @param referenceRenderer - Renderer of the reference package
 * @returns Scaling results
 */
const compareScaling = async (
  spec: ComparisonSpec,
  ourRenderer: (markdown: string) => string | Promise<string>,
  referenceRenderer: (markdown: string) => string | Promise<string>,
): Promise<ScalingResult[]> => {
  const results: ScalingResult[] = [];

  for (const scalingCase of spec.scaling ?? []) {
    const sizes = scalingCase.sizes ?? [64, 128, 256, 512];
    const measurement = await measureScaling(
      (size) => ourRenderer(scalingCase.build(size)),
      (size) => referenceRenderer(scalingCase.build(size)),
      sizes,
      typeof scalingCase.targetMs === "number" ? { targetMs: scalingCase.targetMs } : {},
    );

    results.push({
      case: scalingCase.name,
      sizes,
      currentExponent: fitExponent(measurement.current),
      referenceExponent: fitExponent(measurement.reference),
    });
  }

  return results;
};

/**
 * Run a comparison spec
 *
 * @param plugin - Spec name
 * @param flags - Command line flags
 * @returns The comparison result
 */
const runSpec = async (plugin: string, flags: RunFlags): Promise<ComparisonResult> => {
  const spec = await importSpec(plugin);
  const currentModule = await loadCurrent(spec.plugin);
  const referenceModule = await loadReference(spec.reference);
  const variants: VariantResult[] = [];

  for (const variant of spec.variants) {
    const ourRenderer =
      variant.createOurRenderer?.(currentModule) ??
      createRenderer(currentModule, variant.ourExport, variant.ourOptions);
    const referenceRenderer =
      variant.createReferenceRenderer?.(referenceModule) ??
      createRenderer(referenceModule, variant.referenceExport, variant.referenceOptions);

    const compareTokens =
      variant.compareTokens ??
      (variant.createOurRenderer == null && variant.createReferenceRenderer == null);
    const ourTokenize = compareTokens
      ? (markdown: string): Token[] =>
          createMarkdownIt(currentModule, variant.ourExport, variant.ourOptions).parse(markdown, {})
      : void 0;
    const referenceTokenize = compareTokens
      ? (markdown: string): Token[] =>
          createMarkdownIt(
            referenceModule,
            variant.referenceExport,
            variant.referenceOptions,
          ).parse(markdown, {})
      : void 0;

    const correctness = flags.correctness
      ? await compareCorrectness(
          spec,
          ourRenderer,
          referenceRenderer,
          ourTokenize,
          referenceTokenize,
        )
      : {
          total: 0,
          exact: 0,
          normalized: 0,
          diff: 0,
          referenceErrors: 0,
          differences: 0,
          issues: [],
          error: 0,
          cases: [],
        };
    const bench = flags.bench ? await compareBench(spec, ourRenderer, referenceRenderer) : [];
    const scaling = flags.bench ? await compareScaling(spec, ourRenderer, referenceRenderer) : [];

    variants.push({ id: variant.id, correctness, bench, scaling });

    console.log(
      `[compare] ${spec.plugin} (${variant.id}): ${correctness.total} cases, ${correctness.exact} exact, ${correctness.normalized} normalized, ${correctness.diff} diff, ${correctness.error} error`,
    );

    for (const testCase of correctness.cases) {
      if (testCase.status === "diff" || testCase.status === "error")
        console.log(`  ${testCase.status.padEnd(6)} ${testCase.name}`);

      if (testCase.tokenDifference) {
        console.log(
          `  token  ${testCase.name}: ${testCase.tokenDifference.path} ${testCase.tokenDifference.current} vs ${testCase.tokenDifference.reference}`,
        );
      }
    }

    for (const benchResult of bench) {
      console.log(
        `  bench ${benchResult.case.padEnd(18)} ${Math.round(benchResult.current.opsPerSec)} ops/s vs ${Math.round(benchResult.reference.opsPerSec)} ops/s (${benchResult.ratio.toFixed(2)}x)`,
      );
    }

    for (const scalingResult of scaling) {
      console.log(
        `  scale ${scalingResult.case.padEnd(18)} exponent ${scalingResult.currentExponent.toFixed(2)} vs ${scalingResult.referenceExponent.toFixed(2)}`,
      );
    }
  }

  return {
    plugin: spec.plugin,
    reference: spec.reference,
    referenceVersion: getReferenceVersion(spec.reference),
    generatedAt: new Date().toISOString(),
    commit: getCommit(),
    machine: getMachine(),
    variants,
    notes: spec.notes ?? [],
  };
};

/**
 * Write the result file of a comparison
 *
 * @param result - Comparison result
 * @param merge - Whether to keep the measured sections of an existing result file
 */
const writeResult = (result: ComparisonResult, merge: boolean): void => {
  const file = path.join(RESULTS_DIR, `${result.plugin}.json`);
  let finalResult = result;

  if (merge && existsSync(file)) {
    const existing = JSON.parse(readFileSync(file, "utf8")) as ComparisonResult;

    finalResult = {
      ...result,
      generatedAt: existing.generatedAt,
      variants: result.variants.map((variant) => {
        const previous = existing.variants.find((candidate) => candidate.id === variant.id);

        if (!previous) return variant;

        return {
          ...variant,
          correctness: variant.correctness.total > 0 ? variant.correctness : previous.correctness,
          bench: variant.bench.length > 0 ? variant.bench : previous.bench,
          scaling: variant.scaling.length > 0 ? variant.scaling : previous.scaling,
        };
      }),
    };
  }

  mkdirSync(RESULTS_DIR, { recursive: true });
  writeFileSync(file, `${JSON.stringify(finalResult, null, 2)}\n`);
  console.log(`[compare] wrote ${path.relative(ROOT, file)}`);
};

/** Run one or all comparison specs */
const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const flags: RunFlags = {
    correctness: !args.includes("--bench-only"),
    bench: !args.includes("--correctness-only"),
    write: !args.includes("--no-write"),
    merge: args.includes("--merge"),
  };
  const targets = args.filter((argument) => !argument.startsWith("--"));
  const specs = targets.length > 0 ? targets : listSpecs();

  if (specs.length === 0) throw new Error(`[compare] no spec found in ${SPECS_DIR}.`);

  if (targets.length === 0 && specs.length > 1) {
    // Run every spec in its own process so that one comparison cannot affect the next one.
    for (const spec of specs) {
      execFileSync(
        process.execPath,
        [
          ...process.execArgv,
          import.meta.filename,
          spec,
          ...args.filter((a) => a.startsWith("--")),
        ],
        { cwd: ROOT, stdio: "inherit" },
      );
    }

    return;
  }

  for (const spec of specs) {
    const result = await runSpec(spec, flags);

    if (flags.write) writeResult(result, flags.merge);
  }
};

await main();
