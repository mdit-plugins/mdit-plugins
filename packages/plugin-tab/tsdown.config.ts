import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    globalName: "mdItPluginTab",
    globals: {
      "markdown-it": "markdownit",
    },
  }),
  tsdownConfig("tab"),
  tsdownConfig("register-tab", {
    format: "umd",
  }),
];

export default config;
