import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginFigure",
    externals: {
      "markdown-it": "markdownit",
    },
  }),
];
