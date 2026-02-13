import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginEmoji",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];
