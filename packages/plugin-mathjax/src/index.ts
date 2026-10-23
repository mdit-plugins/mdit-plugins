import type { MarkdownIt } from "markdown-it";

import { installLegacyMathjax, isMathjaxInstance } from "./legacy.js";
import type { MathjaxInstance } from "./options.js";
import { installSyncMathjax } from "./plugin.js";
import type { MarkdownItSyncMathjaxOptions } from "./plugin.js";

export * from "./createMathjaxInstance.js";
export * from "./plugin.js";
export type * from "./mathjax.js";
export type * from "./options.js";

/**
 * Install MathJax on a markdown-it instance.
 *
 * Pass options for the synchronous implementation (v2 API) or a MathJax instance created by
 * `createMathjaxInstance()` for backwards compatibility with v1.
 *
 * 在 markdown-it 实例上安装 MathJax。传 options 使用同步实现（v2 API），传 `createMathjaxInstance()` 创建的实例则兼容 v1 的用法。
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param optionsOrInstance - Plugin options or a legacy MathJax instance / 插件选项或旧版 MathJax 实例
 */
export const mathjax = (
  md: MarkdownIt,
  optionsOrInstance?: MarkdownItSyncMathjaxOptions | MathjaxInstance,
): void => {
  if (isMathjaxInstance(optionsOrInstance)) {
    installLegacyMathjax(md, optionsOrInstance);

    return;
  }

  installSyncMathjax(md, optionsOrInstance);
};
