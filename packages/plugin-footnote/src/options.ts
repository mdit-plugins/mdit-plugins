/** Plugin options for `@mdit/plugin-footnote` / `@mdit/plugin-footnote` 的插件选项 */
export interface FootnoteOptions {
  /**
   * Extra attributes for the footnote reference marker.
   *
   * 脚注引用标记的额外属性。
   *
   * The marker is the `<sup class="footnote-ref">` element wrapping the reference link. A `class`
   * value is merged with the built-in `footnote-ref` class, while other attributes are set on the
   * element and therefore override the generated ones.
   *
   * 标记是包裹引用链接的 `<sup class="footnote-ref">` 元素。`class` 值会与内置的 `footnote-ref`
   * 类合并，其他属性会直接设置到元素上并覆盖生成的同名属性。
   *
   * @example
   *   ```ts
   *   refAttrs: { "data-kind": "reference" }
   *   ```;
   */
  refAttrs?: Record<string, string | number>;

  /**
   * Extra attributes for each footnote item.
   *
   * 每个脚注项的额外属性。
   *
   * The item is the `<li id="footnote…" class="footnote-item">` element. A `class` value is merged
   * with the built-in `footnote-item` class, while other attributes are set on the element and
   * therefore override the generated ones (including `id`, which would break the `href` anchors).
   *
   * 脚注项是 `<li id="footnote…" class="footnote-item">` 元素。`class` 值会与内置的 `footnote-item`
   * 类合并，其他属性会直接设置到元素上并覆盖生成的同名属性（包括 `id`，覆盖后会破坏 `href` 锚点）。
   *
   * @example
   *   ```ts
   *   itemAttrs: { class: "footnote-item-custom" }
   *   ```;
   */
  itemAttrs?: Record<string, string | number>;

  /**
   * Extra attributes for the back-reference links.
   *
   * 反向引用链接的额外属性。
   *
   * The links are the `<a href="#footnote-ref…" class="footnote-backref">` elements at the end of
   * each footnote item. A `class` value is merged with the built-in `footnote-backref` class, while
   * other attributes are set on the element and therefore override the generated ones.
   *
   * 链接是每个脚注项末尾的 `<a href="#footnote-ref…" class="footnote-backref">` 元素。`class` 值会与内置的
   * `footnote-backref` 类合并，其他属性会直接设置到元素上并覆盖生成的同名属性。
   *
   * @example
   *   ```ts
   *   backrefAttrs: { "aria-label": "back to reference" }
   *   ```;
   */
  backrefAttrs?: Record<string, string | number>;

  /**
   * Extra attributes for the footnote container.
   *
   * 脚注容器的额外属性。
   *
   * The container is the `<section class="footnotes">` element wrapping the ordered list and every
   * footnote item. The `<hr class="footnotes-sep">` separator is emitted immediately before it. A
   * `class` value is merged with the built-in `footnotes` class, while other attributes are set on
   * the element and therefore override the generated ones.
   *
   * 容器是包裹有序列表和所有脚注项的 `<section class="footnotes">` 元素，分隔线 `<hr class="footnotes-sep">`
   * 会紧挨在该元素之前输出。`class` 值会与内置的 `footnotes` 类合并，其他属性会直接设置到元素上并覆盖生成的同名属性。
   *
   * @example
   *   ```ts
   *   containerAttrs: { "aria-label": "notes" }
   *   ```;
   */
  containerAttrs?: Record<string, string | number>;
}
