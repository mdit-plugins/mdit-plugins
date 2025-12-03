import { rollupTypescript } from "../../scripts/rollup.js";

export default [
  ...rollupTypescript("index", {
    external: ["@mdit/helper", "@mdit/plugin-tex", "katex"],
  }),
  ...rollupTypescript("mhchem", {
    external: ["katex", "katex/contrib/mhchem"],
    treeshake: {
      moduleSideEffects: ["katex", "katex/contrib/mhchem"],
    },
  }),
];
