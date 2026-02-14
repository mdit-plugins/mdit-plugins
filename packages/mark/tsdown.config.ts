import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginMark",
    externals: {
      "markdown-it": "markdownit",
      "@mdit/plugin-inline-rule": "mdItPluginInlineRule",
    },
  }),
];
