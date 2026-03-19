import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    globalName: "mdItPluginTasklist",
    globals: {
      "markdown-it": "markdownit",
    },
  }),
];

export default config;
