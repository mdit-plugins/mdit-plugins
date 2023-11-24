import { type RenderRule } from "markdown-it/lib/renderer.js";

export interface MarkdownItHintOptions {
  /**
   * Hint opening tag render function
   *
   * 提示开始标签渲染函数
   */
  openRender?: RenderRule;

  /**
   * Hint closing tag render function
   *
   * 提示结束标签渲染函数
   */
  closeRender?: RenderRule;

  /**
   * Hint title render function
   *
   * 提示标题渲染函数
   */
  titleRender?: RenderRule;
}
