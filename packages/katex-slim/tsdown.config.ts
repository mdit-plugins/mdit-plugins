import type { UserConfig } from "tsdown";
import { tsdownConfig } from "../../scripts/tsdown.js";

const config: UserConfig[] = [tsdownConfig("index"), tsdownConfig("mhchem")];

export default config;
