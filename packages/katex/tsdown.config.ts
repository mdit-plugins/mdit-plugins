import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
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
      katex: "katex",
    },
  }),
  tsdownConfig("mhchem", {
    type: "cdn",
    globalName: "mdItPluginKatexMhchem",
    externals: {
      "markdown-it": "markdownit",
      katex: "katex",
    },
  }),
];

export default config;
