import type { RendererRule } from "markdown-it";

export interface MarkdownItContainerOptions {
  /**
   * Container name
   *
   * 自定义容器的名称
   */
  name: string;

  /**
   * Container marker
   *
   * 自定义容器的标识符
   *
   * @default ":"
   */
  marker?: string;

  /**
   * Validate whether it should be regarded as this container type
   *
   * 校验内容是否应该作为此类型容器
   *
   * @default params.trim().split(" ", 2)[0] === name
   * @param params - The content after the marker / 标识符后面的内容
   * @param markup - Marker character / 标识字符
   * @returns Is this container type or not / 是否是此容器类型
   */
  validate?: (params: string, markup: string) => boolean;

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
}
