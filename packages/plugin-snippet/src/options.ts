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

  /**
   * Allow reading files outside `projectRoot`
   *
   * 是否允许读取 projectRoot 之外的文件
   *
   * @default false
   */
  allowOutsideRoot?: boolean;

  /**
   * Project root; relative paths are resolved against `process.cwd()`
   *
   * 项目根目录；相对路径按 process.cwd() 解析
   *
   * @default process.cwd()
   */
  projectRoot?: string;

  /**
   * Patterns of files that must not be read, even inside `projectRoot`. When provided, replaces the
   * default list (spread `defaultSensitiveFiles` to extend).
   *
   * 即使在 projectRoot 内也禁止读取的文件模式；传入时替换默认列表 （需要扩展时展开 defaultSensitiveFiles）。
   *
   * @default defaultSensitiveFiles
   */
  denyFiles?: readonly (string | RegExp)[];
}
