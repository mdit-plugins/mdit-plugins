/**
 * Props parsed from the advanced link syntax
 *
 * 从高级链接语法中解析出的属性
 *
 * A prop without a value is parsed as `true`, e.g. `@[video autoplay](link)` gives `{ autoplay:
 * true }`. `\` escapes the next character, so any key and value can be written within a single
 * line, including a `]` which otherwise ends the props.
 *
 * 不带值的属性会被解析为 `true`，例如 `@[video autoplay](link)` 会得到 `{ autoplay: true }`。 `\`
 * 用于转义下一个字符，因此可以在单行内书写任意的 key 与 value，包括原本会结束属性的 `]`。 key 与 value。
 */
export type AdvancedLinkProps = Record<string, string | true>;

/**
 * Renderer for the advanced link syntax
 *
 * 高级链接语法的渲染器
 *
 * @param link - Link destination, without normalization or validation / 链接地址，不加规范化与校验
 * @param props - Parsed props / 解析后的属性
 * @param env - MarkdownIt environment / MarkdownIt 环境
 * @returns Rendered HTML / 渲染的 HTML
 */
export type AdvancedLinkRenderer<MarkdownItEnv = unknown> = (
  link: string,
  props: AdvancedLinkProps,
  env: MarkdownItEnv,
) => string;

/**
 * Advanced links plugin options
 *
 * 高级链接插件选项
 */
export interface MarkdownItAdvancedLinksOptions<MarkdownItEnv = unknown> {
  /**
   * Name used by the syntax
   *
   * 语法中使用的名称
   *
   * Must not be empty, contain whitespace, `[`, `]`, `(`, `)`, `"` or `'`. Registering the same
   * name again replaces the previous config.
   *
   * 不能为空，也不能包含空白、`[`、`]`、`(`、`)`、`"` 或 `'`。重复注册同名会覆盖之前的配置。
   *
   * @example
   *   ```ts
   *   // matches `@[video title="Hello"](link)`
   *   name: "video";
   *   ```
   */
  name: string;

  /**
   * Whether the syntax is also available inline
   *
   * 语法是否也可在行内使用
   *
   * @default false
   */
  inline?: boolean;

  /**
   * Renderer to generate HTML
   *
   * 生成 HTML 的渲染器
   *
   * @example
   *   ```ts
   *   renderer: (link, props) =>
   *   `<iframe src="${link}"${props.full ? " allowfullscreen" : ""}></iframe>`;
   *   ```
   */
  renderer: AdvancedLinkRenderer<MarkdownItEnv>;
}
