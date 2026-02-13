import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginEmbed",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];
