/**
 * Options of `@mdit/plugin-footnote`.
 *
 * `@mdit/plugin-footnote` 的选项。
 */
export interface FootnoteOptions {
  /**
   * Extra attributes of the `<sup>` element wrapping a footnote reference. `class` is merged with
   * `footnote-ref`, any other attribute overrides the generated value. The links live on the inner
   * `<a>` elements, which are rendered from the token metadata, so an `href` here changes neither
   * link.
   *
   * 脚注引用外层 `<sup>` 元素的额外属性。`class` 会与 `footnote-ref` 合并，其他属性会覆盖生成的值。两个链接都由 token 元数据渲染到内部的 `<a>`
   * 元素上，因此在这里写 `href` 不会改变任何一个链接。
   */
  refAttrs?: Record<string, string | number>;

  /**
   * Extra attributes of the `<li>` element of each footnote item. `class` is merged with
   * `footnote-item`, any other attribute overrides the generated value (including the generated
   * `id`). Overriding `id` breaks the forward link from the reference marker unless `meta.href` of
   * the `footnote_ref` tokens is updated as well.
   *
   * 每个脚注项 `<li>` 元素的额外属性。`class` 会与 `footnote-item` 合并，其他属性会覆盖生成的值（包括生成的 `id`）。覆盖 `id`
   * 会断开引用标记指向脚注项的前向链接，除非同时更新 `footnote_ref` token 上的 `meta.href`。
   */
  itemAttrs?: Record<string, string | number>;

  /**
   * Extra attributes of the back reference `<a>` element. `class` is merged with
   * `footnote-backref`, any other attribute overrides the generated value (including the generated
   * `href`). The forward link from the reference marker to the footnote item is unaffected.
   *
   * 返回引用 `<a>` 元素的额外属性。`class` 会与 `footnote-backref` 合并，其他属性会覆盖生成的值（包括生成的
   * `href`）。引用标记指向脚注项的前向链接不受影响。
   */
  backrefAttrs?: Record<string, string | number>;

  /**
   * Extra attributes of the `<section>` element wrapping the footnote list. `class` is merged with
   * `footnotes`, any other attribute overrides the generated value.
   *
   * 包裹脚注列表的 `<section>` 元素的额外属性。`class` 会与 `footnotes` 合并，其他属性会覆盖生成的值。
   */
  containerAttrs?: Record<string, string | number>;
}
