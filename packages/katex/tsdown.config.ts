import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("mhchem", {
    treeshake: {
      moduleSideEffects: ["katex", "katex/contrib/mhchem"],
    },
  }),
  tsdownConfig(["index", "mhchem"], {
    type: "cdn",
    treeshake: {
      moduleSideEffects: [
        {
          test: /^katex($|\/)/,
          sideEffects: true,
          external: false,
        },
      ],
    },
    noExternal: ["katex", "katex/contrib/mhchem"],
  }),
];
