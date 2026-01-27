/**
 * Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts
 */

import { AssistiveMmlHandler } from "@mathjax/src/js/a11y/assistive-mml.js";
import type { LiteDocument } from "@mathjax/src/js/adaptors/lite/Document.js";
import type { LiteElement, LiteNode } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { LiteText } from "@mathjax/src/js/adaptors/lite/Text.js";
import type { LiteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import { liteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import type { MathDocument } from "@mathjax/src/js/core/MathDocument.js";
import { RegisterHTMLHandler } from "@mathjax/src/js/handlers/html.js";
import { TeX } from "@mathjax/src/js/input/tex.js";
import { mathjax as mathjaxLib } from "@mathjax/src/js/mathjax.js";
import { CHTML } from "@mathjax/src/js/output/chtml.js";
import { SVG } from "@mathjax/src/js/output/svg.js";
import { tex } from "@mdit/plugin-tex";
import type MarkdownIt from "markdown-it";
import { MathJaxNewcmFont as chtmlFont } from "@mathjax/mathjax-newcm-font/js/chtml.js";
import { MathJaxNewcmFont as svgFont } from "@mathjax/mathjax-newcm-font/js/svg.js";

import type { MarkdownItMathjaxOptions, TeXTransformer } from "./options.js";
import { loadTexPackages, texPackages } from "./tex/index.js";

mathjaxLib.asyncLoad = (file) => import(file);

export interface DocumentOptions {
  InputJax: TeX<LiteElement, string, HTMLElement>;
  OutputJax: CHTML<LiteElement, string, HTMLElement> | SVG<LiteElement, string, HTMLElement>;
  enableAssistiveMml: boolean;
}

export const getDocumentOptions = async (
  options: MarkdownItMathjaxOptions,
): Promise<DocumentOptions> => {
  const isCHTML = options.output === "chtml";
  const userOptions = (isCHTML ? options.chtml : options.svg) ?? {};
  const outputOptions = Object.assign(
    {
      fontData: isCHTML ? chtmlFont : svgFont,
    },
    // fontURL can be set to undefined if you want to bundle the fonts yourself
    // both fontURL and dynamicPrefix shall be synced with fontData, so set it to undefined if fontData is customized
    userOptions?.fontData
      ? {}
      : { dynamicPrefix: `@mathjax/mathjax-newcm-font/js/${isCHTML ? "chtml" : "svg"}/dynamic` },
    isCHTML && !userOptions.fontData
      ? {
          fontURL: `https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font/${isCHTML ? "chtml" : "svg"}/woff2`,
        }
      : {},
    userOptions,
  );

  await loadTexPackages(options.tex?.packages);

  return {
    InputJax: new TeX<LiteElement, string, HTMLElement>({
      packages: ["base", ...texPackages],
      ...options.tex,
    }),
    OutputJax: new (isCHTML ? CHTML : SVG)<LiteElement, string, HTMLElement>(outputOptions),
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
  outputStyle: () => Promise<string>;

  /**
   * Reset tex (including labels)
   */
  reset: () => void;

  /**
   * Output content transformer
   */
  transformer: TeXTransformer | null;
}

export const createMathjaxInstance = async (
  options: MarkdownItMathjaxOptions = {},
): Promise<MathjaxInstance | null> => {
  const documentOptions = await getDocumentOptions(options);

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

  const outputStyle = async (): Promise<string> => {
    await OutputJax.font.loadDynamicFiles();

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
