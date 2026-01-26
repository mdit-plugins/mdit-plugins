/**
 * Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts
 */

import type { AssistiveMmlHandler as AssistiveMmlHandlerType } from "@mathjax/src/js/a11y/assistive-mml.js";
import type { LiteDocument } from "@mathjax/src/js/adaptors/lite/Document.js";
import type { LiteElement, LiteNode } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { LiteText } from "@mathjax/src/js/adaptors/lite/Text.js";
import type {
  LiteAdaptor,
  liteAdaptor as liteAdaptorType,
} from "@mathjax/src/js/adaptors/liteAdaptor.js";
import type { MathDocument } from "@mathjax/src/js/core/MathDocument.js";
import type { RegisterHTMLHandler as RegisterHTMLHandlerType } from "@mathjax/src/js/handlers/html.js";
import type { TeX as TeXType } from "@mathjax/src/js/input/tex.js";
import type { mathjax as mathjaxType } from "@mathjax/src/js/mathjax.js";
import type { CHTML as CHTMLType } from "@mathjax/src/js/output/chtml.js";
import type { SVG as SVGType } from "@mathjax/src/js/output/svg.js";
import { tex } from "@mdit/plugin-tex";
import type MarkdownIt from "markdown-it";

import type { MarkdownItMathjaxOptions, TeXTransformer } from "./options.js";
import { texPackages } from "./tex/index.js";

let isMathJaxFullInstalled = true;
let mathjaxLib: typeof mathjaxType;
let TeX: typeof TeXType;
let CHTML: typeof CHTMLType;
let SVG: typeof SVGType;
let liteAdaptor: typeof liteAdaptorType;
// move type import to front
let RegisterHTMLHandler: typeof RegisterHTMLHandlerType;
let AssistiveMmlHandler: typeof AssistiveMmlHandlerType;

try {
  ({ mathjax: mathjaxLib } = await import("@mathjax/src/js/mathjax.js"));
  ({ TeX } = await import("@mathjax/src/js/input/tex.js"));
  ({ CHTML } = await import("@mathjax/src/js/output/chtml.js"));
  ({ SVG } = await import("@mathjax/src/js/output/svg.js"));
  ({ liteAdaptor } = await import("@mathjax/src/js/adaptors/liteAdaptor.js"));
  ({ RegisterHTMLHandler } = await import("@mathjax/src/js/handlers/html.js"));
  ({ AssistiveMmlHandler } = await import("@mathjax/src/js/a11y/assistive-mml.js"));
  await import("./tex/importer.js");
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

export const getDocumentOptions = (options: MarkdownItMathjaxOptions): DocumentOptions => {
  /* istanbul ignore if -- @preserve */
  if (!isMathJaxFullInstalled)
    throw new Error('[@mdit/plugin-mathjax-slim] "@mathjax/src" is not installed!');

  return {
    InputJax: new TeX<LiteElement, string, HTMLElement>({
      packages: ["base", ...texPackages],
      ...options.tex,
    }),
    OutputJax:
      options.output === "chtml"
        ? new CHTML<LiteElement, string, HTMLElement>({
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
export interface MathjaxInstance extends Required<
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
  // oxlint-disable-next-line new-cap
  const handler = RegisterHTMLHandler(adaptor);

  // oxlint-disable-next-line new-cap
  if (options.a11y !== false) AssistiveMmlHandler<LiteNode, LiteText, LiteDocument>(handler);

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
        mathjaxLib.document("", documentOptions) as MathDocument<LiteElement, string, HTMLElement>,
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
      const mathDocument = mathjaxLib.document(content, documentOptions).convert(content, {
        display: displayMode,
      }) as LiteElement;

      const result = adaptor.outerHTML(mathDocument);

      return transformer?.(result, displayMode) ?? result;
    },
  });
};
