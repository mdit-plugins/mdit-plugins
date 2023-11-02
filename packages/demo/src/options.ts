import { type RenderRule } from "markdown-it/lib/renderer.js";

export interface MarkdownItDemoOptions {
  /**
   * Whether code is displayed before result
   *
   * 代码是否显示在内容前
   *
   * @default false
   */
  beforeContent?: boolean;

  /**
   * Opening tag render function
   *
   * 开始标签渲染函数
   */
  openRender?: RenderRule;

  /**
   * Closing tag render function
   *
   * 结束标签渲染函数
   */
  closeRender?: RenderRule;

  /**
   * Code render function
   *
   * 代码渲染函数
   */
  codeRender?: RenderRule;
}
