import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index"),
  ...rollupTypescript("index", {
    browser: true,
  }),
];
