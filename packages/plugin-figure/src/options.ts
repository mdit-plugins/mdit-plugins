export interface MarkdownItFigureOptions {
  /**
   * Whether the figure is focusable
   *
   * 图片是否可聚焦
   *
   * @default true
   */
  focusable?: boolean;

  /**
   * Whether to convert linked images (`[![image](url)](link)`) to figures
   *
   * 是否将链接图片 (`[![image](url)](link)`) 转换为 figure
   *
   * @default true
   */
  linkImage?: boolean;
}
