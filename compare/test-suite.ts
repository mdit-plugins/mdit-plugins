/* oxlint-disable no-await-in-loop -- suites are executed sequentially by design */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type {
  ComparisonSpec,
  TestSuiteCaseResult,
  TestSuitePackageResult,
  TestSuiteStatus,
} from "./types.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const SPECS_DIR = path.join(import.meta.dirname, "specs");
const RESULTS_FILE = path.join(import.meta.dirname, "results", "test-suites.json");
const WORK_DIR = path.join(ROOT, "temp", "compare-test-suites");
const VITEST_BIN = path.join(ROOT, "node_modules", "vitest", "vitest.mjs");
const CONFIG_FILE = path.join(import.meta.dirname, "test-suite.config.ts");

/** One assertion of the vitest JSON reporter */
interface VitestAssertion {
  /** Test status */
  readonly status: string;
  /** Test title */
  readonly title: string;
  /** Full test name */
  readonly fullName: string;
  /** Failure messages */
  readonly failureMessages?: readonly string[];
}

/** One test file of the vitest JSON reporter */
interface VitestFileResult {
  /** Absolute file path */
  readonly name: string;
  /** File status */
  readonly status: string;
  /** Assertions of the file */
  readonly assertionResults: readonly VitestAssertion[];
  /** Collection error message */
  readonly message?: string;
}

/** Report of the vitest JSON reporter */
interface VitestReport {
  /** Per file results */
  readonly testResults?: readonly VitestFileResult[];
}

/**
 * List all spec names
 *
 * @returns Spec names, sorted alphabetically
 */
const listSpecs = (): string[] =>
  existsSync(SPECS_DIR)
    ? readdirSync(SPECS_DIR)
        .filter((fileName) => fileName.endsWith(".ts") && !fileName.startsWith("_"))
        .map((fileName) => fileName.slice(0, -3))
        .sort()
    : [];

/**
 * Import a comparison spec
 *
 * @param plugin - Package directory
 * @returns The comparison spec
 */
const importSpec = async (plugin: string): Promise<ComparisonSpec> => {
  const file = path.join(SPECS_DIR, `${plugin}.ts`);
  const module = (await import(/* @vite-ignore */ pathToFileURL(file).href)) as {
    default?: ComparisonSpec;
  };

  if (!module.default) throw new Error(`[compare] ${file} has no default export.`);

  return module.default;
};

/**
 * Collect the names imported by the tests from the package entry modules
 *
 * @param plugin - Package directory
 * @returns Imported export names
 */
const collectPublicImportNames = (plugin: string): Set<string> => {
  const testsDir = path.join(ROOT, "packages", plugin, "__tests__");
  const names = new Set<string>();

  if (!existsSync(testsDir)) return names;

  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".ts")) {
        const content = readFileSync(entryPath, "utf8");
        const importPattern =
          /import\s+(?!type\b)\{(?<names>[^}]*)\}\s*from\s*["'](?:\.\.\/)+src\/(?:index|plugin)\.js["']/gu;

        for (const match of content.matchAll(importPattern)) {
          for (const item of (match.groups?.names ?? "").split(",")) {
            const [name] = item
              .trim()
              .replace(/^type\s+/u, "")
              .split(/\s+/u);

            if (!name || name.startsWith("type")) continue;

            names.add(name);
          }
        }
      }
    }
  };

  walk(testsDir);

  return names;
};

/**
 * Create the shim module that exposes the reference implementation under the public export names
 *
 * @param spec - Comparison spec
 * @returns Shim module source
 */
const createShim = (spec: ComparisonSpec): string => {
  const names = collectPublicImportNames(spec.plugin);
  const exportMap = new Map(
    spec.variants.map((variant) => [
      variant.ourExport ?? "default",
      variant.referenceExport ?? "default",
    ]),
  );
  const lines = [
    `import * as referenceModule from ${JSON.stringify(spec.reference)};`,
    "",
    "const reference = referenceModule as Record<string, unknown>;",
    "",
  ];

  for (const name of [...names].sort()) {
    const referenceName = exportMap.get(name) ?? spec.testSuiteExports?.[name] ?? name;

    if (referenceName === "default") {
      lines.push(
        `export const ${name} = (reference["default"] ?? reference[${JSON.stringify(name)}]) as never;`,
      );
    } else {
      lines.push(`export const ${name} = reference[${JSON.stringify(referenceName)}] as never;`);
    }
  }

  return `${lines.join("\n")}\n`;
};

/**
 * Map a vitest assertion status to a comparison status
 *
 * @param status - Vitest status
 * @returns Comparison status
 */
const mapStatus = (status: string): TestSuiteStatus => (status === "passed" ? "passed" : "failed");

/**
 * Flatten the vitest report into test results
 *
 * @param report - Vitest JSON report
 * @returns Flat test results
 */
const flattenReport = (report: VitestReport): TestSuiteCaseResult[] => {
  const tests: TestSuiteCaseResult[] = [];

  for (const fileResult of report.testResults ?? []) {
    const file = path.basename(fileResult.name);

    if (fileResult.assertionResults.length === 0 && fileResult.status !== "passed") {
      tests.push({
        file,
        name: "(test file did not run)",
        status: "failed",
        message: (fileResult.message ?? "the test file failed to load").split("\n")[0] ?? "",
      });
      continue;
    }

    for (const assertion of fileResult.assertionResults) {
      tests.push({
        file,
        name: assertion.fullName,
        status: mapStatus(assertion.status),
        ...(assertion.status === "passed"
          ? {}
          : { message: (assertion.failureMessages?.[0] ?? "").split("\n")[0] ?? "" }),
      });
    }
  }

  return tests;
};

/**
 * Apply the configured skips to a test result
 *
 * @param spec - Comparison spec
 * @param test - Test result
 * @returns The test result, marked as skipped when it matches a configured skip
 */
const applySkip = (spec: ComparisonSpec, test: TestSuiteCaseResult): TestSuiteCaseResult => {
  const skip = spec.testSuiteSkips?.find(
    (candidate) =>
      (candidate.file == null || test.file.includes(candidate.file)) &&
      test.name.includes(candidate.name),
  );

  if (!skip) return test;

  return { file: test.file, name: test.name, status: "skipped", skipReason: skip.why };
};

/**
 * Run the test suite of one package against the reference implementation
 *
 * @param plugin - Package directory
 * @returns Test suite result
 */
const runPackage = async (plugin: string): Promise<TestSuitePackageResult> => {
  const spec = await importSpec(plugin);
  const workDir = path.join(WORK_DIR, plugin);
  const shimFile = path.join(workDir, "reference-shim.ts");
  const reportFile = path.join(workDir, "vitest.json");

  mkdirSync(workDir, { recursive: true });
  writeFileSync(shimFile, createShim(spec));
  rmSync(reportFile, { force: true });

  let output = "";

  try {
    execFileSync(
      process.execPath,
      [VITEST_BIN, "run", "--config", CONFIG_FILE, "--reporter=json", "--outputFile", reportFile],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: {
          ...process.env,
          // CI mode makes vitest fail on missing snapshots instead of writing new ones into the
          // package, so running the tests against the reference cannot modify the repository.
          CI: "true",
          COMPARE_PLUGIN_DIR: `packages/${plugin}`,
          COMPARE_SHIM: shimFile,
        },
      },
    );
  } catch (err) {
    output = [
      (err as { stdout?: string }).stdout ?? "",
      (err as { stderr?: string }).stderr ?? "",
    ].join("\n");
  }

  if (!existsSync(reportFile)) {
    return {
      plugin,
      reference: spec.reference,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: [],
      error: (output || "vitest produced no report").trim().split("\n").slice(-5).join("\n"),
    };
  }

  const report = JSON.parse(readFileSync(reportFile, "utf8")) as VitestReport;
  const tests = flattenReport(report).map((test) => applySkip(spec, test));
  const count = (status: TestSuiteStatus): number =>
    tests.filter((test) => test.status === status).length;

  return {
    plugin,
    reference: spec.reference,
    total: count("passed") + count("failed"),
    passed: count("passed"),
    failed: count("failed"),
    skipped: count("skipped"),
    tests,
  };
};

/** Run the test suites that are covered by comparison specs */
const main = async (): Promise<void> => {
  const targets = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
  const plugins = targets.length > 0 ? targets : listSpecs();
  const packages: TestSuitePackageResult[] = [];

  for (const plugin of plugins) {
    const result = await runPackage(plugin);

    packages.push(result);

    console.log(
      result.error
        ? `[compare] ${plugin}: could not run the test suite — ${result.error.split("\n")[0]}`
        : `[compare] ${plugin}: ${result.passed}/${result.total} tests pass against ${result.reference} (${result.failed} failed, ${result.skipped} skipped)`,
    );

    for (const test of result.tests) {
      if (test.status === "failed")
        console.log(`  failed  ${test.file} > ${test.name}: ${test.message ?? ""}`);
    }
  }

  mkdirSync(path.dirname(RESULTS_FILE), { recursive: true });
  writeFileSync(
    RESULTS_FILE,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        commit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim(),
        packages,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`[compare] wrote ${path.relative(ROOT, RESULTS_FILE)}`);
};

await main();
