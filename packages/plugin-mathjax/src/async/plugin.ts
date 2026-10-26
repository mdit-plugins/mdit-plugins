/** Forked from https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts */

import { MathJaxNewcmFont as chtmlFont } from "@mathjax/mathjax-newcm-font/js/chtml.js";
import { MathJaxNewcmFont as svgFont } from "@mathjax/mathjax-newcm-font/js/svg.js";
import { AssistiveMmlHandler } from "@mathjax/src/js/a11y/assistive-mml.js";
import type { LiteDocument } from "@mathjax/src/js/adaptors/lite/Document.js";
import type { LiteElement, LiteNode } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { LiteText } from "@mathjax/src/js/adaptors/lite/Text.js";
import { liteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import type { MathDocument } from "@mathjax/src/js/core/MathDocument.js";
import { RegisterHTMLHandler } from "@mathjax/src/js/handlers/html.js";
import { TeX } from "@mathjax/src/js/input/tex.js";
import { mathjax as mathjaxLib } from "@mathjax/src/js/mathjax.js";
import { CHTML } from "@mathjax/src/js/output/chtml.js";
import { SVG } from "@mathjax/src/js/output/svg.js";
import { tex } from "@mdit/plugin-tex";
import type { MarkdownIt } from "markdown-it";

import type { DocumentOptions, MarkdownItMathjaxOptions, MathjaxInstance } from "../options.js";
import { loadTexPackages, resolveTexPackages } from "../tex/index.js";
import { clearUserState } from "../utils.js";

type InputJax = DocumentOptions["InputJax"];

interface InstanceTexState {
  /** Whether HTML-related TeX packages are enabled / 是否启用 HTML 相关 TeX 包 */
  enableHtml: boolean;

  /** Create a TeX input jax with the given HTML capability / 创建具有指定 HTML 能力的 TeX 输入 jax */
  createInputJax: (enableHtml: boolean) => InputJax;
}

const instanceTexStates = new WeakMap<MathjaxInstance, InstanceTexState>();

/**
 * MathJax instances that are already installed on a markdown-it instance.
 *
 * A MathJax instance owns shared TeX state, so it must not be shared by multiple markdown-it
 * instances with different trust levels.
 *
 * 已安装到 markdown-it 实例上的 MathJax 实例。
 *
 * MathJax 实例持有共享的 TeX 状态，因此同一个实例不能被多个信任级别不同的 markdown-it 实例共用。
 */
const installedInstances = new WeakSet<MathjaxInstance>();

/**
 * Match the HTML-related TeX packages of an instance with the markdown-it `html` option.
 *
 * 让实例的 HTML 相关 TeX 包与 markdown-it 的 `html` 选项保持一致。
 *
 * @param instance - MathJax instance / MathJax 实例
 * @param enableHtml - Whether HTML is enabled / 是否启用 HTML
 */
const applyHtmlPackages = (instance: MathjaxInstance, enableHtml: boolean): void => {
  const state = instanceTexStates.get(instance);

  if (!state) {
    throw new Error(
      "[@mdit/plugin-mathjax] the given instance was not created by `createMathjaxInstance` from this package",
    );
  }

  if (state.enableHtml === enableHtml) return;

  instance.documentOptions.InputJax = state.createInputJax(enableHtml);
  state.enableHtml = enableHtml;
};

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
      ? { fontURL: "https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font/chtml/woff2" }
      : {},
    userOptions,
  );

  mathjaxLib.asyncLoad = (file): Promise<unknown> => {
    if (options.debug)
      // oxlint-disable-next-line no-console
      console.debug(`[MathJax]: loading ${file}...`);

    return import(file);
  };

  const userPackages = options.tex?.packages;

  // Load the HTML-related packages eagerly: `mathjax()` decides about them synchronously once the
  // markdown-it instance is available, so their configurations must already be registered.
  await loadTexPackages([...resolveTexPackages(userPackages), "html", "texhtml"]);

  return {
    InputJax: new TeX<LiteElement, string, HTMLElement>({
      ...options.tex,
      packages: resolveTexPackages(userPackages),
    }),
    OutputJax: new (isCHTML ? CHTML : SVG)<LiteElement, string, HTMLElement>(outputOptions),
    enableAssistiveMml: options.a11y !== false,
  };
};

export const createMathjaxInstance = async (
  options: MarkdownItMathjaxOptions = {},
): Promise<MathjaxInstance | null> => {
  const documentOptions = await getDocumentOptions(options);

  const { OutputJax } = documentOptions;

  const adaptor = liteAdaptor();
  // oxlint-disable-next-line new-cap
  const handler = RegisterHTMLHandler(adaptor);

  // oxlint-disable-next-line new-cap
  if (options.a11y !== false) AssistiveMmlHandler<LiteNode, LiteText, LiteDocument>(handler);

  const clearStyle = (): void => {
    // if there is no adaptor, output jax is not initialized yet, so nothing to clear
    if (OutputJax.adaptor == null) return;

    documentOptions.InputJax.reset();
    OutputJax.reset();
  };

  const reset = (): void => {
    documentOptions.InputJax.reset();
    clearUserState(documentOptions.InputJax);
  };

  const render = (content: string, displayMode: boolean): string => {
    const mathDocument = mathjaxLib
      .document(content, documentOptions)
      .convert(content, { display: displayMode }) as LiteElement;

    return adaptor.outerHTML(mathDocument);
  };

  const outputStyle = async (): Promise<string> => {
    await OutputJax.font.loadDynamicFiles();

    const style = adaptor.cssText(
      OutputJax.styleSheet(
        mathjaxLib.document("", documentOptions) as MathDocument<LiteElement, string, HTMLElement>,
      ),
    );

    clearStyle();

    return style;
  };

  const instance: MathjaxInstance = {
    adaptor,
    documentOptions,
    allowInlineWithSpace: options.allowInlineWithSpace ?? false,
    delimiters: options.delimiters ?? "dollars",
    mathFence: options.mathFence ?? false,
    clearStyle,
    render,
    reset,
    outputStyle,
    transformer: options.transformer ?? null,
  };

  instanceTexStates.set(instance, {
    enableHtml: false,
    createInputJax: (enableHtml: boolean): InputJax =>
      new TeX<LiteElement, string, HTMLElement>({
        ...options.tex,
        packages: resolveTexPackages(options.tex?.packages, enableHtml),
      }),
  });

  return instance;
};

export const mathjax = (md: MarkdownIt, instance: MathjaxInstance): void => {
  if (installedInstances.has(instance)) {
    throw new Error(
      "[@mdit/plugin-mathjax] the instance is already installed on a MarkdownIt instance. Create a separate MathJax instance with `createMathjaxInstance` for each `MarkdownIt` instance",
    );
  }

  // The markdown-it `html` option is read when the plugin is installed; later changes through
  // `md.set()` are intentionally not observed, so a single MathJax instance always maps to a single
  // trust level.
  // markdown-it 的 `html` 选项在插件安装时读取；之后通过 `md.set()` 的修改不会生效，从而保证一个
  // MathJax 实例只对应一个信任级别。
  applyHtmlPackages(instance, md.options.html);

  installedInstances.add(instance);

  const {
    allowInlineWithSpace,
    delimiters,
    mathFence,
    render: renderMath,
    reset,
    transformer,
  } = instance;
  // Reset the shared TeX input state (macros/labels) after each render so that
  // state does not leak across documents rendered by the same instance.
  const render = md.render.bind(md);
  const renderInline = md.renderInline.bind(md);

  md.render = (src, env): string => {
    try {
      return render(src, env);
    } finally {
      reset();
    }
  };
  md.renderInline = (src, env): string => {
    try {
      return renderInline(src, env);
    } finally {
      reset();
    }
  };

  md.use(tex, {
    allowInlineWithSpace,
    delimiters,
    mathFence,
    render: (content, displayMode) => {
      const result = renderMath(content, displayMode);

      return transformer?.(result, displayMode) ?? result;
    },
  });
};
