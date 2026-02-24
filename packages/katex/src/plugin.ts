import { escapeHtml } from "@mdit/helper";
import { tex } from "@mdit/plugin-tex";
import type { KatexOptions, KatexOptions as OriginalKatexOptions } from "katex";
import { ParseError, renderToString } from "katex";
import type MarkdownIt from "markdown-it";

import type { MarkdownItKatexOptions, TeXTransformer } from "./options.js";

const katexInline = (
  content: string,
  options: OriginalKatexOptions,
  transformer?: TeXTransformer,
): string => {
  let result: string;

  try {
    result = renderToString(content, options);
  } catch (err) {
    /* istanbul ignore else -- @preserve */
    if (err instanceof ParseError) {
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
    result = `<p class='katex-block'>${renderToString(content, options)}</p>\n`;
  } catch (err) {
    /* istanbul ignore else -- @preserve */
    if (err instanceof ParseError) {
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

export const katex = <MarkdownItEnv = unknown>(
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
  const commonKatexOptions: KatexOptions = Object.assign(
    {
      // see https://github.com/vuepress/ecosystem/issues/261
      // this ensures that `\gdef` works as expected macros: {},
      macros: {},
      throwOnError: false,
    },
    userOptions,
  );

  md.use(tex, {
    allowInlineWithSpace,
    delimiters,
    mathFence,
    render: (content: string, displayMode: boolean, env: MarkdownItEnv) => {
      const katexOptions = Object.assign<KatexOptions, KatexOptions, KatexOptions>(
        {},
        commonKatexOptions,
        {
          strict: (errorCode, errorMsg, token) =>
            logger(errorCode, errorMsg, token, env) ?? "ignore",
          displayMode,
        },
      );

      return displayMode
        ? katexBlock(content, katexOptions, transformer)
        : katexInline(content, katexOptions, transformer);
    },
  });
};
