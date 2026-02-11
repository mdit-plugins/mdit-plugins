export interface InlineRuleOptions {
  /**
   * The punctuation character used as the marker
   *
   * 用作标记的标点符号字符
   *
   * @example
   * ```ts
   * // Single character for sub/sup
   * marker: "~"
   * // Single character that gets doubled for spoiler
   * marker: "!"
   * ```
   */
  marker: string;

  /**
   * HTML tag name for the rendered element
   *
   * 渲染元素的 HTML 标签名称
   *
   * @example
   * ```ts
   * tag: "sub"
   * tag: "span"
   * ```
   */
  tag: string;

  /**
   * Token type name used for markdown-it token identification
   *
   * 用于 markdown-it 令牌标识的令牌类型名称
   *
   * @example
   * ```ts
   * token: "sub"
   * token: "spoiler"
   * ```
   */
  token: string;

  /**
   * Whether markers must be doubled (e.g., `!!` vs `!`)
   *
   * 标记是否必须成对出现（例如 `!!` 而不是 `!`）
   *
   * @default false
   */
  double?: boolean;

  /**
   * Custom HTML attributes for the rendered element
   *
   * 渲染元素的自定义 HTML 属性
   *
   * @default undefined
   * @example
   * ```ts
   * attrs: [["class", "spoiler"], ["tabindex", "-1"]]
   * ```
   */
  attrs?: [string, string][];

  /**
   * Nesting logic
   *
   * 嵌套逻辑
   *
   * - `false`: Linear scan (high performance). No inline tags allowed inside (e.g., sub/sup).
   * - `true`: Delimiter state machine. Supports nested bold, italic, etc. (e.g., mark/spoiler).
   *
   * - `false`: 线性扫描（高性能）。内部不允许内联标签（例如 sub/sup）。
   * - `true`: 分隔符状态机。支持嵌套粗体、斜体等（例如 mark/spoiler）。
   *
   * @default false
   */
  nested?: boolean;

  /**
   * Ruler position relative to the core 'emphasis' rule
   *
   * 相对于核心 'emphasis' 规则的规则位置
   *
   * @default "after"
   */
  at?: "before" | "after";

  /**
   * Whether to allow unescaped spaces inside the content
   *
   * 是否允许内容中的未转义空格
   *
   * @default false
   */
  allowSpace?: boolean;
}
