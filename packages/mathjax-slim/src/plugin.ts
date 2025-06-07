/* eslint-disable @typescript-eslint/consistent-type-imports */
import { createRequire } from "node:module";

import { tex } from "@mdit/plugin-tex";
import type MarkdownIt from "markdown-it";
import type { LiteDocument } from "mathjax-full/js/adaptors/lite/Document.js";
import type {
  LiteElement,
  LiteNode,
} from "mathjax-full/js/adaptors/lite/Element.js";
import type { LiteText } from "mathjax-full/js/adaptors/lite/Text.js";
import type { LiteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import type { MathDocument } from "mathjax-full/js/core/MathDocument.js";
import type { TeX as TeXType } from "mathjax-full/js/input/tex.js";
import type { CHTML as CHTMLType } from "mathjax-full/js/output/chtml.js";
import type { SVG as SVGType } from "mathjax-full/js/output/svg.js";
import path from "upath";

import type { MarkdownItMathjaxOptions, TeXTransformer } from "./options.js";

const require = createRequire(import.meta.url);

let isMathJaxFullInstalled = true;
let mathjaxLib: typeof import("mathjax-full/js/mathjax.js").mathjax;
let AllPackages: typeof import("mathjax-full/js/input/tex/AllPackages.js").AllPackages;
let TeX: typeof import("mathjax-full/js/input/tex.js").TeX;
let CHTML: typeof import("mathjax-full/js/output/chtml.js").CHTML;
let SVG: typeof import("mathjax-full/js/output/svg.js").SVG;
let liteAdaptor: typeof import("mathjax-full/js/adaptors/liteAdaptor.js").liteAdaptor;
let RegisterHTMLHandler: typeof import("mathjax-full/js/handlers/html.js").RegisterHTMLHandler;
let AssistiveMmlHandler: typeof import("mathjax-full/js/a11y/assistive-mml.js").AssistiveMmlHandler;

try {
  ({ mathjax: mathjaxLib } = await import("mathjax-full/js/mathjax.js"));
  ({ AllPackages } = await import("mathjax-full/js/input/tex/AllPackages.js"));
  ({ TeX } = await import("mathjax-full/js/input/tex.js"));
  ({ CHTML } = await import("mathjax-full/js/output/chtml.js"));
  ({ SVG } = await import("mathjax-full/js/output/svg.js"));
  ({ liteAdaptor } = await import("mathjax-full/js/adaptors/liteAdaptor.js"));
  ({ RegisterHTMLHandler } = await import("mathjax-full/js/handlers/html.js"));
  ({ AssistiveMmlHandler } = await import(
    "mathjax-full/js/a11y/assistive-mml.js"
  ));
} catch {
  /* istanbul ignore next -- @preserve */
  isMathJaxFullInstalled = false;
}

export interface DocumentOptions {
  InputJax: TeXType<LiteElement, string, HTMLElement>;
  OutputJax:
    | CHTMLType<LiteElement, string, HTMLElement>
    | SVGType<LiteElement, string, HTMLElement>;
  enableAssistiveMml: boolean;
}

export const getDocumentOptions = (
  options: MarkdownItMathjaxOptions,
): DocumentOptions => {
  /* istanbul ignore if -- @preserve */
  if (!isMathJaxFullInstalled)
    throw new Error('[@mdit/mathjax] "mathjax-full" is not installed!');

  return {
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
  };
};

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
  options: MarkdownItMathjaxOptions = {},
): MathjaxInstance | null => {
  const documentOptions = getDocumentOptions(options);

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
