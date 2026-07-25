import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    globalName: "mdItPluginDemo",
    globals: {
      "markdown-it": "markdownit",
    },
  }),
];

export default config;
