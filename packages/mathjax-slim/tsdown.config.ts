import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig = tsdownConfig("index", {
  treeshake: {
    moduleSideEffects: (id, external) => {
      if (!external) return true;

      return id.startsWith("@mathjax/src/");
    },
  },
});

export default config;
