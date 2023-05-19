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
}
