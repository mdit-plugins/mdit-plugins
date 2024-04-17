import type { RenderRule } from "markdown-it/lib/renderer.mjs";

export interface MarkdownItPlantumlOptions {
  /**
   * Plantuml parse type
   *
   * Plantuml 解析类型
   *
   * @default "uml"
   */
  type?: "uml" | "fence";

  /**
   * diagram type
   *
   * @description Only available when using default srcGetter
   *
   * 图表类型
   *
   * @description 仅在使用默认地址获取器时可用
   *
   * @default "uml"
   */
  name?: string;

  /**
   * Fence info
   *
   * 代码块名称
   *
   * @default name
   */
  fence?: string;

  /**
   * Opening marker
   *
   * @description only available with type "uml"
   *
   * 开始标记
   *
   * @description 仅当类型为 "uml" 时可用
   *
   * @default "start" + name
   */
  open?: string;

  /**
   * Closing marker
   *
   * @description only available with type "uml"
   *
   * 结束标记
   *
   * @default  "end" + name
   */
  close?: string;

  /**
   * Plantuml server
   *
   * @description Only available when using default srcGetter
   *
   * Plantuml 服务器
   *
   * @description 仅在使用默认地址获取器时可用
   *
   * @default "https://www.plantuml.com/plantuml"
   */
  server?: string;

  /**
   * Image format
   *
   * @description Only available when using default srcGetter
   *
   * 图片格式
   *
   * @description 仅在使用默认地址获取器时可用
   *
   * @default "svg"
   */
  format?: string;

  /**
   * Image src getter
   *
   * @param content diagram content
   * @returns image link
   *
   * 图片地址获取器
   *
   * @param content 图表内容
   * @returns 图片链接
   */
  srcGetter?: (content: string) => string;

  /**
   * Diagram renderer
   *
   * 图表渲染器
   */
  render?: RenderRule;
}
