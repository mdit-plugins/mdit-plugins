import { defineHopeConfig } from "oxc-config-hope/oxfmt";
import type { OxfmtConfig } from "oxc-config-hope/oxfmt";

const oxfmtConfig: OxfmtConfig = defineHopeConfig({
  sortImports: {
    internalPattern: ["@deflate"],
  },
  ignorePatterns: [
    "**/tab.md",
    // Generated comparison data is written by `compare/run.ts`, not maintained by hand.
    "compare/results/plugin-*.json",
    // Benchmark corpora are fixtures read verbatim by the comparison harness.
    "compare/corpora/**",
    // Generated data consumed by the docs comparison page.
    "docs/src/.vuepress/data/*.json",
  ],
});

export default oxfmtConfig;
