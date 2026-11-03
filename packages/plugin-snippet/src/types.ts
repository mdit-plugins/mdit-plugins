import type { Env } from "markdown-it";

import type { SnippetCache } from "./cache.js";
import type { snippetCacheKey } from "./constant.js";

export interface SnippetEnv extends Env {
  /** Included snippet files */
  snippetFiles?: string[];
  /** Per-render file and security cache / 单次渲染的文件与安全校验缓存 */
  [snippetCacheKey]?: SnippetCache;
}
