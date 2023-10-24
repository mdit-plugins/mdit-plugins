import { createRequire } from "node:module";

import { tex } from "@mdit/plugin-tex";
import {
  type default as Katex,
  type KatexOptions as OriginalKatexOptions,
} from "katex";
import type MarkdownIt from "markdown-it";

import { type KatexToken, type MarkdownItKatexOptions } from "./options.js";
import { escapeHtml } from "./utils.js";

const require = createRequire(import.meta.url);

const katexInline = (
  tex: string,
  katex: typeof Katex,
  options: OriginalKatexOptions,
): string => {
  try {
    return katex.renderToString(tex, {
      ...options,
      displayMode: false,
    });
  } catch (error) {
    if (options.throwOnError) console.warn(error);

    return `<span class='katex-error' title='${escapeHtml(
      (error as Error).toString(),
    )}'>${escapeHtml(tex)}</span>`;
  }
};

const katexBlock = (
  tex: string,
  katex: typeof Katex,
  options: OriginalKatexOptions,
): string => {
  try {
    return `<p class='katex-block'>${katex.renderToString(tex, {
      ...options,
      displayMode: true,
    })}</p>\n`;
  } catch (error) {
    if (options.throwOnError) console.warn(error);

    return `<p class='katex-block katex-error' title='${escapeHtml(
      (error as Error).toString(),
    )}'>${escapeHtml(tex)}</p>\n`;
  }
};

export const katex = <MarkdownItEnv = unknown>(
  md: MarkdownIt,
  options: MarkdownItKatexOptions<MarkdownItEnv> = {},
): void => {
  const {
    mathFence = false,
    mhchem = false,
    logger = (errorCode: string): string =>
      errorCode === "newLineInDisplayMode" ? "ignore" : "warn",
    ...userOptions
  } = options;

  try {
    const katex = <typeof Katex>require("katex");

    if (mhchem) require("katex/contrib/mhchem");

    md.use(tex, {
      mathFence,
      render: (content: string, displayMode: boolean, env: MarkdownItEnv) => {
        const katexOptions = {
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
          ): string => logger(errorCode, errorMsg, token, env) ?? "ignore",
          throwOnError: false,
          ...userOptions,
        };

        return displayMode
          ? katexBlock(content, katex, katexOptions)
          : katexInline(content, katex, katexOptions);
      },
    });
  } catch (err) {
    console.error('[@mdit/plugin-katex]: You should install "katex"!');
  }
};
