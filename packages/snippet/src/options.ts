import type { SnippetEnv } from "./types.js";

export interface MarkdownItSnippetOptions {
  /**
   * Get current filePath
   *
   * 获得当前文件路径
   *
   * @default (path) => path
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentPath: (env: SnippetEnv) => string;

  /**
   * handle include filePath
   *
   * 处理 include 文件路径
   *
   * @default (path) => path
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvePath?: (path: string, cwd: string | null) => string;
}
