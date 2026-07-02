import type Token from "markdown-it/lib/token.mjs";

import type { PermalinkOptions } from "./permalink/types.js";
import { renderAttrs, renderHref } from "./utils.js";

export const defaultGetTokensText = (tokens: Token[]): string =>
  tokens
    .filter((token): boolean => token.type === "text" || token.type === "code_inline")
    .map((token) => token.content)
    .join("");

export const defaultSlugify = (str: string): string =>
  encodeURIComponent(str.trim().toLowerCase().replaceAll(/\s+/g, "-"));

export const permalinkDefaults: PermalinkOptions = {
  class: "header-anchor",
  symbol: "#",
  renderHref,
  renderAttrs,
};
