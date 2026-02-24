import path from "node:path";

import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
  tsdownConfig("index", {
    type: "node",
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/node.ts"),
    },
  }),
  tsdownConfig("index", {
    type: "browser",
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/browser.ts"),
    },
  }),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginPlantuml",
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/browser.ts"),
    },
    externals: {
      "markdown-it": "markdownit",
      "@mdit/plugin-uml": "mdItPluginUml",
    },
    noExternal: ["pako"],
  }),
];

export default config;
