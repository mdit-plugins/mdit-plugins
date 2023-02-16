import { type KatexOptions } from "katex";

export interface MarkdownItKatexOptions extends KatexOptions {
  /**
   * Whether enable mhchem extension
   *
   * 是否启用 mhchem 扩展
   *
   * @default false
   */
  mhchem?: boolean;
}
