import type { Env } from "markdown-it";

import type { includeNonceKey, includePathsKey } from "./constant.js";

export interface IncludeEnv extends Env {
  /** Included current paths */
  [includePathsKey]?: string[];
  /** Nonce of the internal include markers / 内部 include 标记的 nonce */
  [includeNonceKey]?: string;
  /** Included files */
  includedFiles?: string[];
}
