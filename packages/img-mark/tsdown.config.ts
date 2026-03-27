import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    globalName: "mdItPluginImgMark",
    globals: {
      "markdown-it": "markdownit",
    },
  }),
];

export default config;
