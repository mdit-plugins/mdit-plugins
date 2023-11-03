/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts
 */

import { createRequire } from "node:module";

import { tex } from "@mdit/plugin-tex";
import { type PluginWithOptions } from "markdown-it";
import { type LiteDocument } from "mathjax-full/js/adaptors/lite/Document.js";
import {
  type LiteElement,
  type LiteNode,
} from "mathjax-full/js/adaptors/lite/Element.js";
import { type LiteText } from "mathjax-full/js/adaptors/lite/Text.js";
import { type LiteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { type MathDocument } from "mathjax-full/js/core/MathDocument.js";
import { type TeX } from "mathjax-full/js/input/tex.js";
import { type CHTML } from "mathjax-full/js/output/chtml.js";
import { type SVG } from "mathjax-full/js/output/svg.js";
import path from "upath";

import { type MarkdownItMathjaxOptions } from "./options.js";

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
): DocumentOptions | null => {
  try {
    const { AllPackages } = <
      typeof import("mathjax-full/js/input/tex/AllPackages.js")
    >require("mathjax-full/js/input/tex/AllPackages.js");

    const { TeX } = <typeof import("mathjax-full/js/input/tex.js")>(
      require("mathjax-full/js/input/tex.js")
    );
    const { CHTML } = <typeof import("mathjax-full/js/output/chtml.js")>(
      require("mathjax-full/js/output/chtml.js")
    );
    const { SVG } = <typeof import("mathjax-full/js/output/svg.js")>(
      require("mathjax-full/js/output/svg.js")
    );

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
  } catch (err) {
    console.error('[@mdit/mathjax] "mathjax-full" is not installed!');

    return null;
  }
};

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
}

export const createMathjaxInstance = (
  options: MarkdownItMathjaxOptions = {},
): MathjaxInstance | null => {
  const documentOptions = getDocumentOptions(options);

  if (!documentOptions) return null;

  const { OutputJax, InputJax } = documentOptions;

  const { CHTML } = <typeof import("mathjax-full/js/output/chtml.js")>(
    require("mathjax-full/js/output/chtml.js")
  );
  const adaptor = (<typeof import("mathjax-full/js/adaptors/liteAdaptor.js")>(
    require("mathjax-full/js/adaptors/liteAdaptor.js")
  )).liteAdaptor();
  const registerHTMLHandler = (<
    typeof import("mathjax-full/js/handlers/html.js")
  >require("mathjax-full/js/handlers/html.js")).RegisterHTMLHandler;
  const assistiveMmlHandler = (<
    typeof import("mathjax-full/js/a11y/assistive-mml.js")
  >require("mathjax-full/js/a11y/assistive-mml.js")).AssistiveMmlHandler;
  const { mathjax } = <typeof import("mathjax-full/js/mathjax.js")>(
    require("mathjax-full/js/mathjax.js")
  );

  const handler = registerHTMLHandler(adaptor);

  if (options.a11y !== false)
    assistiveMmlHandler<LiteNode, LiteText, LiteDocument>(handler);

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
        <MathDocument<LiteElement, string, HTMLElement>>(
          mathjax.document("", documentOptions)
        ),
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
  };
};

export const mathjax: PluginWithOptions<MathjaxInstance> = (md, options) => {
  const { mathjax } = <typeof import("mathjax-full/js/mathjax.js")>(
    require("mathjax-full/js/mathjax.js")
  );
  const { allowInlineWithSpace, adaptor, documentOptions, mathFence } =
    options!;

  md.use(tex, {
    allowInlineWithSpace,
    mathFence,
    render: (content, displayMode) => {
      const mathDocument = <LiteElement>(
        mathjax.document(content, documentOptions).convert(content, {
          display: displayMode,
        })
      );

      return adaptor.outerHTML(mathDocument);
    },
  });
};
