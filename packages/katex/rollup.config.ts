import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    external: [
      "@mdit/helper",
      "@mdit/plugin-tex",
      "katex",
      "katex/contrib/mhchem",
    ],
  }),
  ...rollupTypescript("browser", {
    resolve: true,
    output: {
      dir: "./lib",
      file: null,
    },
  }),
];
