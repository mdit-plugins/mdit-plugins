import type { SecurityCache } from "./security.js";

export interface CachedSnippetFile {
  /** File modification time (ms) when the content was read / 读取内容时的文件修改时间（毫秒） */
  mtimeMs: number;
  /** File size when the content was read / 读取内容时的文件大小 */
  size: number;
  /** Raw file content / 文件原始内容 */
  content: string;
  /** Newline-split lines, created on the first region request / 按行拆分的内容，首次请求区域时创建 */
  lines?: string[];
  /** Extracted regions keyed by region name (whole-file fallback included) */
  regions: Map<string, string>;
}

/**
 * Cache shared by all snippets of one render, stored on the markdown-it render env.
 *
 * File entries are revalidated with `statSync` (mtime + size) on every use, so a file rewritten
 * between renders is re-read even when the same env object is reused. Security verdicts are cleared
 * at the start of every parse, so they never outlive a render.
 *
 * 单次渲染中所有 snippet 共享的缓存，存放在 markdown-it 的 render env 上。
 *
 * 每次使用文件条目时都会用 `statSync`（mtime + size）校验，因此即使复用同一个
 * env，两次渲染之间被修改的文件也会重新读取；安全校验结果在每次解析开始时清空，不会跨渲染复用。
 */
export interface SnippetCache {
  /** Successfully read files, keyed by absolute snippet path / 读取成功的文件，按绝对路径索引 */
  files: Map<string, CachedSnippetFile>;
  /** Security verdicts for the current render / 当前渲染的安全校验结果 */
  security: SecurityCache;
}
