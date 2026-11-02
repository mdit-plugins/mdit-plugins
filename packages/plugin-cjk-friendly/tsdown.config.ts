import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    globalName: "mdItPluginCjkFriendly",
    globals: {
      "markdown-it": "markdownit",
    },
    alwaysBundle: ["get-east-asian-width"],
  }),
];

export default config;
