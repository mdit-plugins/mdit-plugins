import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginLayout",
    externals: {
      "markdown-it": "markdownit",
      "@mdit/helper": "mdItHelper",
    },
  }),
];
