import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    external: ["@mdit/helper", "@mdit/plugin-tex", "katex"],
  }),
  ...rollupTypescript("mhchem", {
    external: ["katex", "katex/contrib/mhchem"],
    sideEffects: ["katex", "katex/contrib/mhchem"],
  }),
  ...rollupTypescript(
    { files: ["browser", "mhchem-browser"] },
    {
      resolve: true,
      sideEffects: ["katex", "katex/contrib/mhchem"],
      output: {
        dir: "./lib",
        file: null,
      },
    },
  ),
];
