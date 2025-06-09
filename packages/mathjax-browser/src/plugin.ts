import { tex } from "@mdit/plugin-tex";
import type MarkdownIt from "markdown-it";
import type { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import type { LiteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import type { MathDocument } from "mathjax-full/js/core/MathDocument.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { mathjax as mathjaxLib } from "mathjax-full/js/mathjax.js";
import type { CHTML } from "mathjax-full/js/output/chtml.js";
import type { SVG } from "mathjax-full/js/output/svg.js";

import type { MarkdownItMathjaxOptions, TeXTransformer } from "./options.js";

export interface DocumentOptions {
  InputJax: TeX<LiteElement, string, HTMLElement>;
  OutputJax:
    | CHTML<LiteElement, string, HTMLElement>
    | SVG<LiteElement, string, HTMLElement>;
}

export const getDocumentOptions = (
  options: MarkdownItMathjaxOptions,
): DocumentOptions => ({
  InputJax: new TeX<LiteElement, string, HTMLElement>({
    packages: AllPackages,
    ...options.tex,
  }),
  OutputJax: options.output,
});

/**
 * Mathjax instance
 */
export interface MathjaxInstance
  extends Required<
    Pick<
      MarkdownItMathjaxOptions,
      "allowInlineWithSpace" | "delimiters" | "mathFence"
    >
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
   * Clear style cache
   */
  clearStyle: () => void;

  /**
   * Output style for rendered content and clears it
   *
   * @returns style
   */
  outputStyle: () => string;

  /**
   * Reset tex (including labels)
   */
  reset: () => void;

  /**
   * Output content transformer
   */
  transformer: TeXTransformer | null;
}

export const createMathjaxInstance = (
  options: MarkdownItMathjaxOptions,
): MathjaxInstance => {
  const documentOptions = getDocumentOptions(options);

  const { OutputJax, InputJax } = documentOptions;

  const adaptor = liteAdaptor();
  const handler = RegisterHTMLHandler(adaptor);

  options.a11y?.(handler);

  const clearStyle = (): void => {
    // clear style cache
    if ("clearCache" in OutputJax) OutputJax.clearCache();
  };

  const reset = (): void => {
    InputJax.reset();
  };

  const outputStyle = (): string => {
    const style = adaptor.innerHTML(
      OutputJax.styleSheet(
        mathjaxLib.document("", documentOptions) as MathDocument<
          LiteElement,
          string,
          HTMLElement
        >,
      ),
    );

    clearStyle();

    return style;
  };

  return {
    adaptor,
    documentOptions,
    allowInlineWithSpace: options.allowInlineWithSpace ?? false,
    delimiters: options.delimiters ?? "dollars",
    mathFence: options.mathFence ?? false,
    clearStyle,
    reset,
    outputStyle,
    transformer: options.transformer ?? null,
  };
};

export const mathjax = (
  md: MarkdownIt,
  {
    allowInlineWithSpace,
    adaptor,
    delimiters,
    documentOptions,
    mathFence,
    transformer,
  }: MathjaxInstance,
): void => {
  md.use(tex, {
    allowInlineWithSpace,
    delimiters,
    mathFence,
    render: (content, displayMode) => {
      const mathDocument = mathjaxLib
        .document(content, documentOptions)
        .convert(content, {
          display: displayMode,
        }) as LiteElement;

      const result = adaptor.outerHTML(mathDocument);

      return transformer?.(result, displayMode) ?? result;
    },
  });
};
