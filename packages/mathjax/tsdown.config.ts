import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("sync"),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginMathjax",
    externals: {
      "markdown-it": "markdownit",
      "@mdit/plugin-tex": "mdItPluginTex",
    },
    noExternal: ["@mathjax/mathjax-newcm-font", "@mathjax/src"],
  }),
];
