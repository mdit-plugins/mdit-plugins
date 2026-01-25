import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index", {
    // external: ["@mdit/helper", "@mdit/plugin-tex", "katex"],
  }),
  tsdownConfig("mhchem", {
    treeshake: {
      moduleSideEffects: ["katex", "katex/contrib/mhchem"],
    },
  }),
  tsdownConfig(
    {
      base: "",
      files: ["index", "mhchem"],
    },
    {
      browser: true,
      treeshake: {
        moduleSideEffects: ["katex", "katex/contrib/mhchem"],
      },
      noExternal: ["katex", "katex/contrib/mhchem"],
      inlineOnly: ["katex", "katex/contrib/mhchem"],
    },
  ),
];
