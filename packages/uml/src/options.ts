import type { RenderRule } from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";

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
   *  Closing marker
   *
   * 结束标记
   */
  close: string;

  /**
   * Render function
   *
   * 渲染函数
   */
  render: RenderRule;
}

export const defaultRender = (tokens: Token[], index: number): string => {
  const token = tokens[index];

  return `<div class="${token.type}" title="${token.info}">${token.content}</div>`;
};
