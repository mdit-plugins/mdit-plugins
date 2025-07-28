export interface EmbedConfig {
  /**
   * Embed token name
   *
   * 嵌入令牌名称
   */
  name: string;

  /**
   * Setup function to generate embed HTML
   *
   * 生成嵌入 HTML 的设置函数
   */
  setup: (ref: string, isInline: boolean) => string;

  /**
   * Whether the embed can be used inline
   *
   * 是否允许在行内使用
   *
   * @default false
   */
  allowInline?: boolean;
}

export interface MarkdownItEmbedOptions {
  /**
   * Embed configurations
   *
   * 嵌入配置
   */
  config?: EmbedConfig[];
}
