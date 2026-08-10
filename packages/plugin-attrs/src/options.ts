import type { DelimiterConfig } from "./helper/index.js";

export interface ParseAttrsOptions extends Partial<Omit<DelimiterConfig, "filter">> {
  /**
   * Where the attrs section shall be located in the content
   *
   * - `"start"`: at the start of the content
   * - `"end"`: at the end of the content
   * - `"only"`: the content shall only contain the attrs section
   *
   * 属性部分在内容中的位置
   *
   * - `"start"`: 位于内容开头
   * - `"end"`: 位于内容结尾
   * - `"only"`: 内容仅包含属性部分
   *
   * @default "end"
   */
  where?: "start" | "end" | "only";
}

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
  rule?: "all" | boolean | readonly MarkdownItAttrRuleName[];

  /**
   * Place fence attributes on `<pre>` instead of `<code>`
   *
   * 将代码块属性放在 `<pre>` 上而非 `<code>` 上
   *
   * @default true
   */
  fenceAttrsOnPre?: boolean;
}
