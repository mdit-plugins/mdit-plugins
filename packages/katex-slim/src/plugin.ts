/* eslint-disable @typescript-eslint/consistent-type-imports */
import { createRequire } from "node:module";

import { escapeHtml } from "@mdit/helper";
import { tex } from "@mdit/plugin-tex";
import type { KatexOptions as OriginalKatexOptions } from "katex";
import type MarkdownIt from "markdown-it";

import type {
  KatexToken,
  MarkdownItKatexOptions,
  TeXTransformer,
} from "./options.js";

const require = createRequire(import.meta.url);

let isKatexInstalled = true;
let katexLib: typeof import("katex");

try {
  katexLib = (await import("katex"))
    .default as unknown as typeof import("katex");
} catch {
  isKatexInstalled = false;
}

const katexInline = (
  tex: string,
  options: OriginalKatexOptions,
  transformer?: TeXTransformer,
): string => {
  let result: string;

  try {
    result = katexLib.renderToString(tex, {
      ...options,
      displayMode: false,
    });
  } catch (error) {
    if (options.throwOnError) console.warn(error);

    result = `<span class='katex-error' title='${escapeHtml(
      (error as Error).toString(),
    )}'>${escapeHtml(tex)}</span>`;
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
    result = `<p class='katex-block'>${katexLib.renderToString(tex, {
      ...options,
      displayMode: true,
    })}</p>\n`;
  } catch (error) {
    if (options.throwOnError) console.warn(error);

    result = `<p class='katex-block katex-error' title='${escapeHtml(
      (error as Error).toString(),
    )}'>${escapeHtml(tex)}</p>\n`;
  }

  return transformer?.(result, true) ?? result;
};

export const katex = <MarkdownItEnv = unknown>(
  md: MarkdownIt,
  options: MarkdownItKatexOptions<MarkdownItEnv> = {},
): void => {
  if (!isKatexInstalled) {
    console.error('[@mdit/plugin-katex]: "katex" not installed!');

    return;
  }

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
        ): string => logger(errorCode, errorMsg, token, env) || "ignore",
        throwOnError: false,
        ...userOptions,
      };

      return displayMode
        ? katexBlock(content, katexOptions, transformer)
        : katexInline(content, katexOptions, transformer);
    },
  });
};
