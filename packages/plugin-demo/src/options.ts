import type { RendererRule } from "markdown-it";

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
  showCodeFirst?: boolean;

  /**
   * Opening tag render function
   *
   * 开始标签渲染函数
   */
  openRender?: RendererRule;

  /**
   * Closing tag render function
   *
   * 结束标签渲染函数
   */
  closeRender?: RendererRule;

  /**
   * Code render function
   *
   * 代码渲染函数
   */
  codeRender?: RendererRule;

  /**
   * Content open tag render function
   *
   * 内容开始标签渲染函数
   */
  contentOpenRender?: RendererRule;

  /**
   * Content close tag render function
   *
   * 内容结束标签渲染函数
   */
  contentCloseRender?: RendererRule;
}
