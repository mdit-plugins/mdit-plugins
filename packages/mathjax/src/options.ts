import type {
  MathJaxTexInputOptions,
  MathjaxCommonHTMLOutputOptions,
  MathjaxSVGOutputOptions,
} from "./mathjax.js";

export interface MarkdownItMathjaxOptions {
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
}
