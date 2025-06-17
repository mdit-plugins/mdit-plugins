import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index"),
  ...rollupTypescript("index", {
    output: {
      file: "./lib/browser.js",
    },
    resolve: true,
  }),
];
