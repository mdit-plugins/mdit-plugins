import { hopeTheme } from "vuepress-theme-hope";

export default hopeTheme(
  {
    hostname: "https://mdit-plugins.github.io",

    logo: "/logo.svg",
    repo: "mdit-plugins/mdit-plugins",
    docsDir: "docs/src",
    docsBranch: "main",

    pageInfo: false,
    contributors: false,

    locales: {
      "/": {
        sidebar: "structure",
        footer:
          'Docs by <a href="https://theme-hope.vuejs.press/" target="_blank">VuePress Theme Hope</a>',
        copyright: "MIT LICENSE | Copyright © 2022-present Mr.Hope",

        displayFooter: true,
      },

      "/zh/": {
        sidebar: "structure",
        footer:
          '文档由 <a href="https://theme-hope.vuejs.press/zh/" target="_blank">VuePress Theme Hope</a> 创建',
        copyright: "MIT 协议 | 版权所有 © 2022-present Mr.Hope",
        displayFooter: true,
      },
    },

    markdown: {
      align: true,
      alert: true,
      attrs: true,
      codeTabs: true,
      demo: true,
      figure: true,
      footnote: true,
      imgLazyload: true,
      highlighter: {
        type: "shiki",
        lineNumbers: 10,
      },
      imgMark: true,
      imgSize: true,
      legacyImgSize: true,
      include: true,
      math: {
        type: "mathjax",
      },
      mark: true,
      plantuml: true,
      spoiler: true,
      sub: true,
      sup: true,
      tabs: true,
      tasklist: true,
    },

    plugins: {
      comment: {
        provider: "Giscus",
        repo: "mdit-plugins/mdit-plugins",
        repoId: "R_kgDOIr2YGw",
        category: "General",
        categoryId: "DIC_kwDOIr2YG84CTTf-",
      },

      docsearch: {
        appId: "SIZGZ1FGFU",
        apiKey: "0ee82673983c6cd1b9c8d93fbfbe61eb",
        indexName: `mdit-pluginsio`,
      },

      git: {
        contributors: {
          avatar: true,
          info: [
            {
              username: "Mister-Hope",
              alias: "Mr.Hope",
              email: "mister-hope@outlook.com",
              emailAlias: "zhangbowang1998@gmail.com",
            },
          ],
        },
        changelog: true,
      },

      icon: {
        assets: "fontawesome",
      },
    },
  },
  { custom: true },
);
