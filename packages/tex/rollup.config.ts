import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    external: ["@mdit/helper"],
  }),
  ...rollupTypescript("index", {
    output: {
      file: "./lib/browser.js",
    },
    resolve: true,
  }),
];
