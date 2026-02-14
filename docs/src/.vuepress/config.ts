import { abbr } from "@mdit/plugin-abbr";
import { container } from "@mdit/plugin-container";
import { dl } from "@mdit/plugin-dl";
import { ins } from "@mdit/plugin-ins";
import { layout } from "@mdit/plugin-layout";
import { ruby } from "@mdit/plugin-ruby";
import { snippet } from "@mdit/plugin-snippet";
import type { UserConfig } from "vuepress";
import { defineUserConfig } from "vuepress";
import type { MarkdownEnv } from "vuepress/markdown";
import { getDirname, path } from "vuepress/utils";

import theme from "./theme.js";
import { field } from "@mdit/plugin-field";

const __dirname = getDirname(import.meta.url);

const config: UserConfig = defineUserConfig({
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
          info ?? "Hint"
        }</p>\n`;
      },
    });
    md.use(dl);
    md.use(ins);
    md.use(layout);
    md.use(ruby);
    md.use(field);
    md.use(field, {
      name: "props",
      allowedAttributes: [
        { attr: "type", name: "Property Type" },
        { attr: "required", boolean: true },
      ],
    });
    md.use(snippet, {
      currentPath: (env: MarkdownEnv) => env.filePath,

      // add support for @snippets/ alias
      resolvePath: (filePath: string, cwd: string) => {
        if (filePath.startsWith("@snippets/"))
          return path.resolve(__dirname, "snippets", filePath.replace("@snippets/", ""));

        return path.join(cwd, filePath);
      },
    });
  },

  theme,
});

export default config;
