import type { SnippetEnv } from "./types.js";

export interface MarkdownItSnippetOptions {
  /**
   * Get current file path
   *
   * 获取当前文件路径
   */
  currentPath: (env: SnippetEnv) => string;

  /**
   * Handle snippet file path
   *
   * 处理 snippet 文件路径
   *
   * @default (path) => path
   */
  resolvePath?: (path: string, cwd: string | null) => string;
}
