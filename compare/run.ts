/* oxlint-disable no-await-in-loop -- comparisons are measured sequentially by design */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { fitExponent, measurePair, measureScaling } from "./bench.ts";
import { createRenderer, getReferenceVersion, loadCurrent, loadReference } from "./loader.ts";
import { normalizeHtml } from "./normalize.ts";
import type {
  BenchResult,
  ComparisonResult,
  ComparisonSpec,
  CorrectnessCaseResult,
  CorrectnessSummary,
  MachineInfo,
  ScalingResult,
  VariantResult,
} from "./types.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const SPECS_DIR = path.join(import.meta.dirname, "specs");
const RESULTS_DIR = path.join(import.meta.dirname, "results");

/** Command line flags of a comparison run */
interface RunFlags {
  /** Whether correctness cases are compared */
  readonly correctness: boolean;
  /** Whether benchmarks are measured */
  readonly bench: boolean;
  /** Whether result files are written */
  readonly write: boolean;
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
 * Compare the correctness cases of one variant
 *
 * @param spec - Comparison spec
 * @param ourRenderer - Renderer of the current package
 * @param referenceRenderer - Renderer of the reference package
 * @returns Correctness summary
 */
const compareCorrectness = async (
  spec: ComparisonSpec,
  ourRenderer: (markdown: string) => string | Promise<string>,
  referenceRenderer: (markdown: string) => string | Promise<string>,
): Promise<CorrectnessSummary> => {
  const normalize = spec.normalize ?? normalizeHtml;
  const cases: CorrectnessCaseResult[] = [];

  for (const testCase of spec.correctness) {
    try {
      const ourHtml = await ourRenderer(testCase.markdown);
      const referenceHtml = await referenceRenderer(testCase.markdown);
      const status =
        ourHtml === referenceHtml
          ? "exact"
          : normalize(ourHtml) === normalize(referenceHtml)
            ? "normalized"
            : "diff";

      cases.push({
        name: testCase.name,
        status,
        ...(testCase.note ? { note: testCase.note } : {}),
        ...(status === "diff" ? { ourHtml, referenceHtml } : {}),
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

  return {
    total: cases.length,
    exact: count("exact"),
    normalized: count("normalized"),
    diff: count("diff"),
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
    const markdown = readFileSync(path.join(import.meta.dirname, benchCase.file), "utf8");
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
      current: measurement.current,
      reference: measurement.reference,
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
      current: measurement.current,
      reference: measurement.reference,
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

    const correctness = flags.correctness
      ? await compareCorrectness(spec, ourRenderer, referenceRenderer)
      : { total: 0, exact: 0, normalized: 0, diff: 0, error: 0, cases: [] };
    const bench = flags.bench ? await compareBench(spec, ourRenderer, referenceRenderer) : [];
    const scaling = flags.bench ? await compareScaling(spec, ourRenderer, referenceRenderer) : [];

    variants.push({ id: variant.id, correctness, bench, scaling });

    console.log(
      `[compare] ${spec.plugin} (${variant.id}): ${correctness.total} cases, ${correctness.exact} exact, ${correctness.normalized} normalized, ${correctness.diff} diff, ${correctness.error} error`,
    );

    for (const testCase of correctness.cases) {
      if (testCase.status === "diff" || testCase.status === "error")
        console.log(`  ${testCase.status.padEnd(6)} ${testCase.name}`);
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
 */
const writeResult = (result: ComparisonResult): void => {
  mkdirSync(RESULTS_DIR, { recursive: true });

  const file = path.join(RESULTS_DIR, `${result.plugin}.json`);

  writeFileSync(file, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`[compare] wrote ${path.relative(ROOT, file)}`);
};

/** Run one or all comparison specs */
const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const flags: RunFlags = {
    correctness: !args.includes("--bench-only"),
    bench: !args.includes("--correctness-only"),
    write: !args.includes("--no-write"),
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

    if (flags.write) writeResult(result);
  }
};

await main();
