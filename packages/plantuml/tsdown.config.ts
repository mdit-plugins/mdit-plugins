import path from "node:path";

import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
  tsdownConfig("index", {
    platform: "node",
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/node.ts"),
    },
  }),
  tsdownConfig("index", {
    platform: "browser",
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/browser.ts"),
    },
  }),
  tsdownConfig("index", {
    globalName: "mdItPluginPlantuml",
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/browser.ts"),
    },
    globals: {
      "markdown-it": "markdownit",
    },
    alwaysBundle: ["pako"],
  }),
];

export default config;
