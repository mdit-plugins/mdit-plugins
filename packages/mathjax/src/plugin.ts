/**
 * Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts
 */

import { createRequire } from "node:module";

import { tex } from "@mdit/plugin-tex";
import { type PluginWithOptions } from "markdown-it";
import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml.js";
import { type LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import {
  type LiteAdaptor,
  liteAdaptor,
} from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { mathjax as MathJax } from "mathjax-full/js/mathjax.js";
import { CHTML } from "mathjax-full/js/output/chtml.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import path from "upath";

import { type MarkdownItMathjaxOptions } from "./options.js";

export interface DocumentOptions {
  InputJax: TeX<LiteElement, string, HTMLElement>;
  OutputJax:
    | CHTML<LiteElement, string, HTMLElement>
    | SVG<LiteElement, string, HTMLElement>;
  enableAssistiveMml: boolean;
}

export const getDocumentOptions = (
  options: MarkdownItMathjaxOptions
): DocumentOptions => ({
  InputJax: new TeX<LiteElement, string, HTMLElement>({
    packages: AllPackages,
    ...options.tex,
  }),
  OutputJax:
    options.output === "chtml"
      ? new CHTML<LiteElement, string, HTMLElement>({
          fontURL: path.dirname(
            createRequire(import.meta.url).resolve(
              "mathjax-full/es5/output/chtml/fonts/woff-v2/MathJax_Zero.woff"
            )
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
export interface MathjaxInstance {
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
   * Reset tex (including labels)
   */
  reset: () => void;
}

export const createMathjaxInstance = (
  options: MarkdownItMathjaxOptions = {}
): MathjaxInstance | null => {
  const documentOptions = getDocumentOptions(options);
  const adaptor = liteAdaptor();

  const handler = RegisterHTMLHandler(adaptor);

  if (options.a11y !== false) AssistiveMmlHandler(handler);

  const { OutputJax, InputJax } = documentOptions;

  const clearStyle = (): void => {
    // clear style cache
    if (OutputJax instanceof CHTML) OutputJax.clearCache();
  };

  const reset = (): void => {
    InputJax.reset();
  };

  return {
    adaptor,
    documentOptions,
    clearStyle,
    reset,
  };
};

export const generateMathjaxStyle = ({
  adaptor,
  documentOptions,
  clearStyle,
}: MathjaxInstance): string => {
  const style = adaptor.innerHTML(
    documentOptions.OutputJax.styleSheet(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      MathJax.document("", documentOptions)
    )
  );

  clearStyle();

  return style;
};

export const mathjax: PluginWithOptions<MathjaxInstance> = (md, options) => {
  const { adaptor, documentOptions } = options!;

  md.use(tex, {
    render: (content, displayMode) => {
      /* eslint-disable */
      const mathDocument = MathJax.document(content, documentOptions).convert(
        content,
        { display: displayMode }
      );
      return adaptor.outerHTML(mathDocument);
    },
  });
};
