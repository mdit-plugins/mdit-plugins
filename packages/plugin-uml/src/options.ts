import { escapeHtml } from "@mdit/helper";
import type { RendererRule, Token } from "markdown-it";

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

export const defaultRenderer = (tokens: Token[], index: number): string => {
  const token = tokens[index];

  // escapeHtml so that `info` and `content` (both controlled by the markdown
  // author) cannot inject HTML or escape the title attribute
  return `<div class="${token.type}" title="${escapeHtml(token.info)}">${escapeHtml(token.content)}</div>`;
};
