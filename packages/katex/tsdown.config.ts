import { fileURLToPath } from "node:url";

import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index", {
    external: ["@mdit/helper", "@mdit/plugin-tex", "katex"],
  }),
  tsdownConfig("mhchem", {
    external: ["katex", "katex/contrib/mhchem"],
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
        moduleSideEffects: ["katex", "katex/contrib/mhchem"].map((module) =>
          fileURLToPath(import.meta.resolve(module)),
        ),
      },
    },
  ),
];
