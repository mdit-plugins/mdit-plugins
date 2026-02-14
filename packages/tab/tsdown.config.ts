import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginTab",
    externals: {
      "markdown-it": "markdownit",
      "@mdit/helper": "mdItHelper",
    },
  }),
];
