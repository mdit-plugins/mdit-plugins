import { defaultIgnorePatterns, getOxlintConfigs } from "oxc-config-hope/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: getOxlintConfigs({
    vitest: {
      bench: true,
    },
  }),
  options: {
    typeAware: true,
    typeCheck: true,
  },
  ignorePatterns: [
    ...defaultIgnorePatterns,
    "**/__tests__/__fixtures__/",
    "**/.vuepress/snippets/",
  ],
  rules: {
    complexity: "off",
    "max-depth": ["warn", 5],
    "max-params": ["warn", 5],
    "max-statements": "off",
    "new-cap": ["warn", { capIsNewExceptionPattern: "MarkdownIt" }],
    "no-multi-assign": "off",
    "no-plusplus": "off",
  },
  overrides: [
    {
      files: ["**/*.ts"],
      rules: {
        // we need `export {}` to convert a file to a module
        "unicorn/require-module-specifiers": "off",
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
  ],
});
