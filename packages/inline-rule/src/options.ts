/**
 * Base options shared by all inline rule configurations
 *
 * 所有内联规则配置共享的基础选项
 */
interface InlineRuleBaseOptions {
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
   * Ruler placement relative to the core 'emphasis' rule
   *
   * 相对于核心 'emphasis' 规则的规则放置位置
   *
   * @default "after-emphasis"
   */
  placement?: "before-emphasis" | "after-emphasis";
}

/**
 * Options for non-nested inline rules (linear scan)
 *
 * 非嵌套内联规则选项（线性扫描）
 *
 * @description Uses a high-performance linear scanner.
 * No inline tags (bold, italic, etc.) are parsed inside the markers.
 * Best for simple tags like sub/sup.
 *
 * 使用高性能线性扫描器。
 * 标记内部不会解析内联标签（粗体、斜体等）。
 * 最适合 sub/sup 等简单标签。
 */
export interface NonNestedInlineRuleOptions extends InlineRuleBaseOptions {
  /**
   * @default false
   */
  nested?: false;

  /**
   * Whether markers must be doubled (e.g., `%%` vs `%`)
   *
   * 标记是否必须成对出现（例如 `%%` 而不是 `%`）
   *
   * @default false
   */
  double?: boolean;

  /**
   * Whether to allow unescaped spaces inside the content
   *
   * 是否允许内容中的未转义空格
   *
   * @default false
   */
  allowSpace?: boolean;
}

/**
 * Options for nested inline rules (delimiter state machine)
 *
 * 嵌套内联规则选项（分隔符状态机）
 *
 * @description Integrates with markdown-it's delimiter state machine.
 * Supports nested bold, italic, and other inline rules inside the markers.
 * Best for complex tags like mark/spoiler/ins.
 * Always uses double markers.
 *
 * 与 markdown-it 的分隔符状态机集成。
 * 支持标记内嵌套粗体、斜体和其他内联规则。
 * 最适合 mark/spoiler/ins 等复杂标签。
 * 始终使用双标记。
 */
export interface NestedInlineRuleOptions extends InlineRuleBaseOptions {
  nested: true;

  /**
   * Whether markers must be doubled
   *
   * 标记是否必须成对出现
   *
   * @description Must be `true` for nested rules. The delimiter state machine
   * requires double markers to function correctly.
   *
   * 嵌套规则必须为 `true`。分隔符状态机需要双标记才能正确运行。
   *
   * @default true
   */
  double?: true;

  /** Not applicable for nested rules / 不适用于嵌套规则 */
  allowSpace?: never;
}

/**
 * Configuration options for the inline rule factory plugin
 *
 * 内联规则工厂插件的配置选项
 *
 * @example
 * ```ts
 * // Non-nested (linear scan) - for simple tags like sub/sup
 * md.use(inlineRule, {
 *   marker: "^",
 *   tag: "sup",
 *   token: "sup",
 * });
 *
 * // Nested (delimiter state machine) - for complex tags like mark/spoiler
 * md.use(inlineRule, {
 *   marker: "=",
 *   tag: "mark",
 *   token: "mark",
 *   nested: true,
 *   placement: "before-emphasis",
 * });
 * ```
 */
export type InlineRuleOptions = NonNestedInlineRuleOptions | NestedInlineRuleOptions;
