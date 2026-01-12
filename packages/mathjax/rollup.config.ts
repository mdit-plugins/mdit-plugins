import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    external: [/^@mathjax\/src\//, /^@mathjax\/mathjax-.*-font\//],
  }),
  ...rollupTypescript("sync", {
    external: [/^@mathjax\/src\//, /^@mathjax\/mathjax-.*-font\//],
    treeshake: {},
  }),
];
