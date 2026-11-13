import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("index", {
    globalName: "mdItPluginFrontmatter",
    globals: {
      "markdown-it": "markdownit",
    },
    alwaysBundle: ["js-yaml"],
  }),
];

export default config;
