import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginFootnote",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];
