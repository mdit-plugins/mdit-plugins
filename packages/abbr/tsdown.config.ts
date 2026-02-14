import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginAbbr",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];
