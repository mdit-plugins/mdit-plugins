export interface MarkdownItIconOptions<MarkdownItEnv = unknown> {
  /**
   * Custom render function for the icon
   *
   * 图标的自定义渲染函数
   *
   * Receives the raw icon content and the markdown-it env, and must return the HTML string. The
   * default renderer HTML-escapes the content before using it as the class name.
   *
   * 接收原始图标内容与 markdown-it 环境变量，并返回 HTML 字符串。默认渲染器会先对内容做 HTML 转义，再作为 class 名称。
   *
   * @default (content) => `<i class="${escapeHtml(content)}"></i>`
   */
  render?: (content: string, env: MarkdownItEnv) => string;
}
