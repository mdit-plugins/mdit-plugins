import type { DelimiterConfig } from "./helper/index.js";

export type MarkdownItAttrRuleName =
  | "fence"
  | "blockInfo"
  | "inline"
  | "table"
  | "list"
  | "heading"
  | "hr"
  | "softbreak"
  | "blockEnd"
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
  rule?: "all" | boolean | MarkdownItAttrRuleName[];
}
