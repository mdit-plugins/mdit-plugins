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
    globalName: "mdItPluginKatex",
    globals: {
      "markdown-it": "markdownit",
      katex: "katex",
    },
  }),
  tsdownConfig("mhchem", {
    globalName: "mdItPluginKatexMhchem",
    globals: {
      "markdown-it": "markdownit",
      katex: "katex",
    },
  }),
];

export default config;
