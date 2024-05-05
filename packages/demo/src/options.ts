import type { RenderRule } from "markdown-it/lib/renderer.mjs";

export interface MarkdownItDemoOptions {
  /**
   * Container name
   *
   * 容器名称
   *
   * @default "demo"
   */
  name?: string;

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

  /**
   * Content open tag render function
   *
   * 内容开始标签渲染函数
   */
  contentOpenRender?: RenderRule;

  /**
   * Content close tag render function
   *
   * 内容结束标签渲染函数
   */
  contentCloseRender?: RenderRule;
}
