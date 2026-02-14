import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginDemo",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];
