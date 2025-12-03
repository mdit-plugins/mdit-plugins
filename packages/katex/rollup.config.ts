import { fileURLToPath } from "node:url";

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
  ...rollupTypescript(
    {
      base: "",
      files: ["index", "mhchem"],
    },
    {
      browser: true,
      output: {
        dir: "./lib",
        file: undefined,
      },
      treeshake: {
        moduleSideEffects: ["katex", "katex/contrib/mhchem"].map((module) =>
          fileURLToPath(import.meta.resolve(module)),
        ),
      },
    },
  ),
];
