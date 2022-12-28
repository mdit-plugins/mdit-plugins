export interface MarkdownItTexOptions {
  /**
   * Tex Render function
   *
   * @param content Text content
   * @param displayMode whether is display mode
   * @returns render result
   *
   * Tex 渲染函数
   *
   * @param content 文本内容
   * @param displayMode 是否是显示模式
   * @returns 渲染结果
   */
  render: (content: string, displayMode: boolean) => string;
}
