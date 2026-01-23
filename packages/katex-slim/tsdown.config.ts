import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  ...tsdownConfig("index", {
    external: ["@mdit/helper", "@mdit/plugin-tex", "katex"],
  }),
  ...tsdownConfig("mhchem", {
    external: ["katex", "katex/contrib/mhchem"],
    treeshake: {
      moduleSideEffects: ["katex", "katex/contrib/mhchem"],
    },
  }),
];
