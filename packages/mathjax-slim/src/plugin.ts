// oxlint-disable typescript/no-require-imports
// oxlint-disable typescript/no-unsafe-assignment
// oxlint-disable typescript/no-var-requires
// oxlint-disable unicorn/prefer-module
/** Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts */

import type { MathJaxNewcmFont as MathJaxNewcmHTMLFont } from "@mathjax/mathjax-newcm-font/cjs/chtml.js";
import type { MathJaxNewcmFont as MathJaxNewcmSVGFont } from "@mathjax/mathjax-newcm-font/cjs/svg.js";
import type { AssistiveMmlHandler as AssistiveMmlHandlerType } from "@mathjax/src/cjs/a11y/assistive-mml.js";
import type { LiteDocument } from "@mathjax/src/cjs/adaptors/lite/Document.js";
import type { LiteElement, LiteNode } from "@mathjax/src/cjs/adaptors/lite/Element.js";
import type { LiteText } from "@mathjax/src/cjs/adaptors/lite/Text.js";
import type { liteAdaptor as liteAdaptorType } from "@mathjax/src/cjs/adaptors/liteAdaptor.js";
import type { MathDocument } from "@mathjax/src/cjs/core/MathDocument.js";
import type { RegisterHTMLHandler as RegisterHTMLHandlerType } from "@mathjax/src/cjs/handlers/html.js";
import type { TeX as TeXType } from "@mathjax/src/cjs/input/tex.js";
import type { mathjax as mathjaxType } from "@mathjax/src/cjs/mathjax.js";
import type { CHTML as CHTMLType } from "@mathjax/src/cjs/output/chtml.js";
import type { SVG as SVGType } from "@mathjax/src/cjs/output/svg.js";
import { tex } from "@mdit/plugin-tex";
import type MarkdownIt from "markdown-it";

import type { MarkdownItMathjaxOptions, DocumentOptions, MathjaxInstance } from "./options.js";
import { texPackages } from "./tex/index.js";

let isMathJaxInstalled = true;
let mathjaxLib: typeof mathjaxType;
let TeX: typeof TeXType;
let CHTML: typeof CHTMLType;
let SVG: typeof SVGType;
let liteAdaptor: typeof liteAdaptorType;
let RegisterHTMLHandler: typeof RegisterHTMLHandlerType;
let AssistiveMmlHandler: typeof AssistiveMmlHandlerType;
let isMathJaxNewcmFontInstalled = true;
let chtmlFont: typeof MathJaxNewcmHTMLFont;
let svgFont: typeof MathJaxNewcmSVGFont;

try {
  ({ mathjax: mathjaxLib } = require("@mathjax/src/cjs/mathjax.js"));
  ({ TeX } = require("@mathjax/src/cjs/input/tex.js"));
  ({ CHTML } = require("@mathjax/src/cjs/output/chtml.js"));
  ({ SVG } = require("@mathjax/src/cjs/output/svg.js"));
  ({ liteAdaptor } = require("@mathjax/src/cjs/adaptors/liteAdaptor.js"));
  ({ RegisterHTMLHandler } = require("@mathjax/src/cjs/handlers/html.js"));
  ({ AssistiveMmlHandler } = require("@mathjax/src/cjs/a11y/assistive-mml.js"));
  // oxlint-disable-next-line import/no-unassigned-import
  require("./importer.js");

  mathjaxLib.asyncLoad = (file): void => {
    // oxlint-disable-next-line import/no-dynamic-require, typescript/no-require-imports, unicorn/prefer-module
    require(file);
  };
  mathjaxLib.asyncIsSynchronous = true;
} catch {
  /* istanbul ignore next -- @preserve */
  isMathJaxInstalled = false;
}

try {
  ({ MathJaxNewcmFont: chtmlFont } = require("@mathjax/mathjax-newcm-font/cjs/chtml.js"));
  ({ MathJaxNewcmFont: svgFont } = require("@mathjax/mathjax-newcm-font/cjs/svg.js"));
} catch {
  /* istanbul ignore next -- @preserve */
  isMathJaxNewcmFontInstalled = false;
}

export const getDocumentOptions = (options: MarkdownItMathjaxOptions): DocumentOptions => {
  /* istanbul ignore if -- @preserve */
  if (!isMathJaxInstalled)
    throw new Error('[@mdit/plugin-mathjax-slim] "@mathjax/src" is not installed!');

  const isCHTML = options.output === "chtml";
  const userOptions = (isCHTML ? options.chtml : options.svg) ?? {};

  /* istanbul ignore if -- @preserve */
  if (!userOptions.fontData && !isMathJaxNewcmFontInstalled)
    throw new Error('[@mdit/plugin-mathjax-slim] "@mathjax/mathjax-newcm-font" is not installed!');

  const outputOptions = Object.assign(
    {
      fontData: isCHTML ? chtmlFont : svgFont,
    },
    // fontURL can be set to undefined if you want to bundle the fonts yourself
    // both fontURL and dynamicPrefix shall be synced with fontData, so set it to undefined if fontData is customized
    userOptions?.fontData
      ? {}
      : {
          // oxlint-disable-next-line unicorn/prefer-module
          dynamicPrefix: `${require.resolve(`@mathjax/mathjax-newcm-font/package.json`).slice(0, /* length of /package.json */ -13)}/cjs/${isCHTML ? "chtml" : "svg"}/dynamic`,
        },
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

export const createMathjaxInstance = (
  options: MarkdownItMathjaxOptions = {},
): MathjaxInstance<true> | null => {
  const documentOptions = getDocumentOptions(options);
  const { OutputJax, InputJax } = documentOptions;

  const adaptor = liteAdaptor();
  // oxlint-disable-next-line new-cap
  const handler = RegisterHTMLHandler(adaptor);
  // oxlint-disable-next-line new-cap
  if (options.a11y !== false) AssistiveMmlHandler<LiteNode, LiteText, LiteDocument>(handler);

  const clearStyle = (): void => {
    // if there is no adaptor, output jax is not initialized yet, so nothing to clear
    if (OutputJax.adaptor == null) return;

    InputJax.reset();
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
