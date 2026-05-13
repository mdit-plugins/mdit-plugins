import type { UserConfig } from "tsdown";

import { tsdownConfig } from "../../scripts/tsdown.ts";

const config: UserConfig = tsdownConfig("index", { platform: "node" });

export default config;
