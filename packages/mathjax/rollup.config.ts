import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    external: [/^@mathjax\/src\//],
  }),
  ...rollupTypescript("sync", {
    external: [/^@mathjax\/src\//],
    treeshake: {},
  }),
];
