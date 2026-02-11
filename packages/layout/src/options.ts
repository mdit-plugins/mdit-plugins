export interface MarkdownItLayoutOptions {
  /**
   * Whether to generate inline styles for layout utilities
   *
   * 是否为布局工具类生成内联样式
   *
   * @description When true, Tailwind-compatible utility classes are mapped to
   * inline CSS styles. When false, utilities are added as CSS class names.
   *
   * 为 true 时，Tailwind 兼容的工具类会被映射为内联 CSS 样式。
   * 为 false 时，工具类会被添加为 CSS 类名。
   *
   * @default true
   */
  inlineStyles?: boolean;
}
