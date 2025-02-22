import { defaultNamingConventionRules, hope } from "eslint-config-mister-hope";

export default hope({
  ignores: [
    "packages/*/lib/**",
    "packages/*/src/lib/**",
    "**/.vuepress/snippets/",
    "**/__tests__/__fixtures__/**",
  ],

  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: [".markdownlint-cli2.mjs", "eslint.config.js"],
      },
    },
  },

  ts: {
    "@typescript-eslint/naming-convention": [
      "warn",

      // allow property starting with `@`
      {
        selector: ["property"],
        filter: {
          regex: "^@",
          match: true,
        },
        format: null,
      },

      // allow locales path like `/zh/`
      {
        selector: ["property"],
        filter: {
          regex: "(?:^@|^/$|^/.*/$)",
          match: true,
        },
        format: null,
      },

      // allow css property like `line-width`
      {
        selector: ["property"],
        filter: {
          regex: "^[a-z]+(?:-[a-z]+)*?$",
          match: true,
        },
        format: null,
      },

      ...defaultNamingConventionRules,
    ],
    "no-console": "off",
  },
});
