import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index", {
    external: [/^@mathjax\/src\//],
  }),
  tsdownConfig("sync", {
    external: [/^@mathjax\/src\//],
  }),
];
