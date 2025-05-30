import path from "node:path";

import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    external: ["node:zlib", "@mdit/plugin-uml"],
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/node.ts"),
    },
  }),
  ...rollupTypescript("index", {
    external: ["@mdit/plugin-uml"],
    output: {
      file: "./lib/browser.js",
    },
    resolve: true,
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "./src/deflate/browser.ts"),
    },
  }),
];
