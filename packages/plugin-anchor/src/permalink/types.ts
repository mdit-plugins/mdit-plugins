import type StateCore from "markdown-it/lib/rules_core/state_core.mjs";

/**
 * Permalink render href function
 *
 * 永久链接渲染 href 函数
 */
export type RenderHref = (slug: string, state: StateCore) => string;

/**
 * Permalink render attrs function
 *
 * 永久链接渲染属性函数
 */
export type RenderAttrs = (slug: string, state: StateCore) => Record<string, string | number>;

/**
 * Permalink generator function
 *
 * 永久链接生成器函数
 */
export type PermalinkGenerator = (
  slug: string,
  options: PermalinkOptions,
  state: StateCore,
  index: number,
) => void;

/**
 * Base permalink options
 *
 * 基础永久链接选项
 */
export interface PermalinkOptions {
  /**
   * CSS class for the permalink anchor
   *
   * 永久链接锚点的 CSS 类
   *
   * @default "header-anchor"
   */
  class?: string;

  /**
   * Symbol or HTML to display in the permalink
   *
   * 永久链接中显示的符号或 HTML
   *
   * @default "#"
   */
  symbol?: string;

  /**
   * Render href attribute
   *
   * 渲染 href 属性
   *
   * @default (slug) => `#${slug}`
   */
  renderHref?: RenderHref;

  /**
   * Render custom attributes
   *
   * 渲染自定义属性
   *
   * @default () => ({})
   */
  renderAttrs?: RenderAttrs;
}

/**
 * Options for {@link headerLink} permalink
 *
 * {@link headerLink} 永久链接选项
 */
export interface HeaderLinkPermalinkOptions extends PermalinkOptions {
  /**
   * Add a `<span>` inside the link for Safari Reader View compatibility
   *
   * 在链接内添加 `<span>` 以兼容 Safari 阅读器视图
   *
   * @default false
   */
  safariReaderFix?: boolean;
}

/**
 * Options for {@link linkInsideHeader} permalink
 *
 * {@link linkInsideHeader} 永久链接选项
 */
export interface LinkInsideHeaderPermalinkOptions extends PermalinkOptions {
  /**
   * Whether to add a space before/after the permalink
   *
   * 是否在永久链接前后添加空格
   *
   * @default true
   */
  space?: boolean | string;

  /**
   * Placement of the permalink relative to heading text
   *
   * 永久链接相对于标题文本的位置
   *
   * @default "after"
   */
  placement?: "before" | "after";

  /**
   * Whether to add `aria-hidden="true"` to the permalink
   *
   * 是否为永久链接添加 `aria-hidden="true"`
   *
   * @default false
   */
  ariaHidden?: boolean;
}

/**
 * Options for {@link linkAfterHeader} permalink
 *
 * {@link linkAfterHeader} 永久链接选项
 */
export interface LinkAfterHeaderPermalinkOptions extends PermalinkOptions {
  /**
   * Accessibility style for the permalink
   *
   * 永久链接的无障碍样式
   *
   * @default "visually-hidden"
   */
  style?: "visually-hidden" | "aria-label" | "aria-describedby" | "aria-labelledby";

  /**
   * Function to generate assistive text from heading title
   *
   * 从标题文本生成辅助文本的函数
   */
  assistiveText?: (title: string) => string;

  /**
   * CSS class for visually hidden text
   *
   * 视觉隐藏文本的 CSS 类
   */
  visuallyHiddenClass?: string;

  /**
   * Whether to add a space before/after the permalink
   *
   * 是否在永久链接前后添加空格
   *
   * @default true
   */
  space?: boolean | string;

  /**
   * Placement of the permalink relative to the symbol
   *
   * 永久链接相对于符号的位置
   *
   * @default "after"
   */
  placement?: "before" | "after";

  /**
   * Optional wrapper HTML for the permalink + heading
   *
   * 可选的永久链接 + 标题的包装 HTML
   *
   * @default null
   */
  wrapper?: [string, string] | null;
}
