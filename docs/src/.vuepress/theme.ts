import { hopeTheme } from "vuepress-theme-hope";

export default hopeTheme(
  {
    hostname: "https://mdit-plugins.mrhope.site",

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

    iconAssets: "//at.alicdn.com/t/c/font_2410206_s76eeqysx0t.css",

    plugins: {
      comment: {
        provider: "Giscus",
        repo: "mdit-plugins/mdit-plugins",
        repoId: "R_kgDOIr2YGw",
        category: "General",
        categoryId: "DIC_kwDOIr2YG84CTTf-",
      },

      mdEnhance: {
        align: true,
        attrs: true,
        codetabs: true,
        figure: true,
        footnote: true,
        imgLazyload: true,
        imgMark: true,
        imgSize: true,
        include: true,
        mark: true,
        mathjax: true,
        sub: true,
        sup: true,
        tabs: true,
        tasklist: true,
      },
    },
  },
  { custom: true }
);
