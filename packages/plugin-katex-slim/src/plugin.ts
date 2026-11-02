// oxlint-disable typescript/consistent-type-imports

import { escapeHtml } from "@mdit/helper";
import { tex } from "@mdit/plugin-tex";
import type { KatexOptions, KatexOptions as OriginalKatexOptions, StrictFunction } from "katex";
import type { Env, MarkdownIt } from "markdown-it";

import type { MarkdownItKatexOptions, TeXTransformer } from "./options.js";

let isKatexInstalled = true;
let katexLib: typeof import("katex");

try {
  katexLib = await import("katex");
} catch {
  /* istanbul ignore next -- @preserve */
  isKatexInstalled = false;
}

const katexInline = (
  content: string,
  options: OriginalKatexOptions,
  transformer?: TeXTransformer,
): string => {
  let result: string;

  try {
    result = katexLib.renderToString(content, options);
  } catch (err) {
    /* istanbul ignore else -- @preserve */
    if (err instanceof katexLib.ParseError) {
      // oxlint-disable-next-line no-console
      console.error(err);
      result = `<span class='katex-error' title='${escapeHtml(
        (err as Error).toString(),
      )}'>${escapeHtml(content)}</span>`;
    } else {
      throw err;
    }
  }

  return transformer?.(result, false) ?? result;
};

const katexBlock = (
  content: string,
  options: OriginalKatexOptions,
  transformer?: TeXTransformer,
): string => {
  let result: string;

  try {
    result = `<p class='katex-block'>${katexLib.renderToString(content, options)}</p>\n`;
  } catch (err) {
    /* istanbul ignore else -- @preserve */
    if (err instanceof katexLib.ParseError) {
      // oxlint-disable-next-line no-console
      console.error(err);
      result = `<p class='katex-block katex-error' title='${escapeHtml(
        (err as Error).toString(),
      )}'>${escapeHtml(content)}</p>\n`;
    } else {
      throw err;
    }
  }

  return transformer?.(result, true) ?? result;
};

export const katex = <MarkdownItEnv extends Env = Env>(
  md: MarkdownIt,
  {
    allowInlineWithSpace = false,
    delimiters,
    mathFence,
    logger = (errorCode: string): "ignore" | "warn" | "error" | boolean | undefined =>
      errorCode === "newLineInDisplayMode" ? "ignore" : "warn",
    transformer,
    ...userOptions
  }: MarkdownItKatexOptions<MarkdownItEnv> = {},
): void => {
  /* istanbul ignore if -- @preserve */
  if (!isKatexInstalled) throw new Error('[@mdit/plugin-katex-slim]: "katex" is not installed!');

  // Env of the formula that is currently being rendered. KaTeX only calls `strict`
  // synchronously while rendering a formula, so one shared callback reading this
  // variable behaves like a per-formula closure without allocating one per formula.
  let currentEnv: MarkdownItEnv;

  const strict: StrictFunction = (errorCode, errorMsg, token) =>
    logger(errorCode, errorMsg, token, currentEnv) ?? "ignore";

  // A single options object is reused for every formula: KaTeX reads it
  // synchronously, so there is no need to allocate a new object per formula.
  const commonKatexOptions: KatexOptions = Object.assign(
    {
      // see https://github.com/vuepress/ecosystem/issues/261
      // this ensures that `\gdef` works as expected macros: {},
      macros: {},
      throwOnError: false,
    },
    userOptions,
    // the plugin owns `strict` and forwards it to `logger` with the formula env
    { strict },
  );

  // reset macros after every render so `\gdef` does not leak across documents
  // while remaining usable anywhere within a single render.
  const originalRender = md.render.bind(md);
  const originalRenderInline = md.renderInline.bind(md);

  const resetMacros = (): void => {
    commonKatexOptions.macros = Object.assign({}, userOptions.macros);
  };

  md.render = (src: string, env?: MarkdownItEnv): string => {
    try {
      return originalRender(src, env);
    } finally {
      resetMacros();
    }
  };

  md.renderInline = (src: string, env?: MarkdownItEnv): string => {
    try {
      return originalRenderInline(src, env);
    } finally {
      resetMacros();
    }
  };

  resetMacros();

  md.use(tex, {
    allowInlineWithSpace,
    delimiters,
    mathFence,
    render: (content, displayMode, env) => {
      currentEnv = env as MarkdownItEnv;
      commonKatexOptions.displayMode = displayMode;

      return displayMode
        ? katexBlock(content, commonKatexOptions, transformer)
        : katexInline(content, commonKatexOptions, transformer);
    },
  });
};
