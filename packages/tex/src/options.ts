export interface MarkdownItTexOptions<MarkdownItEnv = unknown> {
  /**
   * Whether parsed fence block with math language to display mode math
   *
   * 是否将解析的数学语言 fence 块转换为显示模式数学
   *
   * @default false
   */
  mathFence?: boolean;

  /**
   * Tex Render function
   *
   * @param content Text content
   * @param displayMode whether is display mode
   * @param env MarkdownIt environment
   * @returns render result
   *
   * Tex 渲染函数
   *
   * @param content 文本内容
   * @param displayMode 是否是显示模式
   * @param env MarkdownIt 环境变量
   * @returns 渲染结果
   */
  render: (content: string, displayMode: boolean, env: MarkdownItEnv) => string;

  /**
   * Whether to allow inline math with spaces on ends
   *
   * @description NOT recommended to set this to true, because it will likely break the default usage of $
   *
   * 是否允许两端带空格的内联数学
   *
   * @description 不建议将此设置为 true，因为它很可能会破坏 $ 的默认使用
   *
   * @default false
   */
  allowInlineWithSpace?: boolean;
}
