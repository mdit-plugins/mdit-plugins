export interface MarkdownItStylizeResult {
  /**
   * Tag name
   *
   * 渲染的标签名称
   */
  tag: string;

  /**
   * Attributes settings
   *
   * 属性设置
   */
  attrs: Record<string, string>;

  /**
   * Tag content
   *
   * 标签内容
   */
  content: string;
}

export interface MarkdownItStylizeConfig {
  /**
   * Inline token matcher
   *
   * 字符匹配
   */
  matcher: string | RegExp;

  /**
   * Content Replacer
   *
   * 内容替换
   */
  replacer: (options: {
    tag: string;
    content: string;
    attrs: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    env?: any;
  }) => MarkdownItStylizeResult | null | void;
}

export interface MarkdownItStylizeOptions {
  /**
   * Stylize config
   *
   * 格式化配置
   */
  config?: MarkdownItStylizeConfig[];

  /**
   * Local config getter
   *
   * @param env Markdown env object
   * @returns local stylize config
   *
   * 本地配置获取器
   *
   * @param env Markdown 环境对象
   * @returns 本地格式化配置
   */
  localConfigGetter?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    env?: any,
  ) => MarkdownItStylizeConfig[] | null;
}
