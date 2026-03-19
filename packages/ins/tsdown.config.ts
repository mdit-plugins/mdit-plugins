import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    cdn: true,
    globalName: "mdItPluginIns",
    globals: {
      "markdown-it": "markdownit",
    },
  }),
];

export default config;
