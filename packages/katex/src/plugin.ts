import { createRequire } from "node:module";
import { tex } from "@mdit/plugin-tex";
import Katex from "katex";
import { escapeHtml } from "./utils.js";

import type { PluginWithOptions } from "markdown-it";
import type { KatexOptions as OriginalKatexOptions } from "katex";
import type { MarkdownItKatexOptions } from "./options.js";

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
      strict: (errorCode: string): string =>
        errorCode === "newLineInDisplayMode" ? "ignore" : "warn",
    })}</p>\n`;
  } catch (error) {
    if (options.throwOnError) console.warn(error);

    return `<p class='katex-block katex-error' title='${escapeHtml(
      (error as Error).toString()
    )}'>${escapeHtml(tex)}</p>\n`;
  }
};

export const katex: PluginWithOptions<MarkdownItKatexOptions> = (
  md,
  options = {}
) => {
  const { mhchem = false, ...userOptions } = options;

  if (mhchem) require("katex/contrib/mhchem");

  const katexOptions = {
    throwOnError: false,
    ...userOptions,
  };

  md.use(tex, {
    render: (content: string, displayMode: boolean) =>
      displayMode
        ? katexBlock(content, katexOptions)
        : katexInline(content, katexOptions),
  });
};
