/**
 * Synckit-based synchronous MathJax runtime for `@mdit/plugin-mathjax-slim`.
 *
 * This module is only imported from the worker entry (`worker.ts`) and from tests. It is the single
 * source of truth for MathJax setup and uses **only** the official async APIs: `mathjax.asyncLoad =
 * (file) => import(file)`, `loadTexPackages()`, `document.convertPromise()` and
 * `font.loadDynamicFiles()`.
 *
 * `@mathjax/src` and `@mathjax/mathjax-newcm-font` are optional peer dependencies of this package,
 * so every MathJax module is imported dynamically and cached. A missing dependency raises a
 * descriptive error, which synckit forwards from the worker to the main thread.
 *
 * 同步 MathJax 运行时，只在 worker 入口导入，完整走官方异步 API。由于 `@mathjax/src` 与 `@mathjax/mathjax-newcm-font`
 * 是本包的可选 peer 依赖，所有 MathJax 模块均动态导入并缓存；缺失依赖时抛出 清晰错误，并由 synckit 从 worker 传回主线程。
 */

import type { MathJaxNewcmFont as ChtmlFontType } from "@mathjax/mathjax-newcm-font/js/chtml.js";
import type { MathJaxNewcmFont as SvgFontType } from "@mathjax/mathjax-newcm-font/js/svg.js";
import type { AssistiveMmlHandler as AssistiveMmlHandlerType } from "@mathjax/src/js/a11y/assistive-mml.js";
import type { LiteElement } from "@mathjax/src/js/adaptors/lite/Element.js";
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

import type { DocumentOptions } from "./options.js";
import type { MathjaxItem, SerializableMathjaxOptions } from "./protocol.js";
import { texLoaders } from "./tex/loader.js";
import { texPackages } from "./tex/packages.js";
import { clearUserState } from "./utils.js";

type InputJax = TeXType<LiteElement, string, HTMLElement>;
type OutputJax =
  | CHTMLType<LiteElement, string, HTMLElement>
  | SVGType<LiteElement, string, HTMLElement>;

interface Session {
  adaptor: LiteAdaptor;
  documentOptions: DocumentOptions;
  InputJax: InputJax;
  OutputJax: OutputJax;
  clearStyle: () => void;
  render: (items: MathjaxItem[]) => Promise<string[]>;
  reset: () => void;
  style: () => Promise<string>;
}

interface MathjaxModules {
  AssistiveMmlHandler: typeof AssistiveMmlHandlerType;
  CHTML: typeof CHTMLType;
  RegisterHTMLHandler: typeof RegisterHTMLHandlerType;
  SVG: typeof SVGType;
  TeX: typeof TeXType;
  liteAdaptor: typeof liteAdaptorType;
  mathjax: typeof mathjaxType;
}

interface MathjaxFontModules {
  chtml: typeof ChtmlFontType;
  svg: typeof SvgFontType;
}

const MATHJAX_SRC_MISSING = '[@mdit/plugin-mathjax-slim] "@mathjax/src" is not installed!';
const MATHJAX_FONT_MISSING =
  '[@mdit/plugin-mathjax-slim] "@mathjax/mathjax-newcm-font" is not installed!';

let coreModulesPromise: Promise<MathjaxModules> | null = null;
let fontModulesPromise: Promise<MathjaxFontModules> | null = null;

const loadCoreModules = async (): Promise<MathjaxModules> => {
  coreModulesPromise ??= (async (): Promise<MathjaxModules> => {
    try {
      const [
        mathjaxModule,
        TeXModule,
        CHTMLModule,
        SVGModule,
        adaptorModule,
        handlerModule,
        a11yModule,
      ] = await Promise.all([
        import("@mathjax/src/js/mathjax.js"),
        import("@mathjax/src/js/input/tex.js"),
        import("@mathjax/src/js/output/chtml.js"),
        import("@mathjax/src/js/output/svg.js"),
        import("@mathjax/src/js/adaptors/liteAdaptor.js"),
        import("@mathjax/src/js/handlers/html.js"),
        import("@mathjax/src/js/a11y/assistive-mml.js"),
      ]);

      return {
        AssistiveMmlHandler: a11yModule.AssistiveMmlHandler,
        CHTML: CHTMLModule.CHTML,
        RegisterHTMLHandler: handlerModule.RegisterHTMLHandler,
        SVG: SVGModule.SVG,
        TeX: TeXModule.TeX,
        liteAdaptor: adaptorModule.liteAdaptor,
        mathjax: mathjaxModule.mathjax,
      };
    } catch {
      /* istanbul ignore next -- @preserve */
      throw new Error(MATHJAX_SRC_MISSING);
    }
  })();

  return coreModulesPromise;
};

const loadFontModules = async (): Promise<MathjaxFontModules> => {
  fontModulesPromise ??= (async (): Promise<MathjaxFontModules> => {
    try {
      const [chtmlModule, svgModule] = await Promise.all([
        import("@mathjax/mathjax-newcm-font/js/chtml.js"),
        import("@mathjax/mathjax-newcm-font/js/svg.js"),
      ]);

      return {
        chtml: chtmlModule.MathJaxNewcmFont,
        svg: svgModule.MathJaxNewcmFont,
      };
    } catch {
      /* istanbul ignore next -- @preserve */
      throw new Error(MATHJAX_FONT_MISSING);
    }
  })();

  return fontModulesPromise;
};

const loadTexPackage = async (packages: string[]): Promise<void> => {
  await import("@mathjax/src/js/input/tex/base/BaseConfiguration.js");

  await Promise.all(
    packages
      .filter((pkg) => pkg in texLoaders)
      .map((pkg) => texLoaders[pkg as keyof typeof texLoaders]()),
  );
};

export const createSession = async (options: SerializableMathjaxOptions): Promise<Session> => {
  const modules = await loadCoreModules();
  const {
    AssistiveMmlHandler,
    CHTML,
    RegisterHTMLHandler,
    SVG,
    TeX,
    liteAdaptor,
    mathjax: mathjaxLib,
  } = modules;

  const isCHTML = options.output === "chtml";
  const userOptions = (isCHTML ? options.chtml : options.svg) ?? {};
  const fontData =
    userOptions.fontData ??
    (isCHTML ? (await loadFontModules()).chtml : (await loadFontModules()).svg);
  const outputOptions = Object.assign(
    { fontData },
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
    reset,
    async render(items: MathjaxItem[]): Promise<string[]> {
      const document = getDocument();
      const html: string[] = [];

      for (const item of items) {
        // oxlint-disable-next-line no-await-in-loop
        const node = await document.convertPromise(item.content, { display: item.display });

        html.push(adaptor.outerHTML(node as LiteElement));
      }

      // Keep the existing "reset after each document" state-isolation semantics.
      reset();

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
