/**
 * Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts
 */
import { createRequire } from "node:module";
import { MathJaxNewcmFont as chtmlFont } from "@mathjax/mathjax-newcm-font/cjs/chtml.js";
import { MathJaxNewcmFont as svgFont } from "@mathjax/mathjax-newcm-font/cjs/svg.js";
import { AssistiveMmlHandler } from "@mathjax/src/cjs/a11y/assistive-mml.js";
import type { LiteDocument } from "@mathjax/src/cjs/adaptors/lite/Document.js";
import type { LiteElement, LiteNode } from "@mathjax/src/cjs/adaptors/lite/Element.js";
import type { LiteText } from "@mathjax/src/cjs/adaptors/lite/Text.js";
import type { LiteAdaptor } from "@mathjax/src/cjs/adaptors/liteAdaptor.js";
import { liteAdaptor } from "@mathjax/src/cjs/adaptors/liteAdaptor.js";
import type { MathDocument } from "@mathjax/src/cjs/core/MathDocument.js";
import { RegisterHTMLHandler } from "@mathjax/src/cjs/handlers/html.js";
import { TeX } from "@mathjax/src/cjs/input/tex.js";
import { mathjax as mathjaxLib } from "@mathjax/src/cjs/mathjax.js";
import { CHTML } from "@mathjax/src/cjs/output/chtml.js";
import { SVG } from "@mathjax/src/cjs/output/svg.js";
import { tex } from "@mdit/plugin-tex";
import type MarkdownIt from "markdown-it";

import type { MarkdownItMathjaxOptions, TeXTransformer } from "./options.js";
import { texPackages } from "./tex/index.js";

// oxlint-disable-next-line import/no-unassigned-import
import "./tex/importer.js";

const require = createRequire(import.meta.url);

mathjaxLib.asyncLoad = (file) => {
  require(file);
};
mathjaxLib.asyncIsSynchronous = true;

export interface DocumentOptions {
  InputJax: TeX<LiteElement, string, HTMLElement>;
  OutputJax: CHTML<LiteElement, string, HTMLElement> | SVG<LiteElement, string, HTMLElement>;
  enableAssistiveMml: boolean;
}

export const getDocumentOptions = (options: MarkdownItMathjaxOptions): DocumentOptions => {
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
      : { dynamicPrefix: `@mathjax/mathjax-newcm-font/cjs/${isCHTML ? "chtml" : "svg"}/dynamic` },
    isCHTML && !userOptions.fontData
      ? { fontURL: "https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font/chtml/woff2" }
      : {},
    userOptions,
  );

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
    // if there is no adaptor, output jax is not initialized yet, so nothing to clear
    if (!OutputJax.adaptor) return;

    OutputJax.reset();
  };

  const reset = (): void => {
    InputJax.reset();
  };

  const outputStyle = (): string => {
    OutputJax.font.loadDynamicFilesSync();

    const style = adaptor.cssText(
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
