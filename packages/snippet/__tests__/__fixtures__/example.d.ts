export interface SnippetEnv extends Record<string, any> {
  /** included snippet files */
  snippetFiles?: string[];
}

// #region snippet
export interface MarkdownItSnippetOptions {
  /**
   * Get current filePath
   *
   * 获得当前文件路径
   *
   * @default (path) => path
   */

  currentPath: (env: SnippetEnv) => string;

  /**
   * handle include filePath
   *
   * 处理 include 文件路径
   *
   * @default (path) => path
   */

  resolvePath?: (path: string, cwd: string | null) => string;
}
// #endregion snippet
