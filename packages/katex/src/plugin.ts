import { escapeHtml } from "@mdit/helper";
import { tex } from "@mdit/plugin-tex";
import type { KatexOptions, KatexOptions as OriginalKatexOptions } from "katex";
import { ParseError, renderToString } from "katex";
import type MarkdownIt from "markdown-it";

import type { MarkdownItKatexOptions, TeXTransformer } from "./options.js";

const katexInline = (
  tex: string,
  options: OriginalKatexOptions,
  transformer?: TeXTransformer,
): string => {
  let result: string;

  try {
    result = renderToString(tex, {
      ...options,
      displayMode: false,
    });
  } catch (error) {
    /* istanbul ignore else -- @preserve */
    if (error instanceof ParseError) {
      console.error(error);
      result = `<span class='katex-error' title='${escapeHtml(
        (error as Error).toString(),
      )}'>${escapeHtml(tex)}</span>`;
    } else {
      throw error;
    }
  }

  return transformer?.(result, false) ?? result;
};

const katexBlock = (
  tex: string,
  options: OriginalKatexOptions,
  transformer?: TeXTransformer,
): string => {
  let result: string;

  try {
    result = `<p class='katex-block'>${renderToString(tex, {
      ...options,
      displayMode: true,
    })}</p>\n`;
  } catch (error) {
    /* istanbul ignore else -- @preserve */
    if (error instanceof ParseError) {
      console.error(error);
      result = `<p class='katex-block katex-error' title='${escapeHtml(
        (error as Error).toString(),
      )}'>${escapeHtml(tex)}</p>\n`;
    } else {
      throw error;
    }
  }

  return transformer?.(result, true) ?? result;
};

export const loadMhchem = async (): Promise<void> => {
  await import("katex/contrib/mhchem");
};

export const katex = <MarkdownItEnv = unknown>(
  md: MarkdownIt,
  options: MarkdownItKatexOptions<MarkdownItEnv> = {},
): void => {
  const {
    allowInlineWithSpace = false,
    delimiters,
    mathFence,
    logger = (
      errorCode: string,
    ): "ignore" | "warn" | "error" | boolean | undefined =>
      errorCode === "newLineInDisplayMode" ? "ignore" : "warn",
    // see https://github.com/vuepress/ecosystem/issues/261
    // this ensures that `\gdef` works as expected
    macros = {},
    transformer,
    ...userOptions
  } = options;

  md.use(tex, {
    allowInlineWithSpace,
    delimiters,
    mathFence,
    render: (content: string, displayMode: boolean, env: MarkdownItEnv) => {
      const katexOptions: KatexOptions = {
        strict: (errorCode, errorMsg, token) =>
          logger(errorCode, errorMsg, token, env) ?? "ignore",
        macros,
        throwOnError: false,
        ...userOptions,
      };

      return displayMode
        ? katexBlock(content, katexOptions, transformer)
        : katexInline(content, katexOptions, transformer);
    },
  });
};
