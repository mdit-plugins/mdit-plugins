import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import type { ComparisonIssue, ComparisonSpec, TestSuiteSkip } from "../types.ts";

const COMPARE_DIR = path.resolve(import.meta.dirname, "..");
const SPECS_DIR = path.join(COMPARE_DIR, "specs");
const SIZES = ["small", "medium", "large"] as const;
const KINDS = ["normal", "heavy"] as const;
const EXPECTED_BENCH_NAMES = KINDS.flatMap((kind) => SIZES.map((size) => `${kind}/${size}`));
const MIN_CORRECTNESS_CASES = 10;
const MIN_SCALING_SERIES = 2;
const MIN_SCALING_SIZES = 4;

/**
 * Read the declared issues of a spec
 *
 * @param spec - Comparison spec
 * @returns Declared issues
 */
const issuesOf = (spec: ComparisonSpec): readonly ComparisonIssue[] => spec.issues ?? [];

/**
 * Read the declared skips of a spec
 *
 * @param spec - Comparison spec
 * @returns Declared skips
 */
const skipsOf = (spec: ComparisonSpec): readonly TestSuiteSkip[] => spec.testSuiteSkips ?? [];

const specNames = readdirSync(SPECS_DIR)
  .filter((fileName) => fileName.endsWith(".ts") && !fileName.startsWith("_"))
  .map((fileName) => fileName.slice(0, -3))
  .sort();

/**
 * Load a spec file
 *
 * @param name - Spec name, i.e. the package directory name
 * @returns The comparison spec
 */
const loadSpec = async (name: string): Promise<ComparisonSpec> => {
  const module: { default: ComparisonSpec } = await import(
    /* @vite-ignore */ pathToFileURL(path.join(SPECS_DIR, `${name}.ts`)).href
  );

  return module.default;
};

describe("comparison specs", () => {
  it("has at least one spec", () => {
    expect(specNames.length).toBeGreaterThan(0);
  });

  it("names every spec file after its package", () => {
    for (const name of specNames) expect(name).toMatch(/^plugin-[a-z0-9-]+$/u);
  });

  describe.each(specNames)("%s", (name) => {
    it("compares the package of the same name", async () => {
      const spec = await loadSpec(name);

      expect(spec.plugin).toBe(name);
      expect(spec.reference).toBeTypeOf("string");
      expect(spec.reference.length).toBeGreaterThan(0);
    });

    it("has valid variants", async () => {
      const spec = await loadSpec(name);
      const ids = spec.variants.map((variant) => variant.id);

      expect(spec.variants.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("has enough correctness cases", async () => {
      const spec = await loadSpec(name);

      expect(spec.correctness.length).toBeGreaterThanOrEqual(MIN_CORRECTNESS_CASES);

      for (const testCase of spec.correctness) {
        expect(testCase.name.length).toBeGreaterThan(0);
        expect(testCase.markdown.length).toBeGreaterThan(0);
      }
    });

    it("has the six required benchmark cases", async () => {
      const spec = await loadSpec(name);

      expect(spec.bench.map((benchCase) => benchCase.name)).toStrictEqual(EXPECTED_BENCH_NAMES);

      for (const benchCase of spec.bench) {
        const corpusPath = path.join(COMPARE_DIR, benchCase.file);

        expect(existsSync(corpusPath)).toBe(true);
        expect(readFileSync(corpusPath, "utf8").length).toBeGreaterThan(0);
        expect(`${benchCase.kind}/${benchCase.size}`).toBe(benchCase.name);
      }
    });

    it("has scaling series", async () => {
      const spec = await loadSpec(name);
      const { scaling } = spec;

      expect(scaling).toBeDefined();
      expect(scaling!.length).toBeGreaterThanOrEqual(MIN_SCALING_SERIES);

      for (const scalingCase of scaling!) {
        const { sizes } = scalingCase;

        expect(scalingCase.name.length).toBeGreaterThan(0);
        expect(scalingCase.build).toBeTypeOf("function");
        expect(sizes).toBeDefined();
        expect(sizes!.length).toBeGreaterThanOrEqual(MIN_SCALING_SIZES);

        for (const size of sizes!) expect(scalingCase.build(size).length).toBeGreaterThan(0);
      }
    });

    it("has bilingual notes", async () => {
      const spec = await loadSpec(name);

      expect(spec.notes).toBeDefined();

      for (const note of spec.notes!) {
        expect(note.en.length).toBeGreaterThan(0);
        expect(note.zh.length).toBeGreaterThan(0);
      }

      const caseNotes = spec.correctness.filter((testCase) => testCase.note !== undefined);

      for (const testCase of caseNotes) {
        expect(testCase.note!.en.length).toBeGreaterThan(0);
        expect(testCase.note!.zh.length).toBeGreaterThan(0);
      }
    });

    it("defines every difference issue", async () => {
      const spec = await loadSpec(name);
      const issues = issuesOf(spec);
      const issueIds = issues.map((issue) => issue.id);

      expect(new Set(issueIds).size).toBe(issueIds.length);

      for (const issue of issues) {
        expect(issue.id.length).toBeGreaterThan(0);
        expect(["reference-error", "difference"]).toContain(issue.category);
        expect(issue.note.en.length).toBeGreaterThan(0);
        expect(issue.note.zh.length).toBeGreaterThan(0);
      }

      const issueMap = new Map(issues.map((issue) => [issue.id, issue]));
      const referencedCases = spec.correctness.filter((testCase) => testCase.issue !== undefined);

      for (const testCase of referencedCases) expect(issueMap.has(testCase.issue!)).toBe(true);

      const referencedIds = new Set(
        spec.correctness
          .map((testCase) => testCase.issue)
          .filter((issueId): issueId is string => issueId != null),
      );

      for (const issue of issues) expect(referencedIds.has(issue.id)).toBe(true);
    });

    it("categorizes every skipped test", async () => {
      const spec = await loadSpec(name);

      for (const skip of skipsOf(spec)) {
        expect(["feature-gap", "internal", "packaging"]).toContain(skip.category);
        expect(skip.why.en.length).toBeGreaterThan(0);
        expect(skip.why.zh.length).toBeGreaterThan(0);
      }
    });
  });
});
