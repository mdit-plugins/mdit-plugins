import path from "node:path";

import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/node.ts"),
    },
  }),
  ...rollupTypescript("index", {
    output: {
      file: "./lib/browser.js",
    },
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/browser.ts"),
    },
    external: false,
    dts: false,
  }),
];
