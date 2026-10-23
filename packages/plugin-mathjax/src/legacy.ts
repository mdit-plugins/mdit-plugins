/**
 * Backwards-compatible instance-based MathJax plugin (v1 API).
 *
 * This module has no MathJax imports: the instance created by the async entry carries a synchronous
 * `render()` function, so the legacy `mathjax(md, instance)` call can keep working without pulling
 * MathJax into the main entry bundle.
 *
 * 兼容 v1 的实例式 MathJax 插件。此模块不导入 MathJax：异步入口创建的实例自带同步 `render()`， 因此旧版 `mathjax(md, instance)`
 * 仍可用，而不会把 MathJax 打进主入口。
 */

import { tex } from "@mdit/plugin-tex";
import type { MarkdownIt } from "markdown-it";

import type { MathjaxInstance } from "./options.js";

/**
 * Check whether a value is a MathJax instance created by the async/legacy API.
 *
 * 判断一个值是否是由异步/旧版 API 创建的 MathJax 实例。
 *
 * @param value - Value to check / 待判断的值
 * @returns Whether it is a MathJax instance / 是否是 MathJax 实例
 */
export const isMathjaxInstance = (value: unknown): value is MathjaxInstance => {
  if (value == null || typeof value !== "object") return false;

  const candidate = value as Partial<MathjaxInstance>;

  return (
    typeof candidate.render === "function" &&
    typeof candidate.reset === "function" &&
    typeof candidate.outputStyle === "function" &&
    typeof candidate.documentOptions === "object"
  );
};

/**
 * Install the legacy instance-based plugin on a markdown-it instance.
 *
 * 在 markdown-it 实例上安装旧版实例式插件。
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param instance - MathJax instance from `createMathjaxInstance()` / 由 `createMathjaxInstance()`
 *   创建的实例
 */
export const installLegacyMathjax = (md: MarkdownIt, instance: MathjaxInstance): void => {
  const { allowInlineWithSpace, delimiters, mathFence, reset, transformer } = instance;

  // Reset the shared TeX input state after each render so state does not leak
  // across documents rendered by the same instance.
  const render = md.render.bind(md);
  const renderInline = md.renderInline.bind(md);

  md.render = (src, env): string => {
    try {
      return render(src, env);
    } finally {
      reset();
    }
  };
  md.renderInline = (src, env): string => {
    try {
      return renderInline(src, env);
    } finally {
      reset();
    }
  };

  md.use(tex, {
    allowInlineWithSpace,
    delimiters,
    mathFence,
    render: (content, displayMode) => {
      const result = instance.render(content, displayMode);

      return transformer?.(result, displayMode) ?? result;
    },
  });
};
