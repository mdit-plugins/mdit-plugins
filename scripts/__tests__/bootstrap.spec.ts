import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

const bootstrapScript = path.resolve(import.meta.dirname, "..", "bootstrap.ts");

/**
 * Create an empty temporary repository directory
 *
 * @returns Temporary directory path
 */
const createTempRepo = (): string => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mdit-bootstrap-"));

  mkdirSync(path.join(tempDir, "packages"), { recursive: true });

  return tempDir;
};

/**
 * Create a package directory fixture
 *
 * @param tempDir Temporary repository directory
 * @param name Directory name under packages/
 * @param options Fixture options
 */
const createPackageDir = (
  tempDir: string,
  name: string,
  options: { entry?: boolean; packageJSON?: Record<string, unknown> } = {},
): void => {
  const { entry = true, packageJSON } = options;
  const pkgDir = path.join(tempDir, "packages", name);

  mkdirSync(path.join(pkgDir, "src"), { recursive: true });

  if (entry) writeFileSync(path.join(pkgDir, "src", "index.ts"), "export {};\n");

  if (packageJSON) writeFileSync(path.join(pkgDir, "package.json"), JSON.stringify(packageJSON));
};

/**
 * Run the bootstrap script with the temporary directory as cwd
 *
 * @param tempDir Temporary repository directory
 */
const runBootstrap = (tempDir: string): void => {
  execFileSync(process.execPath, [bootstrapScript], {
    cwd: tempDir,
    encoding: "utf8",
    stdio: "pipe",
  });
};

/**
 * Read a generated package.json
 *
 * @param tempDir Temporary repository directory
 * @param name Package directory name
 * @returns Parsed package.json
 */
const readPackageJSON = (tempDir: string, name: string): Record<string, unknown> =>
  JSON.parse(readFileSync(path.join(tempDir, "packages", name, "package.json"), "utf8")) as Record<
    string,
    unknown
  >;

describe("scripts/bootstrap.ts", () => {
  it("should use a valid initial semver version", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "plugin-demo");
    runBootstrap(tempDir);

    expect(readPackageJSON(tempDir, "plugin-demo").version).toBe("0.0.0");

    rmSync(tempDir, { force: true, recursive: true });
  });

  it("should use the types condition in exports", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "plugin-demo");
    runBootstrap(tempDir);

    const { exports } = readPackageJSON(tempDir, "plugin-demo") as {
      exports: Record<string, unknown>;
    };

    expect(exports["."]).toStrictEqual({
      default: "./dist/index.js",
      types: "./dist/index.d.ts",
    });

    rmSync(tempDir, { force: true, recursive: true });
  });

  it("should map directory names to scoped package names", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "helper");
    createPackageDir(tempDir, "plugin-mark");
    runBootstrap(tempDir);

    expect(readPackageJSON(tempDir, "helper").name).toBe("@mdit/helper");
    expect(readPackageJSON(tempDir, "plugin-mark").name).toBe("@mdit/plugin-mark");

    rmSync(tempDir, { force: true, recursive: true });
  });

  it("should only bootstrap package directories with src/index.ts", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "plugin-ready");
    createPackageDir(tempDir, "plugin-no-entry", { entry: false });
    mkdirSync(path.join(tempDir, "packages", "empty-dir"), { recursive: true });
    writeFileSync(path.join(tempDir, "packages", ".DS_Store"), "");
    runBootstrap(tempDir);

    expect(existsSync(path.join(tempDir, "packages", "plugin-ready", "package.json"))).toBe(true);
    expect(existsSync(path.join(tempDir, "packages", "plugin-no-entry", "package.json"))).toBe(
      false,
    );
    expect(existsSync(path.join(tempDir, "packages", "empty-dir", "package.json"))).toBe(false);
    expect(existsSync(path.join(tempDir, "packages", ".DS_Store", "package.json"))).toBe(false);

    rmSync(tempDir, { force: true, recursive: true });
  });

  it("should not overwrite a package with an existing package.json", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "plugin-existing", {
      packageJSON: { name: "@mdit/plugin-existing", version: "9.9.9" },
    });
    runBootstrap(tempDir);

    expect(readPackageJSON(tempDir, "plugin-existing")).toStrictEqual({
      name: "@mdit/plugin-existing",
      version: "9.9.9",
    });

    rmSync(tempDir, { force: true, recursive: true });
  });

  it("should generate a README for bootstrapped packages", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "plugin-demo");
    runBootstrap(tempDir);

    const readme = readFileSync(path.join(tempDir, "packages", "plugin-demo", "README.md"), "utf8");

    expect(readme).toContain("# @mdit/plugin-demo");
    expect(readme).toContain("demo plugin for MarkdownIt.");
    expect(readme).toContain(
      "## [Docs](https://mdit-plugins.github.io/demo.html) | [文档](https://mdit-plugins.github.io/zh/demo.html)",
    );
    expect(readme).toContain("pnpm add -D @mdit/plugin-demo");

    rmSync(tempDir, { force: true, recursive: true });
  });

  it("should generate package metadata matching existing packages", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "plugin-demo");
    runBootstrap(tempDir);

    const pkg = readPackageJSON(tempDir, "plugin-demo");

    expect(pkg.sideEffects).toBe(false);
    expect(pkg.unpkg).toBe("./dist/cdn.umd.js");
    expect(pkg.jsdelivr).toBe("./dist/cdn.umd.js");
    expect(pkg.engines).toStrictEqual({ node: ">=22" });
    expect(pkg.dependencies).toStrictEqual({ "@mdit/helper": "workspace:^" });
    expect(pkg).not.toHaveProperty("main");
    expect(pkg).not.toHaveProperty("types");

    rmSync(tempDir, { force: true, recursive: true });
  });

  it("should generate a tsdown config with the UMD global name", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "plugin-demo-box");
    runBootstrap(tempDir);

    const config = readFileSync(
      path.join(tempDir, "packages", "plugin-demo-box", "tsdown.config.ts"),
      "utf8",
    );

    expect(config).toContain('tsdownConfig("index")');
    expect(config).toContain('globalName: "mdItPluginDemoBox"');
    expect(config).toContain('"markdown-it": "markdownit"');
    expect(config).toContain("export default config;");

    rmSync(tempDir, { force: true, recursive: true });
  });

  it("should copy the repository LICENSE into the package", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "plugin-demo");
    runBootstrap(tempDir);

    const repositoryLicense = readFileSync(
      path.resolve(import.meta.dirname, "..", "..", "LICENSE"),
      "utf8",
    );
    const packageLicense = readFileSync(
      path.join(tempDir, "packages", "plugin-demo", "LICENSE"),
      "utf8",
    );

    expect(packageLicense).toBe(repositoryLicense);

    rmSync(tempDir, { force: true, recursive: true });
  });

  it("should generate the ESM-only template for the helper package", () => {
    const tempDir = createTempRepo();

    createPackageDir(tempDir, "helper");
    runBootstrap(tempDir);

    const pkg = readPackageJSON(tempDir, "helper");
    const config = readFileSync(
      path.join(tempDir, "packages", "helper", "tsdown.config.ts"),
      "utf8",
    );

    expect(pkg.unpkg).toBeUndefined();
    expect(pkg.jsdelivr).toBeUndefined();
    expect(pkg.dependencies).toBeUndefined();
    expect(config).toContain('const config: UserConfig = tsdownConfig("index");');
    expect(config).not.toContain("globalName");

    rmSync(tempDir, { force: true, recursive: true });
  });
});
