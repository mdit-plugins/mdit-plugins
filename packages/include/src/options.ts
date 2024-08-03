import type { IncludeEnv } from "./types.js";

export interface MarkdownItIncludeOptions {
  /**
   * Get current filePath
   *
   * 获得当前文件路径
   *
   * @default (path) => path
   */

  currentPath: (env: IncludeEnv) => string;

  /**
   * handle include filePath
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
}
