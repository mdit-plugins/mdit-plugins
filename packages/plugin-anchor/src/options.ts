import type StateCore from "markdown-it/lib/rules_core/state_core.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { PermalinkGenerator } from "./permalink/types.js";

/**
 * Information about a heading anchor
 *
 * 标题锚点信息
 */
export interface AnchorInfo {
  /**
   * Generated slug
   *
   * 生成的 slug
   */
  slug: string;

  /**
   * Original heading title
   *
   * 原始标题文本
   */
  title: string;
}

/**
 * Options for the anchor plugin
 *
 * 锚点插件选项
 */
export interface AnchorOptions {
  /**
   * Heading levels to add anchors to (array or minimum level)
   *
   * 要添加锚点的标题级别（数组或最低级别）
   *
   * @default 1
   */
  level?: number | number[];

  /**
   * Function to generate slugs from heading text
   *
   * 从标题文本生成 slug 的函数
   */
  slugify?: (str: string) => string;

  /**
   * Function to generate slugs with access to state
   *
   * 可访问 state 的生成 slug 函数
   */
  slugifyWithState?: (str: string, state: StateCore) => string;

  /**
   * Function to extract text from tokens
   *
   * 从 token 中提取文本的函数
   */
  getTokensText?: (tokens: Token[]) => string;

  /**
   * Starting index for unique slug numbering
   *
   * 唯一 slug 编号的起始索引
   *
   * @default 1
   */
  uniqueSlugStartIndex?: number;

  /**
   * Permalink generator function
   *
   * 永久链接生成器函数
   */
  permalink?: PermalinkGenerator;

  /**
   * Callback invoked for each heading with anchor info
   *
   * 每个标题添加锚点后调用的回调
   */
  callback?: (token: Token, anchorInfo: AnchorInfo) => void;

  /**
   * Value of the `tabindex` attribute on headings, set to `false` to disable
   *
   * 标题上 `tabindex` 属性的值，设为 `false` 禁用
   *
   * @default "-1"
   */
  tabIndex?: string | number | false;
}
