import { defineHopeConfig } from "oxc-config-hope/oxfmt";
import type { OxfmtConfig } from "oxc-config-hope/oxfmt";

const oxfmtConfig: OxfmtConfig = defineHopeConfig({
  sortImports: {
    internalPattern: ["@deflate"],
  },
  ignorePatterns: ["**/tab.md"],
});

export default oxfmtConfig;
