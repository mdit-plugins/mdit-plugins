/**
 * Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts
 */

import { createRequire } from "node:module";

import { tex } from "@mdit/plugin-tex";
import type { PluginWithOptions } from "markdown-it";
import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml.js";
import type { LiteDocument } from "mathjax-full/js/adaptors/lite/Document.js";
import type {
  LiteElement,
  LiteNode,
} from "mathjax-full/js/adaptors/lite/Element.js";
import type { LiteText } from "mathjax-full/js/adaptors/lite/Text.js";
import type { LiteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import type { MathDocument } from "mathjax-full/js/core/MathDocument.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { mathjax as mathjaxLib } from "mathjax-full/js/mathjax.js";
import { CHTML } from "mathjax-full/js/output/chtml.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import path from "upath";

import type { MarkdownItMathjaxOptions, TeXTransformer } from "./options.js";

const require = createRequire(import.meta.url);

export interface DocumentOptions {
  InputJax: TeX<LiteElement, string, HTMLElement>;
  OutputJax:
    | CHTML<LiteElement, string, HTMLElement>
    | SVG<LiteElement, string, HTMLElement>;
  enableAssistiveMml: boolean;
}

export const getDocumentOptions = (
  options: MarkdownItMathjaxOptions,
): DocumentOptions => ({
  InputJax: new TeX<LiteElement, string, HTMLElement>({
    packages: AllPackages,
    ...options.tex,
  }),
  OutputJax:
    options.output === "chtml"
      ? new CHTML<LiteElement, string, HTMLElement>({
          fontURL: path.dirname(
            require.resolve(
              "mathjax-full/es5/output/chtml/fonts/woff-v2/MathJax_Zero.woff",
            ),
          ),
          adaptiveCSS: true,
          ...options.chtml,
        })
      : new SVG<LiteElement, string, HTMLElement>({
          fontCache: "none",
          ...options.svg,
        }),
  enableAssistiveMml: options.a11y !== false,
});

/**
 * Mathjax instance
 */
export interface MathjaxInstance
  extends Required<
    Pick<MarkdownItMathjaxOptions, "allowInlineWithSpace" | "mathFence">
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
  options: MarkdownItMathjaxOptions = {},
): MathjaxInstance | null => {
  const documentOptions = getDocumentOptions(options);

  if (!documentOptions) return null;

  const { OutputJax, InputJax } = documentOptions;

  const adaptor = liteAdaptor();
  const handler = RegisterHTMLHandler(adaptor);

  if (options.a11y !== false)
    AssistiveMmlHandler<LiteNode, LiteText, LiteDocument>(handler);

  const clearStyle = (): void => {
    // clear style cache
    if (OutputJax instanceof CHTML) OutputJax.clearCache();
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
    mathFence: options.mathFence ?? false,
    clearStyle,
    reset,
    outputStyle,
    transformer: options.transformer ?? null,
  };
};

export const mathjax: PluginWithOptions<MathjaxInstance> = (md, instance) => {
  const {
    allowInlineWithSpace,
    adaptor,
    documentOptions,
    mathFence,
    transformer,
  } = instance!;

  md.use(tex, {
    allowInlineWithSpace,
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
