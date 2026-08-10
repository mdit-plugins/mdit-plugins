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
  render: RendererRule;
}

export const defaultRender = (tokens: Token[], index: number): string => {
  const token = tokens[index];

  // escapeHtml so `info` (user-controlled) cannot escape the title attribute
  return `<div class="${token.type}" title="${escapeHtml(token.info)}">${token.content}</div>`;
};
