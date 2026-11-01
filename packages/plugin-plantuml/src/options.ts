import type { RendererRule } from "markdown-it";

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
   * Diagram type. Only available when using default srcGetter
   *
   * 图表类型。仅在使用默认地址获取器时可用
   *
   * @default "uml"
   */
  name?: string;

  /**
   * Fence info, defaults to the value of `name`
   *
   * 代码块名称，默认为 `name` 的值
   *
   * @default name
   */
  fence?: string;

  /**
   * Opening marker. Only available with type "uml"
   *
   * 开始标记。仅当类型为 "uml" 时可用
   *
   * @default "start" + name
   */
  open?: string;

  /**
   * Closing marker. Only available with type "uml"
   *
   * 结束标记。仅当类型为 "uml" 时可用
   *
   * @default "end" + name
   */
  close?: string;

  /**
   * Plantuml server. Only available when using default srcGetter
   *
   * Plantuml 服务器。仅在使用默认地址获取器时可用
   *
   * @default "https://www.plantuml.com/plantuml"
   */
  server?: string;

  /**
   * Image format. Only available when using default srcGetter
   *
   * 图片格式。仅在使用默认地址获取器时可用
   *
   * @default "svg"
   */
  format?: string;

  /**
   * Image src getter
   *
   * 图片地址获取器
   *
   * @param content - Diagram content / 图表内容
   * @returns Image link / 图片链接
   */
  srcGetter?: (content: string) => string;

  /**
   * Diagram renderer
   *
   * 图表渲染器
   */
  renderer?: RendererRule;
}
