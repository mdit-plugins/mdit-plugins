import { defineHopeConfig } from "oxc-config-hope/oxfmt";
import type { OxfmtConfig } from "oxc-config-hope/oxfmt";

const oxfmtConfig: OxfmtConfig = defineHopeConfig({
  sortImports: {
    internalPattern: ["@deflate"],
  },
  ignorePatterns: [
    "**/tab.md",
    // Generated comparison data is written by `scripts/compare/run.ts`, not maintained by hand.
    "scripts/compare/results/plugin-*.json",
  ],
});

export default oxfmtConfig;
