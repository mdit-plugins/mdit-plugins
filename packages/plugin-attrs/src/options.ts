import type { DelimiterConfig } from "./helper/index.js";

export type MarkdownItAttrRuleName =
  | "fence"
  | "inline"
  | "table"
  | "list"
  | "heading"
  | "hr"
  | "softbreak"
  | "blockInfo"
  | "blockEnd"
  /** Legacy alias of `blockEnd` */
  | "block"
  /** Opt-in task list label support - excluded from `"all"` */
  | "tasklist"
  /** Opt-in definition list support - excluded from `"all"` */
  | "dl";

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
