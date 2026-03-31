import { defineHopeConfig } from "oxc-config-hope/oxlint";

export default defineHopeConfig(
  {
    ignorePatterns: ["**/__tests__/__fixtures__/", "**/.vuepress/snippets/"],
    rules: {
      complexity: "off",
      "max-depth": ["warn", 5],
      "max-params": ["warn", 5],
      "max-statements": "off",
      "new-cap": ["warn", { capIsNewExceptionPattern: "MarkdownIt" }],
      "no-multi-assign": "off",
      "no-plusplus": "off",
    },
    vitest: {
      bench: true,
    },
  },
  // some rules are disabled due to performance consideration
  {
    files: ["packages/*/src/**"],
    rules: {
      "prefer-destructuring": "off",
      "prefer-object-spread": "off",
      "prefer-spread": "off",
      "typescript/prefer-for-of": "off",
      "unicorn/no-for-loop": "off",
      "unicorn/prefer-array-flat": "off",
      "unicorn/prefer-code-point": "off",
      "unicorn/prefer-spread": "off",
    },
  },
);
