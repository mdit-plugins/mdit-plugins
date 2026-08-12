export interface MarkdownItFigureOptions {
  /**
   * Copy or move image attributes to `<figure>`.
   *
   * - `true`: **copy** all attributes except native img ones (src, alt, srcset, etc.) to `<figure>`.
   *   Image keeps them.
   * - `(string | RegExp)[]`: **move** only matching attributes to `<figure>`. Image loses them.
   *
   * Native img attributes (src, alt, title, width, height, etc.) are never moved or copied to
   * `<figure>`.
   *
   * 将图片属性复制或移动到 `<figure>` 上。
   *
   * - `true`：**复制**除原生 img 属性外的所有属性到 `<figure>`，图片保留这些属性。
   * - `(string | RegExp)[]`：**移动**仅匹配的属性到 `<figure>`，图片失去这些属性。
   *
   * 原生 img 属性（src、alt、title、width、height 等）永远不会被移动或复制到 `<figure>` 上。
   *
   * @example
   *   // Copy all non-native attrs to figure (img keeps them)
   *   moveAttrs: true;
   *
   *   // Move class and data-* attrs to figure (img loses them)
   *   moveAttrs: ["class", /^data-/];
   *
   * @default false
   */
  moveAttrs?: boolean | (string | RegExp)[];

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
