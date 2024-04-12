import type { RenderRule } from "markdown-it/lib/renderer.mjs";

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
