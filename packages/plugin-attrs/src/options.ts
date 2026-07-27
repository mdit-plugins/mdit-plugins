import type { DelimiterConfig } from "./helper/index.js";

/**
 * Rules enabled by default (`"all"`)
 *
 * 默认启用的规则（`"all"`）
 */
export type MarkdownItAttrsDefaultRuleName =
  | "fence"
  | "inline"
  | "table"
  | "list"
  | "heading"
  | "hr"
  | "softbreak"
  | "blockInfo"
  | "blockEnd";

/**
 * Opt-in rules for third-party plugin interop - excluded from `"all"`
 *
 * 需显式启用的第三方插件交互规则，不包含在 `"all"` 中
 */
export type MarkdownItAttrsExtensionRuleName = "tasklist" | "dl";

export type MarkdownItAttrRuleName =
  | MarkdownItAttrsDefaultRuleName
  | MarkdownItAttrsExtensionRuleName
  /** Legacy alias of `blockEnd` */
  | "block";

export interface MarkdownItAttrsOptions extends Partial<DelimiterConfig> {
  /**
   * Rules to enable
   *
   * 启用的规则
   *
   * @default "all"
   */
  rule?: "all" | boolean | readonly MarkdownItAttrRuleName[];
}
