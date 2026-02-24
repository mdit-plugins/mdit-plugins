import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
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

export default config;
