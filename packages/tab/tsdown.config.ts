import type { UserConfig } from "tsdown";
import { defineConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.js";

const isProduction = process.env.NODE_ENV === "production";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    globalName: "mdItPluginTab",
    globals: {
      "markdown-it": "markdownit",
    },
  }),
  tsdownConfig("tab"),
  defineConfig({
    entry: { "register-tab": "./src/register-tab.ts" },
    format: "umd",
    outDir: "./dist",
    sourcemap: true,
    dts: false,
    platform: "browser",
    target: ["chrome107", "edge107", "firefox104", "safari16"],
    deps: {
      alwaysBundle: [/^@mdit\//],
    },
    fixedExtension: false,
    minify: isProduction,
  }),
];

export default config;
