/** Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts */
// oxlint-disable-next-line import/no-nodejs-modules
import { createRequire } from "node:module";

import type { MathJaxNewcmFont as MathJaxNewcmHTMLFont } from "@mathjax/mathjax-newcm-font/js/chtml.js";
import type { MathJaxNewcmFont as MathJaxNewcmSVGFont } from "@mathjax/mathjax-newcm-font/js/svg.js";
import type { AssistiveMmlHandler as AssistiveMmlHandlerType } from "@mathjax/src/js/a11y/assistive-mml.js";
import type { LiteDocument } from "@mathjax/src/js/adaptors/lite/Document.js";
import type { LiteElement, LiteNode } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { LiteText } from "@mathjax/src/js/adaptors/lite/Text.js";
import type { liteAdaptor as liteAdaptorType } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import type { MathDocument } from "@mathjax/src/js/core/MathDocument.js";
import type { RegisterHTMLHandler as RegisterHTMLHandlerType } from "@mathjax/src/js/handlers/html.js";
import type { TeX as TeXType } from "@mathjax/src/js/input/tex.js";
import type { mathjax as mathjaxType } from "@mathjax/src/js/mathjax.js";
import type { CHTML as CHTMLType } from "@mathjax/src/js/output/chtml.js";
import type { SVG as SVGType } from "@mathjax/src/js/output/svg.js";
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

const require = createRequire(import.meta.url);

try {
  ({ mathjax: mathjaxLib } = await import("@mathjax/src/js/mathjax.js"));
  await import("./patch.js");
  [{ TeX }, { CHTML }, { SVG }, { liteAdaptor }, { RegisterHTMLHandler }, { AssistiveMmlHandler }] =
    await Promise.all([
      import("@mathjax/src/js/input/tex.js"),
      import("@mathjax/src/js/output/chtml.js"),
      import("@mathjax/src/js/output/svg.js"),
      import("@mathjax/src/js/adaptors/liteAdaptor.js"),
      import("@mathjax/src/js/handlers/html.js"),
      import("@mathjax/src/js/a11y/assistive-mml.js"),
      import("@mathjax/src/js/input/tex/action/ActionConfiguration.js"),
      import("@mathjax/src/js/input/tex/ams/AmsConfiguration.js"),
      import("@mathjax/src/js/input/tex/amscd/AmsCdConfiguration.js"),
      import("@mathjax/src/js/input/tex/base/BaseConfiguration.js"),
      import("@mathjax/src/js/input/tex/bbm/BbmConfiguration.js"),
      import("@mathjax/src/js/input/tex/bboldx/BboldxConfiguration.js"),
      import("@mathjax/src/js/input/tex/bbox/BboxConfiguration.js"),
      import("@mathjax/src/js/input/tex/begingroup/BegingroupConfiguration.js"),
      import("@mathjax/src/js/input/tex/boldsymbol/BoldsymbolConfiguration.js"),
      import("@mathjax/src/js/input/tex/braket/BraketConfiguration.js"),
      import("@mathjax/src/js/input/tex/bussproofs/BussproofsConfiguration.js"),
      import("@mathjax/src/js/input/tex/cancel/CancelConfiguration.js"),
      import("@mathjax/src/js/input/tex/cases/CasesConfiguration.js"),
      import("@mathjax/src/js/input/tex/centernot/CenternotConfiguration.js"),
      import("@mathjax/src/js/input/tex/color/ColorConfiguration.js"),
      import("@mathjax/src/js/input/tex/colortbl/ColortblConfiguration.js"),
      import("@mathjax/src/js/input/tex/colorv2/ColorV2Configuration.js"),
      import("@mathjax/src/js/input/tex/configmacros/ConfigMacrosConfiguration.js"),
      import("@mathjax/src/js/input/tex/dsfont/DsfontConfiguration.js"),
      import("@mathjax/src/js/input/tex/empheq/EmpheqConfiguration.js"),
      import("@mathjax/src/js/input/tex/enclose/EncloseConfiguration.js"),
      import("@mathjax/src/js/input/tex/extpfeil/ExtpfeilConfiguration.js"),
      import("@mathjax/src/js/input/tex/gensymb/GensymbConfiguration.js"),
      import("@mathjax/src/js/input/tex/html/HtmlConfiguration.js"),
      import("@mathjax/src/js/input/tex/mathtools/MathtoolsConfiguration.js"),
      import("@mathjax/src/js/input/tex/mhchem/MhchemConfiguration.js"),
      import("@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js"),
      import("@mathjax/src/js/input/tex/noerrors/NoErrorsConfiguration.js"),
      import("@mathjax/src/js/input/tex/noundefined/NoUndefinedConfiguration.js"),
      import("@mathjax/src/js/input/tex/physics/PhysicsConfiguration.js"),
      import("@mathjax/src/js/input/tex/setoptions/SetOptionsConfiguration.js"),
      import("@mathjax/src/js/input/tex/tagformat/TagFormatConfiguration.js"),
      import("@mathjax/src/js/input/tex/texhtml/TexHtmlConfiguration.js"),
      import("@mathjax/src/js/input/tex/textcomp/TextcompConfiguration.js"),
      import("@mathjax/src/js/input/tex/textmacros/TextMacrosConfiguration.js"),
      import("@mathjax/src/js/input/tex/unicode/UnicodeConfiguration.js"),
      import("@mathjax/src/js/input/tex/units/UnitsConfiguration.js"),
      import("@mathjax/src/js/input/tex/upgreek/UpgreekConfiguration.js"),
      import("@mathjax/src/js/input/tex/verb/VerbConfiguration.js"),
    ]);

  mathjaxLib.asyncIsSynchronous = true;
} catch {
  /* istanbul ignore next -- @preserve */
  isMathJaxInstalled = false;
}

try {
  chtmlFont = (await import("@mathjax/mathjax-newcm-font/js/chtml.js")).MathJaxNewcmFont;
  svgFont = (await import("@mathjax/mathjax-newcm-font/js/svg.js")).MathJaxNewcmFont;
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
      : { dynamicPrefix: `@mathjax/mathjax-newcm-font/js/${isCHTML ? "chtml" : "svg"}/dynamic` },
    isCHTML && !userOptions.fontData
      ? { fontURL: "https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font/chtml/woff2" }
      : {},
    userOptions,
  );

  mathjaxLib.asyncLoad = (file): void => {
    if (options.debug)
      // oxlint-disable-next-line no-console
      console.debug(`[MathJax]: sync loading ${file}...`);
    // oxlint-disable-next-line import/no-dynamic-require
    require(file);
  };

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
