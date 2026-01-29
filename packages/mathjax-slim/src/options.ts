import type { MarkdownItTexOptions } from "@mdit/plugin-tex";
import type { LiteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import type { CHTML } from "@mathjax/src/js/output/chtml.js";
import type { SVG } from "@mathjax/src/js/output/svg.js";
import type { TeX } from "@mathjax/src/js/input/tex.js";
import type { LiteElement } from "@mathjax/src/js/adaptors/lite/Element.js";

import type {
  MathJaxTexInputOptions,
  MathjaxCommonHTMLOutputOptions,
  MathjaxSVGOutputOptions,
} from "./mathjax.js";

export type TeXTransformer = (content: string, displayMode: boolean) => string;

export interface MarkdownItMathjaxOptions extends Pick<
  MarkdownItTexOptions,
  "allowInlineWithSpace" | "delimiters" | "mathFence"
> {
  /**
   * Output syntax
   *
   * 输出格式
   *
   * @default 'svg'
   */

  output?: "chtml" | "svg";

  /**
   * Enable A11y
   *
   * 是否启用无障碍
   *
   * @default true
   */
  a11y?: boolean;

  /**
   * TeX input options
   *
   * TeX 输入选项
   */
  tex?: MathJaxTexInputOptions;

  /**
   * Common HTML output options
   *
   * 通用 HTML 输出选项
   */
  chtml?: MathjaxCommonHTMLOutputOptions;

  /**
   * SVG output options
   *
   * SVG 输出选项
   */
  svg?: MathjaxSVGOutputOptions;

  /**
   * transformer on output content
   *
   * 输出内容的转换器
   */
  transformer?: TeXTransformer;
}

export interface DocumentOptions {
  InputJax: TeX<LiteElement, string, HTMLElement>;
  OutputJax: CHTML<LiteElement, string, HTMLElement> | SVG<LiteElement, string, HTMLElement>;
  enableAssistiveMml: boolean;
}

/**
 * Mathjax instance common options
 */
export interface MathjaxInstance<Sync extends boolean = false> extends Required<
  Pick<MarkdownItMathjaxOptions, "allowInlineWithSpace" | "delimiters" | "mathFence">
> {
  /**
   * Mathjax adaptor
   */
  adaptor: LiteAdaptor;

  /**
   * Mathjax document options
   */
  documentOptions: DocumentOptions;

  /**
   * Output style for rendered content and clears it
   *
   * @returns style
   */
  outputStyle: () => Sync extends true ? string : Promise<string>;

  /**
   * Reset tex (including labels)
   */
  reset: () => void;

  /**
   * Clear style cache
   */
  clearStyle: () => void;

  /**
   * Output content transformer
   */
  transformer: TeXTransformer | null;
}
