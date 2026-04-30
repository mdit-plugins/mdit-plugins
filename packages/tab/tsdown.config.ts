import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [
  tsdownConfig("index"),
  tsdownConfig("tab"),
  tsdownConfig("register-tab", {
    format: "umd",
  }),
];

export default config;
