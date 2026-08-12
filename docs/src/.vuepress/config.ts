import { abbr } from "@mdit/plugin-abbr";
import { container } from "@mdit/plugin-container";
import { dl } from "@mdit/plugin-dl";
import { field } from "@mdit/plugin-field";
import { ins } from "@mdit/plugin-ins";
import { layout } from "@mdit/plugin-layout";
import { ruby } from "@mdit/plugin-ruby";
import { snippet } from "@mdit/plugin-snippet";
import type { MarkdownIt } from "markdown-it";
import type { UserConfig } from "vuepress";
import { defineUserConfig } from "vuepress";
import { getDirname, path } from "vuepress/utils";

import theme from "./theme.js";

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
    // vuepress still types `md` with `@types/markdown-it` (v14), while our plugins use markdown-it v15 builtin types
    const markdownIt = md as unknown as MarkdownIt;

    markdownIt.use(abbr);
    markdownIt.use(container, {
      name: "hint",
      openRenderer: (tokens, index): string => {
        const token = tokens[index];

        // resolve info (title)
        const info = token.info.trim().slice(4).trim();

        return `<div class="custom-container hint">\n<p class="custom-container-title">${
          info ?? "Hint"
        }</p>\n`;
      },
    });
    markdownIt.use(dl);
    markdownIt.use(ins);
    markdownIt.use(layout);
    markdownIt.use(ruby);
    markdownIt.use(field);
    markdownIt.use(field, {
      name: "props",
      allowedAttributes: [
        { attr: "type", name: "Property Type" },
        { attr: "required", boolean: true },
      ],
    });
    markdownIt.use(snippet, {
      currentPath: (env) => (typeof env.filePath === "string" ? env.filePath : ""),

      // add support for @snippets/ alias
      resolvePath: (filePath: string, cwd: string | null) => {
        if (filePath.startsWith("@snippets/"))
          return path.resolve(__dirname, "snippets", filePath.replace("@snippets/", ""));

        return path.join(cwd ?? "", filePath);
      },
    });
  },

  theme,
});

export default config;
