import { createRequire } from "node:module";

import { escapeHtml } from "@mdit/helper";
import { tex } from "@mdit/plugin-tex";
import type { KatexOptions, KatexOptions as OriginalKatexOptions } from "katex";
import { ParseError, renderToString } from "katex";
import type MarkdownIt from "markdown-it";

import type {
  KatexToken,
  MarkdownItKatexOptions,
  TeXTransformer,
} from "./options.js";

const require = createRequire(import.meta.url);

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
      console.warn(error);
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
      console.warn(error);
      result = `<p class='katex-block katex-error' title='${escapeHtml(
        (error as Error).toString(),
      )}'>${escapeHtml(tex)}</p>\n`;
    } else {
      throw error;
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
    mathFence = false,
    mhchem = false,
    logger = (errorCode: string): string =>
      errorCode === "newLineInDisplayMode" ? "ignore" : "warn",
    transformer,
    ...userOptions
  } = options;

  if (mhchem) require("katex/contrib/mhchem");

  md.use(tex, {
    allowInlineWithSpace,
    mathFence,
    render: (content: string, displayMode: boolean, env: MarkdownItEnv) => {
      const katexOptions: KatexOptions = {
        // @ts-expect-error: Type issue upstream
        strict: (
          errorCode:
            | "unknownSymbol"
            | "unicodeTextInMathMode"
            | "mathVsTextUnits"
            | "commentAtEnd"
            | "htmlExtension"
            | "newLineInDisplayMode",
          errorMsg: string,
          token: KatexToken,
        ) => logger(errorCode, errorMsg, token, env) ?? "ignore",
        throwOnError: false,
        ...userOptions,
      };

      return displayMode
        ? katexBlock(content, katexOptions, transformer)
        : katexInline(content, katexOptions, transformer);
    },
  });
};
