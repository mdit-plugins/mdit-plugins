import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginTex",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];
