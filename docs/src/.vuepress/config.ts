import { abbr } from "@mdit/plugin-abbr";
import { container } from "@mdit/plugin-container";
// import { demo } from "@mdit/plugin-demo";
import { dl } from "@mdit/plugin-dl";
import { ins } from "@mdit/plugin-ins";
import { ruby } from "@mdit/plugin-ruby";
import { snippet } from "@mdit/plugin-snippet";
import { defineUserConfig } from "vuepress";
import type { MarkdownEnv } from "vuepress/markdown";
import { getDirname, path } from "vuepress/utils";

import theme from "./theme.js";

const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "en-US",
      title: "Markdown It Plugins",
      description: "Some powerful markdown-it plugins",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "Markdown It 插件",
      description: "一些强大的 markdown-it 插件",
    },
  },

  pagePatterns: ["**/*.md", "!**/*.snippet.md", "!.vuepress", "!node_modules"],

  extendsMarkdown: (md) => {
    md.use(abbr);
    md.use(container, {
      name: "hint",
      openRender: (tokens, index): string => {
        const token = tokens[index];

        // resolve info (title)
        const info = token.info.trim().slice(4).trim();

        return `<div class="custom-container hint">\n<p class="custom-container-title">${
          info || "Hint"
        }</p>\n`;
      },
    });
    md.use(dl);
    md.use(ins);
    md.use(ruby);
    md.use(snippet, {
      currentPath: (env: MarkdownEnv) => env.filePath,

      // add support for @snippets/ alias
      resolvePath: (filePath: string, cwd: string) => {
        if (filePath.startsWith("@snippets/"))
          return path.resolve(
            __dirname,
            "snippets",
            filePath.replace("@snippets/", ""),
          );

        return path.join(cwd, filePath);
      },
    });
  },

  theme,
});
