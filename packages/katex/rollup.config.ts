import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    external: ["katex", "katex/contrib/mhchem"],
  }),
  ...rollupTypescript("browser", {
    output: {
      dir: "./lib",
      file: null,
    },
    external: false,
  }),
];
