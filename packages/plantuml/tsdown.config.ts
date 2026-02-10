import path from "node:path";

import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
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
];
