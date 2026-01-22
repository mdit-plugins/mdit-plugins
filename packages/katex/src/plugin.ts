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

  options.displayMode = false;

  try {
    result = renderToString(tex, options);
  } catch (err) {
    /* istanbul ignore else -- @preserve */
    if (err instanceof ParseError) {
      // oxlint-disable-next-line no-console
      console.error(err);
      result = `<span class='katex-error' title='${escapeHtml(
        (err as Error).toString(),
      )}'>${escapeHtml(tex)}</span>`;
    } else {
      throw err;
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

  options.displayMode = true;

  try {
    result = `<p class='katex-block'>${renderToString(tex, options)}</p>\n`;
  } catch (err) {
    /* istanbul ignore else -- @preserve */
    if (err instanceof ParseError) {
      // oxlint-disable-next-line no-console
      console.error(err);
      result = `<p class='katex-block katex-error' title='${escapeHtml(
        (err as Error).toString(),
      )}'>${escapeHtml(tex)}</p>\n`;
    } else {
      throw err;
    }
  }

  return transformer?.(result, true) ?? result;
};

export const katex = <MarkdownItEnv = unknown>(
  md: MarkdownIt,
  options: MarkdownItKatexOptions<MarkdownItEnv> = {},
): void => {
  const {
    allowInlineWithSpace = false,
    delimiters,
    mathFence,
    logger = (errorCode: string): "ignore" | "warn" | "error" | boolean | undefined =>
      errorCode === "newLineInDisplayMode" ? "ignore" : "warn",
    transformer,
    ...userOptions
  } = options;

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
      const katexOptions = Object.assign({}, commonKatexOptions, {
        strict: (errorCode, errorMsg, token) =>
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          logger(errorCode, errorMsg, token, env) ?? "ignore",
      });

      return displayMode
        ? katexBlock(content, katexOptions, transformer)
        : katexInline(content, katexOptions, transformer);
    },
  });
};
