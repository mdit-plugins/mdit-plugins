import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("worker", {
    treeshake: {
      moduleSideEffects: [{ test: /^@mathjax\//, sideEffects: true }],
    },
  }),
  tsdownConfig("async/index"),
];

export default config;
