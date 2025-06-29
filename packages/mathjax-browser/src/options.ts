import type { MarkdownItTexOptions } from "@mdit/plugin-tex";

import type { MathJaxTexInputOptions } from "./mathjax.js";
import type { A11yHandler, CHTMLRender, SVGRender } from "./typings.js";

export type TeXTransformer = (content: string, displayMode: boolean) => string;

export interface MarkdownItMathjaxOptions
  extends Pick<
    MarkdownItTexOptions,
    "allowInlineWithSpace" | "delimiters" | "mathFence"
  > {
  /**
   * TeX input options
   *
   * TeX 输入选项
   */
  tex?: MathJaxTexInputOptions;

  /**
   * Output syntax
   *
   * 输出格式
   */

  output: CHTMLRender | SVGRender;

  /**
   * A11y handler
   *
   * 无障碍处理器
   */
  a11y?: A11yHandler;

  /**
   * transformer on output content
   *
   * 输出内容的转换器
   */
  transformer?: TeXTransformer;
}
