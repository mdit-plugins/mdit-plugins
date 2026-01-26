import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
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
      noExternal: ["katex", "katex/contrib/mhchem", "mdurl"],
    },
  ),
];
