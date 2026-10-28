import type { IncludeEnv } from "./types.js";

export interface MarkdownItIncludeOptions {
  /**
   * Get current file path
   *
   * 获取当前文件路径
   */
  currentPath: (env: IncludeEnv) => string;

  /**
   * Handle include filePath
   *
   * 处理 include 文件路径
   *
   * @default (path) => path
   */
  resolvePath?: (path: string, cwd: string | null) => string;

  /**
   * Whether deep include files in included Markdown files
   *
   * 是否深度导入包含的 Markdown 文件
   *
   * @default false
   */
  deep?: boolean;

  /**
   * Whether use `<!-- @include: xxx -->` instead of `@include: xxx` to include files
   *
   * 是否使用 `<!-- @include: xxx -->` 代替 `@include: xxx` 导入文件
   *
   * @default true
   */
  useComment?: boolean;

  /**
   * Whether resolve the image related path in the included Markdown file
   *
   * 是否解析包含的 Markdown 文件的里的相对图像路径
   *
   * @default true
   */
  resolveImagePath?: boolean;

  /**
   * Whether resolve the related file link path in the included Markdown file
   *
   * 是否解析包含的 Markdown 文件的里的文件相对路径
   *
   * @default true
   */
  resolveLinkPath?: boolean;

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
