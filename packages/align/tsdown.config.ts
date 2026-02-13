import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginAlign",
    externals: {
      "markdown-it": "markdownit",
      "@mdit/plugin-container": "mdItPluginContainer",
    },
  }),
];
