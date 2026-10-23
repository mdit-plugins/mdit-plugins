import type { MarkdownItMathjaxOptions, MathjaxInstance } from "./options.js";

/**
 * Create a MathJax instance with the async/legacy API.
 *
 * @deprecated Import it from `@mdit/plugin-mathjax/async` instead. This re-export only keeps v1
 *   consumers working during the v2 transition and is removed in the next major.
 *
 * 使用异步/旧版 API 创建 MathJax 实例。
 * @deprecated 请从 `@mdit/plugin-mathjax/async` 导入。此重导出仅用于 v2 过渡期兼容 v1 用户，将在下个大版本移除。
 * @param options - Plugin options / 插件选项
 * @returns MathJax instance / MathJax 实例
 */
export const createMathjaxInstance = async (
  options: MarkdownItMathjaxOptions = {},
): Promise<MathjaxInstance | null> => {
  // Deliberately dynamic: the main entry must not pull MathJax into the main-thread bundle.
  const { createMathjaxInstance: create } = await import("./async/index.js");

  return create(options);
};
