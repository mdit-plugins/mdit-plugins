import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginIns",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];

export default config;
