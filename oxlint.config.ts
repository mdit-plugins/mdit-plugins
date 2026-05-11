import { defineHopeConfig } from "oxc-config-hope/oxlint";

export default defineHopeConfig(
  {
    ignore: ["**/__tests__/__fixtures__/", "**/.vuepress/snippets/"],
    rules: {
      complexity: "off",
      "max-depth": ["warn", 5],
      "max-params": ["warn", 5],
      "max-statements": "off",
      "new-cap": ["warn", { capIsNewExceptionPattern: "MarkdownIt" }],
      "no-multi-assign": "off",
      "no-plusplus": "off",
      "require-unicode-regexp": "off",
      "vitest/max-expects": ["warn", { max: 10 }],
      "vitest/valid-describe-callback": "off",
      // oxlint-disable-next-line no-warning-comments
      // FIXME: https://github.com/oxc-project/oxc/issues/22268
      "vitest/valid-title": "off",
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
      "unicorn/prefer-array-flat": "off",
      "unicorn/prefer-code-point": "off",
      "unicorn/prefer-spread": "off",
    },
  },
);
