import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginDl",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];
