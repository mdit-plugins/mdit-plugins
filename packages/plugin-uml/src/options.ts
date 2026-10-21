import { escapeHtml } from "@mdit/helper";
import type { MarkdownItOptions, RendererRule, Token } from "markdown-it";

export interface MarkdownItUMLOptions {
  /**
   * UML name
   *
   * UML 名称
   */
  name: string;

  /**
   * Opening marker
   *
   * 开始标记
   */
  open: string;

  /**
   * Closing marker
   *
   * 结束标记
   */
  close: string;

  /**
   * Render function
   *
   * 渲染函数
   */
  renderer: RendererRule;
}

export const defaultRenderer = (
  tokens: Token[],
  index: number,
  options: Required<MarkdownItOptions>,
): string => {
  const token = tokens[index];

  // `title` is always escaped: it is embedded into an attribute and must never
  // be able to break out of it, regardless of the `html` option.
  // The content follows markdown-it's semantics: with `html: false` the plugin
  // must not output author-provided HTML; with `html: true` author HTML is
  // trusted, so the application is responsible for sanitizing the final output.
  const content = options.html ? token.content : escapeHtml(token.content);

  return `<div class="${token.type}" title="${escapeHtml(token.info)}">${content}</div>`;
};
