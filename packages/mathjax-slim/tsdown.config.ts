import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [tsdownConfig("index"), tsdownConfig("sync")];

export default config;
