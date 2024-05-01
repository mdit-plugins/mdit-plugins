/* eslint-disable @typescript-eslint/consistent-type-imports */
import { createRequire } from "node:module";

import { tex } from "@mdit/plugin-tex";
import type { KatexOptions as OriginalKatexOptions } from "katex";
import type MarkdownIt from "markdown-it";

import type { KatexToken, MarkdownItKatexOptions } from "./options.js";
import { escapeHtml } from "./utils.js";

const require = createRequire(import.meta.url);

let isKatexInstalled = true;
let katexLib: typeof import("katex");

try {
  katexLib = (await import("katex"))
    .default as unknown as typeof import("katex");
} catch (err) {
  isKatexInstalled = false;
}

const katexInline = (
  tex: string,
  options: OriginalKatexOptions,
  vPre: boolean,
): string => {
  try {
    const result = katexLib.renderToString(tex, {
      ...options,
      displayMode: false,
    });

    return vPre
      ? result.replace(/ class="katex"/g, ' v-pre class="katex"')
      : result;
  } catch (error) {
    if (options.throwOnError) console.warn(error);

    return `<span ${
      vPre ? "v-pre " : ""
    }class='katex-error' title='${escapeHtml(
      (error as Error).toString(),
    )}'>${escapeHtml(tex)}</span>`;
  }
};

const katexBlock = (
  tex: string,
  options: OriginalKatexOptions,
  vPre: boolean,
): string => {
  try {
    return `<p ${vPre ? "v-pre " : ""}class='katex-block'>${katexLib.renderToString(
      tex,
      {
        ...options,
        displayMode: true,
      },
    )}</p>\n`;
  } catch (error) {
    if (options.throwOnError) console.warn(error);

    return `<p ${
      vPre ? "v-pre " : ""
    }class='katex-block katex-error' title='${escapeHtml(
      (error as Error).toString(),
    )}'>${escapeHtml(tex)}</p>\n`;
  }
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
    vPre = false,
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
        ): string => logger(errorCode, errorMsg, token, env) ?? "ignore",
        throwOnError: false,
        ...userOptions,
      };

      return displayMode
        ? katexBlock(content, katexOptions, vPre)
        : katexInline(content, katexOptions, vPre);
    },
  });
};
