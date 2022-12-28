/**
 * Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts
 */

import { createRequire } from "node:module";
import path from "upath";
import { tex } from "@mdit/plugin-tex";
import { mathjax as MathJax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { CHTML } from "mathjax-full/js/output/chtml.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

import type { PluginWithOptions } from "markdown-it";
import type { LiteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import type { LiteElement } from "mathjax-full/js/adaptors/lite/Element.js";
import type { MarkdownItMathjaxOptions } from "./options.js";

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

export interface MathjaxInstance {
  adaptor: LiteAdaptor;
  documentOptions: DocumentOptions;
}

export const initMathjax = (
  options: MarkdownItMathjaxOptions = {}
): MathjaxInstance | null => {
  const documentOptions = getDocumentOptions(options);
  const adaptor = liteAdaptor();

  const handler = RegisterHTMLHandler(adaptor);

  if (options.a11y !== false) AssistiveMmlHandler(handler);

  return {
    adaptor,
    documentOptions,
  };
};

export const generateMathjaxStyle = ({
  adaptor,
  documentOptions,
}: MathjaxInstance): string =>
  adaptor.innerHTML(
    documentOptions.OutputJax.styleSheet(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      MathJax.document("", documentOptions)
    )
  );

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
