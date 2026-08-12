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
  openRenderer?: RendererRule;

  /**
   * Closing tag render function
   *
   * 结束标签渲染函数
   */
  closeRenderer?: RendererRule;

  /**
   * Code render function
   *
   * 代码渲染函数
   */
  codeRenderer?: RendererRule;

  /**
   * Content open tag render function
   *
   * 内容开始标签渲染函数
   */
  contentOpenRenderer?: RendererRule;

  /**
   * Content close tag render function
   *
   * 内容结束标签渲染函数
   */
  contentCloseRenderer?: RendererRule;
}
