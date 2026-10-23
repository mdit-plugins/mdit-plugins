import type { LiteElement } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { LiteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import type { TeX } from "@mathjax/src/js/input/tex.js";
import type { CHTML } from "@mathjax/src/js/output/chtml.js";
import type { SVG } from "@mathjax/src/js/output/svg.js";
import type { MarkdownItTexOptions } from "@mdit/plugin-tex";

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
   * @default "svg"
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
   * Transformer on output content
   *
   * 输出内容的转换器
   */
  transformer?: TeXTransformer;

  /**
   * Enable debug mode
   *
   * 启用调试模式
   *
   * @default false
   */
  debug?: boolean;
}

/**
 * Mathjax document options
 *
 * Mathjax 文档选项
 */
export interface DocumentOptions {
  /** Input jax / 输入 jax */
  InputJax: TeX<LiteElement, string, HTMLElement>;

  /** Output jax / 输出 jax */
  OutputJax: CHTML<LiteElement, string, HTMLElement> | SVG<LiteElement, string, HTMLElement>;

  /** Whether to enable assistive MML / 是否启用辅助 MML */
  enableAssistiveMml: boolean;
}

/** Mathjax instance common options / Mathjax 实例通用选项 */
export interface MathjaxInstance<Sync extends boolean = false> extends Required<
  Pick<MarkdownItMathjaxOptions, "allowInlineWithSpace" | "delimiters" | "mathFence">
> {
  /** Mathjax adaptor / Mathjax 适配器 */
  adaptor: LiteAdaptor;

  /** Mathjax document options / Mathjax 文档选项 */
  documentOptions: DocumentOptions;

  /**
   * Output style for rendered content; clears the style cache afterwards
   *
   * 已渲染内容的输出样式，返回后会清空样式缓存
   *
   * @returns Style content / 样式内容
   */
  outputStyle: () => Sync extends true ? string : Promise<string>;

  /** Render one formula synchronously / 同步渲染单个公式 */
  render: (content: string, displayMode: boolean) => string;

  /** Reset tex (including labels) / 重置 TeX（包含标签） */
  reset: () => void;

  /** Clear the style cache and reset both input and output jax / 清除样式缓存并重置输入与输出 jax */
  clearStyle: () => void;

  /** Output content transformer / 输出内容转换器 */
  transformer: TeXTransformer | null;
}
