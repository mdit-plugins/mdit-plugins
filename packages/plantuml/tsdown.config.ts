import path from "node:path";

import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index", {
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/node.ts"),
    },
  }),
  tsdownConfig("index", {
    browser: true,
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/browser.ts"),
    },
  }),
];
