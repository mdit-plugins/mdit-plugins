import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getPackagesWithDist } from "../analyze.js";

const analyzeScript = path.resolve(import.meta.dirname, "..", "analyze.ts");

/**
 * Create an empty temporary packages directory
 *
 * @returns Temporary packages directory path
 */
const createTempPackagesDir = (): string => mkdtempSync(path.join(tmpdir(), "mdit-analyze-"));

/**
 * Create a package fixture with the given build output directories
 *
 * @param packagesDir Temporary packages directory
 * @param name Package directory name
 * @param outputDirs Build output directory names to create
 */
const createPackageFixture = (packagesDir: string, name: string, ...outputDirs: string[]): void => {
  mkdirSync(path.join(packagesDir, name), { recursive: true });

  for (const outputDir of outputDirs) {
    const dir = path.join(packagesDir, name, outputDir);

    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "index.js"), "export {};\n");
  }
};

/**
 * Run the analyze script
 *
 * @param dir Packages directory passed to the script
 * @returns Spawn result
 */
const runAnalyze = (dir: string): ReturnType<typeof spawnSync> =>
  spawnSync(process.execPath, [analyzeScript, dir], { encoding: "utf8" });

describe("scripts/analyze.ts", () => {
  it("should detect packages with build output", () => {
    const packagesDir = createTempPackagesDir();

    createPackageFixture(packagesDir, "plugin-has-dist", "dist");
    createPackageFixture(packagesDir, "plugin-has-lib", "lib");
    createPackageFixture(packagesDir, "plugin-no-output");

    expect(getPackagesWithDist(packagesDir)).toStrictEqual(["plugin-has-dist"]);

    rmSync(packagesDir, { force: true, recursive: true });
  });

  it("should fail when no package build output is found", () => {
    const packagesDir = createTempPackagesDir();

    createPackageFixture(packagesDir, "plugin-no-output");

    const result = runAnalyze(packagesDir);

    expect(result.status).toBe(1);
    expect(`${result.stdout as string}${result.stderr as string}`).toContain(
      "No packages with dist directory",
    );

    rmSync(packagesDir, { force: true, recursive: true });
  });
});
