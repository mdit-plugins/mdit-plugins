import type { InlineRuleAttrs } from "@mdit/plugin-inline-rule";

export interface MarkdownItSpoilerOptions {
  /** @default "span" */
  tag?: string;

  /**
   * Custom HTML attributes for the spoiler element
   *
   * 剧透元素的自定义 HTML 属性
   *
   * A static array is cloned for every token, so tokens never share attribute arrays. A factory
   * function is called once for every token and must return a new array; it is the recommended way
   * to provide dynamic attributes and avoids the per-token clone.
   *
   * 静态数组会为每个令牌克隆一份，因此令牌之间不会共享属性数组。工厂函数会为每个令牌调用一次，且必须返回新数组；这是提供动态属性的推荐方式，并免去逐令牌克隆。
   *
   * @default () => [["class", "spoiler"], ["tabindex", "-1"]]
   */
  attrs?: InlineRuleAttrs;
}
