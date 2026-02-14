import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
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

export default config;
