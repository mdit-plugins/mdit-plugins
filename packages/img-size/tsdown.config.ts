import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginImgSize",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];
