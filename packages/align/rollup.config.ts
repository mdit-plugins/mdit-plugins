import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    external: ["@mdit/plugin-container"],
  }),
  ...rollupTypescript("index", {
    output: {
      file: "./lib/browser.js",
    },
    resolve: true,
  }),
];
