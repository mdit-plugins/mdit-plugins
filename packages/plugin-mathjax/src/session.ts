/**
 * Synchronous MathJax runtime used by the synckit worker.
 *
 * This module is only imported from the worker entry (`worker.ts`). It is the single source of
 * truth for MathJax setup and uses **only** the official async APIs: `mathjax.asyncLoad = (file) =>
 * import(file)`, `loadTexPackages()`, `document.convertPromise()` and `font.loadDynamicFiles()`.
 *
 * Synckit worker 使用的 MathJax 运行时。只在 worker 入口导入，完整走官方异步 API。
 */

import { MathJaxNewcmFont as chtmlFont } from "@mathjax/mathjax-newcm-font/js/chtml.js";
import { MathJaxNewcmFont as svgFont } from "@mathjax/mathjax-newcm-font/js/svg.js";
import { AssistiveMmlHandler } from "@mathjax/src/js/a11y/assistive-mml.js";
import type { LiteElement } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { LiteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import { liteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import type { MathDocument } from "@mathjax/src/js/core/MathDocument.js";
import { RegisterHTMLHandler } from "@mathjax/src/js/handlers/html.js";
import { TeX } from "@mathjax/src/js/input/tex.js";
import { mathjax as mathjaxLib } from "@mathjax/src/js/mathjax.js";
import { CHTML } from "@mathjax/src/js/output/chtml.js";
import { SVG } from "@mathjax/src/js/output/svg.js";

import type { DocumentOptions } from "./options.js";
import type { MathjaxItem, SerializableMathjaxOptions } from "./protocol.js";
import { texLoaders } from "./tex/loader.js";
import { texPackages } from "./tex/packages.js";
import { clearUserState } from "./utils.js";

type InputJax = TeX<LiteElement, string, HTMLElement>;
type OutputJax = CHTML<LiteElement, string, HTMLElement> | SVG<LiteElement, string, HTMLElement>;

interface Session {
  adaptor: LiteAdaptor;
  documentOptions: DocumentOptions;
  InputJax: InputJax;
  OutputJax: OutputJax;
  clearStyle: () => void;
  preloadFonts: () => Promise<void>;
  render: (items: MathjaxItem[]) => Promise<string[]>;
  reset: () => void;
  style: () => Promise<string>;
}

const loadTexPackage = async (packages: string[]): Promise<void> => {
  await import("@mathjax/src/js/input/tex/base/BaseConfiguration.js");

  await Promise.all(
    packages
      .filter((pkg) => pkg in texLoaders)
      .map((pkg) => texLoaders[pkg as keyof typeof texLoaders]()),
  );
};

export const createSession = async (options: SerializableMathjaxOptions): Promise<Session> => {
  const isCHTML = options.output === "chtml";
  const userOptions = (isCHTML ? options.chtml : options.svg) ?? {};
  const outputOptions = Object.assign(
    {
      fontData: isCHTML ? chtmlFont : svgFont,
    },
    userOptions.fontData
      ? {}
      : { dynamicPrefix: `@mathjax/mathjax-newcm-font/js/${isCHTML ? "chtml" : "svg"}/dynamic` },
    isCHTML && !userOptions.fontData
      ? { fontURL: "https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font/chtml/woff2" }
      : {},
    userOptions,
  );

  // Official async loading contract. Everything the worker pulls in is a real
  // dynamic import; no `createRequire`, no `asyncIsSynchronous`.
  mathjaxLib.asyncLoad = (file): Promise<unknown> => import(file);

  const { packages: userPackages, ...texOptions } = options.tex ?? {};
  const packages = ["base", ...(userPackages ?? texPackages)];

  await loadTexPackage(packages);

  const InputJax = new TeX<LiteElement, string, HTMLElement>({
    ...texOptions,
    packages,
  });
  const OutputJax = new (isCHTML ? CHTML : SVG)<LiteElement, string, HTMLElement>(outputOptions);

  const adaptor = liteAdaptor();
  // oxlint-disable-next-line new-cap
  const handler = RegisterHTMLHandler(adaptor);
  // Always mix in the a11y document so that `enableAssistiveMml` can be decided
  // per document (MathJax picks the first registered global handler, so making
  // it conditional per session would leak the first session's choice).
  // oxlint-disable-next-line new-cap
  AssistiveMmlHandler(handler);

  const documentOptions: DocumentOptions = {
    InputJax,
    OutputJax,
    enableAssistiveMml: options.a11y !== false,
  };

  const clearStyle = (): void => {
    // if there is no adaptor, output jax is not initialized yet, so nothing to clear
    if (OutputJax.adaptor == null) return;

    InputJax.reset();
    OutputJax.reset();
  };

  const reset = (): void => {
    InputJax.reset();
    clearUserState(InputJax);
  };

  // Reuse one MathJax document for the whole session lifetime: MathJax's document API supports
  // repeated conversions, and reusing it avoids rebuilding handlers/factories for every document.
  let mathDocument: MathDocument<LiteElement, string, HTMLElement> | null = null;

  const getDocument = (): MathDocument<LiteElement, string, HTMLElement> =>
    (mathDocument ??= mathjaxLib.document("", documentOptions) as MathDocument<
      LiteElement,
      string,
      HTMLElement
    >);

  return {
    adaptor,
    documentOptions,
    InputJax,
    OutputJax,
    clearStyle,
    preloadFonts: async (): Promise<void> => {
      await OutputJax.font.loadDynamicFiles();
    },
    reset,
    async render(items: MathjaxItem[]): Promise<string[]> {
      const document = getDocument();
      const html: string[] = [];

      for (const item of items) {
        // oxlint-disable-next-line no-await-in-loop
        const node = await document.convertPromise(item.content, { display: item.display });

        html.push(adaptor.outerHTML(node as LiteElement));
      }

      return html;
    },
    async style(): Promise<string> {
      // Official async font loading (no sync hack).
      await OutputJax.font.loadDynamicFiles();

      const style = adaptor.cssText(
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
    },
  };
};

export type { Session };
