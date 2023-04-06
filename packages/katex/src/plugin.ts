import { createRequire } from "node:module";

import { tex } from "@mdit/plugin-tex";
import Katex, { type KatexOptions as OriginalKatexOptions } from "katex";
import type MarkdownIt from "markdown-it";

import { type MarkdownItKatexOptions } from "./options.js";
import { escapeHtml } from "./utils.js";

const require = createRequire(import.meta.url);

const katexInline = (tex: string, options: OriginalKatexOptions): string => {
  try {
    return Katex.renderToString(tex, { ...options, displayMode: false });
  } catch (error) {
    if (options.throwOnError) console.warn(error);

    return `<span class='katex-error' title='${escapeHtml(
      (error as Error).toString()
    )}'>${escapeHtml(tex)}</span>`;
  }
};

const katexBlock = (tex: string, options: OriginalKatexOptions): string => {
  try {
    return `<p class='katex-block'>${Katex.renderToString(tex, {
      ...options,
      displayMode: true,
    })}</p>\n`;
  } catch (error) {
    if (options.throwOnError) console.warn(error);

    return `<p class='katex-block katex-error' title='${escapeHtml(
      (error as Error).toString()
    )}'>${escapeHtml(tex)}</p>\n`;
  }
};

export const katex = <MarkdownItEnv = unknown>(
  md: MarkdownIt,
  options: MarkdownItKatexOptions<MarkdownItEnv> = {}
): void => {
  const {
    mhchem = false,
    logger = (errorCode: string): string =>
      errorCode === "newLineInDisplayMode" ? "ignore" : "warn",
    ...userOptions
  } = options;

  if (mhchem) require("katex/contrib/mhchem");

  md.use(tex, {
    render: (content: string, displayMode: boolean, env: MarkdownItEnv) => {
      const katexOptions = {
        ...(typeof logger === "function"
          ? {
              strict: (
                errorCode:
                  | "unknownSymbol"
                  | "unicodeTextInMathMode"
                  | "mathVsTextUnits"
                  | "commentAtEnd"
                  | "htmlExtension"
                  | "newLineInDisplayMode",
                errorMsg: string,
                token: string
              ): string => {
                logger(errorCode, errorMsg, token, env);

                return "ignore";
              },
            }
          : {}),
        throwOnError: false,
        ...userOptions,
      };

      return displayMode
        ? katexBlock(content, katexOptions)
        : katexInline(content, katexOptions);
    },
  });
};
