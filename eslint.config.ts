import { hope } from "eslint-config-mister-hope";

export default hope({
  ignores: [
    "packages/*/lib/**",
    "packages/*/src/lib/**",
    "**/.vuepress/snippets/",
    "**/__tests__/__fixtures__/**",
  ],
  ts: {
    parserOptions: {
      projectService: {
        allowDefaultProject: [".markdownlint-cli2.mjs", "eslint.config.js"],
      },
    },
    rules: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allowSingleOrDouble",
          trailingUnderscore: "allow",
        },
        {
          selector: ["variable"],
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allowSingleOrDouble",
          trailingUnderscore: "allowSingleOrDouble",
        },
        {
          selector: ["parameter"],
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        // allow locales path like `/zh/` and css property like `line-width`
        {
          selector: ["property"],
          format: null,
          custom: {
            regex: "(^/$|^/.*/$|^[a-z]+(?:-[a-z]+)*?$)",
            match: true,
          },
          filter: "(^/$|^/.*/$|^[a-z]+(?:-[a-z]+)*?$)",
        },
        {
          selector: ["property"],
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "import",
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      "no-console": "off",
    },
  },
});
