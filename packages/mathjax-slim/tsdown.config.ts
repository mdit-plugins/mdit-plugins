import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index", { platform: "node" }),
  tsdownConfig("sync", {
    platform: "node",
    treeshake: {
      moduleSideEffects: [{ test: /^@mathjax\//, sideEffects: true }],
    },
  }),
];

export default config;
