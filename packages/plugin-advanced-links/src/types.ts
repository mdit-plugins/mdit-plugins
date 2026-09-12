import type { AdvancedLinkRenderer, AdvancedLinkProps } from "./options.js";

/**
 * Config of a registered advanced link
 *
 * 已注册的高级链接的配置
 *
 * The environment type is erased, so that configs with different environment types can be stored in
 * a single map. The environment is always provided by markdown-it at render time.
 *
 * 环境类型被抹除，以便不同环境类型的配置可以存储在同一个映射中。环境始终由 markdown-it 在渲染时提供。
 */
export interface AdvancedLinkConfig {
  /**
   * Whether the syntax is also available inline
   *
   * 语法是否也可在行内使用
   */
  inline: boolean;

  /**
   * Renderer
   *
   * 渲染器
   */
  // oxlint-disable-next-line typescript/no-explicit-any
  renderer: AdvancedLinkRenderer<any>;
}

/**
 * Registered configs
 *
 * 已注册的配置
 */
export type AdvancedLinkConfigs = Map<string, AdvancedLinkConfig>;

/**
 * Scanned advanced link
 *
 * 扫描出的高级链接
 */
export interface ScannedAtLink {
  /**
   * Matched config
   *
   * 命中的配置
   */
  config: AdvancedLinkConfig;

  /**
   * Matched name
   *
   * 命中的名称
   */
  name: string;

  /**
   * Parsed props
   *
   * 解析后的属性
   */
  props: AdvancedLinkProps;

  /**
   * Link destination
   *
   * 链接地址
   */
  link: string;

  /**
   * Position right after the closing `)`
   *
   * 右括号之后的位置
   */
  end: number;
}
