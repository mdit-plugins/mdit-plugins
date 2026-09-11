import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    globalName: "mdItPluginAdvancedLinks",
    globals: {
      "markdown-it": "markdownit",
    },
  }),
];

export default config;
