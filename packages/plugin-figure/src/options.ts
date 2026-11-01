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
   * When `<figure>` already has a `class` or `style` attribute, the image value is merged into it:
   * `class` tokens are deduplicated and `style` declarations are joined with `;` (empty
   * declarations are dropped). Attribute names are compared case-insensitively. Any other duplicate
   * key is ignored, so the figure's existing value wins.
   *
   * 将图片属性复制或移动到 `<figure>` 上。
   *
   * - `true`：**复制**除原生 img 属性外的所有属性到 `<figure>`，图片保留这些属性。
   * - `(string | RegExp)[]`：**移动**仅匹配的属性到 `<figure>`，图片失去这些属性。
   *
   * 原生 img 属性（src、alt、title、width、height 等）永远不会被移动或复制到 `<figure>` 上。
   *
   * 已有 `class` 或 `style` 时合并：`class` 去重，`style` 用 `;` 连接（空声明会被丢弃），合并重复的键时属性名不区分大小写；其余重复键保留原值。
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
   * Whether the figure is focusable. When enabled, `tabindex="0"` is added to the image only when
   * it does not already have a `tabindex` attribute; an existing value is preserved.
   *
   * 图片是否可聚焦。当启用时，仅当图片尚未带有 `tabindex` 属性时才添加 `tabindex="0"`，已有的值会保留。
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
