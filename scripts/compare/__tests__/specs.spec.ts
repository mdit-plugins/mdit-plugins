import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import type { ComparisonSpec } from "../types.ts";

const SPECS_DIR = path.resolve(import.meta.dirname, "..", "specs");
const SIZES = ["small", "medium", "large"] as const;
const KINDS = ["normal", "heavy"] as const;
const EXPECTED_BENCH_NAMES = KINDS.flatMap((kind) => SIZES.map((size) => `${kind}/${size}`));
const MIN_CORRECTNESS_CASES = 10;
const MIN_SCALING_SERIES = 2;
const MIN_SCALING_SIZES = 4;

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
        expect(benchCase.markdown.length).toBeGreaterThan(0);
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
  });
});
