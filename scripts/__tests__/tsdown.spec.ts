import { describe, expect, it, vi } from "vitest";

import { tsdownConfig } from "../tsdown.js";

describe("scripts/tsdown.ts", () => {
  it("should create an ESM config by default", () => {
    const config = tsdownConfig("index");

    expect(config).toMatchObject({
      entry: { index: "./src/index.ts" },
      format: "esm",
      outDir: "./dist",
      sourcemap: true,
      dts: true,
      minify: false,
      target: "node22",
      globalName: undefined,
      platform: "neutral",
      treeshake: {},
      deps: {
        alwaysBundle: [],
        neverBundle: [],
        onlyBundle: false,
      },
      copy: [],
      fixedExtension: false,
      logLevel: "warn",
      publint: false,
    });
    expect(config.outputOptions).toStrictEqual({ globals: {} });
  });

  it("should create a UMD config with a global name", () => {
    const config = tsdownConfig("index", {
      globalName: "mditPluginDemo",
      globals: { "markdown-it": "markdownit" },
    });

    expect(config).toMatchObject({
      entry: { cdn: "./src/index.ts" },
      format: "umd",
      dts: false,
      target: "baseline-widely-available",
      platform: "browser",
      globalName: "mditPluginDemo",
    });
    expect(config.outputOptions).toStrictEqual({ globals: { "markdown-it": "markdownit" } });
  });

  it("should suffix every non-index entry for browser and CDN builds", () => {
    expect(tsdownConfig(["index", "cli"], { platform: "browser" }).entry).toStrictEqual({
      browser: "./src/index.ts",
      "cli-browser": "./src/cli.ts",
    });
    expect(tsdownConfig(["index", "cli"], { globalName: "mditPluginDemo" }).entry).toStrictEqual({
      cdn: "./src/index.ts",
      "cli-cdn": "./src/cli.ts",
    });
  });

  it("should use node entries for node platform builds", () => {
    const config = tsdownConfig("index", { platform: "node" });

    expect(config.entry).toStrictEqual({ node: "./src/index.ts" });
    expect(config).toMatchObject({ format: "esm", dts: true, platform: "node", target: "node22" });
  });

  it("should forward bundling options", () => {
    const config = tsdownConfig("index", {
      onlyBundle: ["markdown-it"],
      alwaysBundle: ["pako"],
      neverBundle: [/^node:/],
    });

    expect(config.deps).toStrictEqual({
      alwaysBundle: ["pako"],
      neverBundle: [/^node:/],
      onlyBundle: ["markdown-it"],
    });
  });

  it("should always bundle @mdit packages for UMD builds", () => {
    const config = tsdownConfig("index", { globalName: "mditPluginDemo", alwaysBundle: ["pako"] });

    expect(config.deps?.alwaysBundle).toStrictEqual([/^@mdit\//, "pako"]);
  });

  it("should map copy entries relative to src", () => {
    const config = tsdownConfig("index", {
      copy: ["types.d.ts", { from: "./src/assets", to: "./dist/assets", flatten: true }],
    });

    expect(config.copy).toStrictEqual([
      { from: "./src/types.d.ts", flatten: false },
      { from: "./src/assets", to: "./dist/assets", flatten: true },
    ]);
  });

  it("should allow overriding default options", () => {
    const config = tsdownConfig("index", {
      outDir: "./lib",
      sourcemap: false,
      minify: true,
      logLevel: "silent",
    });

    expect(config).toMatchObject({
      outDir: "./lib",
      sourcemap: false,
      minify: true,
      logLevel: "silent",
    });
  });

  it("should enable production-only checks in production", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");

    try {
      const { tsdownConfig: productionConfig } = await import("../tsdown.js");
      const config = productionConfig("index");

      expect(config).toMatchObject({ minify: true, publint: true });
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
