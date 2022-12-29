import { hopeTheme } from "vuepress-theme-hope";

export default hopeTheme({
  hostname: "https://mister-hope.github.io/mdit-plugins/",

  logo: "/logo.svg",
  repo: "Mister-Hope/mdit-plugins",
  docsDir: "docs/src",
  docsBranch: "main",

  pageInfo: false,

  contributors: false,

  locales: {
    "/": {
      sidebar: "structure",
      footer: "MIT LICENSE | Copyright © 2022-present Mr.Hope",

      displayFooter: true,
    },

    "/zh/": {
      sidebar: "structure",

      footer: "MIT 协议 | Copyright © 2022-present Mr.Hope",
      displayFooter: true,
    },
  },

  iconAssets: "//at.alicdn.com/t/c/font_2410206_s76eeqysx0t.css",

  plugins: {
    comment: {
      provider: "Giscus",
      repo: "Mister-Hope/mdit-plugins",
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
      mathjax: true,
      sub: true,
      sup: true,
      tasklist: true,
    },
  },
});
