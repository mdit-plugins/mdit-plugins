import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginSpoiler",
    externals: {
      "markdown-it": "markdownit",
      "@mdit/plugin-inline-rule": "mdItPluginInlineRule",
    },
  }),
];
