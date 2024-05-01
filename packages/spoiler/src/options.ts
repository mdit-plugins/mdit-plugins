export interface MarkdownItSpoilerOptions {
  /**
   * @default "span"
   */
  tag?: string;

  /**
   * @default [["class", "spoiler"], ["tabindex","-1"]]
   */
  attrs?: [string, string][];
}
