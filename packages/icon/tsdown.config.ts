import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginIcon",
    externals: {
      "markdown-it": "markdownit",
      "@mdit/helper": "mdItHelper",
    },
  }),
];
