import { tsdownConfig } from "../../scripts/tsdown.js";

export default [
  tsdownConfig("index"),
  tsdownConfig("mhchem", {
    treeshake: {
      moduleSideEffects: ["katex", "katex/contrib/mhchem"],
    },
  }),
  tsdownConfig("index", {
    type: "cdn",
    globalName: "mdItPluginKatex",
    externals: {
      "markdown-it": "markdownit",
      "@mdit/helper": "mdItHelper",
      "@mdit/plugin-tex": "mdItPluginTex",
      katex: "katex",
      "katex/contrib/mhchem": "katex",
    },
  }),
  tsdownConfig("mhchem", {
    type: "cdn",
    globalName: "mdItPluginKatexMhchem",
    externals: {
      "markdown-it": "markdownit",
      "@mdit/helper": "mdItHelper",
      "@mdit/plugin-tex": "mdItPluginTex",
      katex: "katex",
      "katex/contrib/mhchem": "katex",
    },
  }),
];
