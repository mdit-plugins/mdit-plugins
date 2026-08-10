import type { TokenMeta } from "@mdit/helper";
import type { Env, StateBlock } from "markdown-it";

import type { layoutKey } from "./constant.js";

export interface LayoutMeta extends TokenMeta {
  type: number;
  classes: string[];
  id: string;
  utilities: string[];
}

export interface LayoutContext {
  type: number;
  level: number;
  depth: number;
}

export interface LayoutEnv extends Env {
  [layoutKey]?: LayoutContext | undefined;
}

export interface LayoutStateBlock extends StateBlock {
  env: LayoutEnv;
}
