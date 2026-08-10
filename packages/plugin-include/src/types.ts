import type { Env } from "markdown-it";

import type { includePathsKey } from "./constant.js";

export interface IncludeEnv extends Env {
  /** Included current paths */
  [includePathsKey]?: string[];
  /** Included files */
  includedFiles?: string[];
}
