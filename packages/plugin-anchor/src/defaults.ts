import type { Token } from "markdown-it";

import type { PermalinkOptions } from "./permalink/types.js";
import { renderAttrs, renderHref } from "./utils.js";

export const defaultGetTokensText = (tokens: Token[]): string =>
  tokens
    .filter((token): boolean => token.type === "text" || token.type === "code_inline")
    .map((token) => token.content)
    .join("");

/**
 * Default slugify function: lowercase, keep ASCII alphanumeric / underscore / non-ASCII (CJK etc.),
 * fold whitespace (including nbsp) and dashes into a single dash, and strip other ASCII
 * punctuation.
 *
 * 默认 slug 生成函数：转小写、保留 ASCII 字母数字 / 下划线 / 非 ASCII（如中文）、 将空白（含 nbsp）与连字符折叠为单个连字符、剥离其余 ASCII 标点。
 *
 * @param str - The string to slugify / 要生成 slug 的字符串
 * @returns The slugified string / 生成的 slug
 */
export const defaultSlugify = (str: string): string => {
  let result = "";
  let prevDash = false;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);

    if (
      (code >= 48 && code <= 57) || // 0-9
      (code >= 97 && code <= 122) || // a-z
      (code >= 65 && code <= 90) || // A-Z
      code === 95 // _
    ) {
      result += code >= 65 && code <= 90 ? String.fromCharCode(code + 32) : str[i];
      prevDash = false;
    } else if (code === 32 || code === 9 || code === 45 || code === 160) {
      // whitespace (space, tab, nbsp) or a dash -> a single dash separator
      if (!prevDash && result.length > 0) {
        result += "-";
        prevDash = true;
      }
    } else if (code >= 128) {
      // non-ASCII (CJK etc.) is kept
      result += str[i];
      prevDash = false;
    }
    // other punctuation is stripped
  }

  // remove a possible trailing dash
  if (result.charCodeAt(result.length - 1) === 45 /* - */) result = result.slice(0, -1);

  return result;
};

/**
 * Legacy slugify: percent-encode based, keeps the previous default behavior for maximum
 * compatibility with tools that expect ASCII-only fragments.
 *
 * 旧版 slug 生成函数：基于百分号编码，保留此前的默认行为，以兼容期望纯 ASCII fragment 的工具。
 *
 * Forked and modified from
 * https://github.com/valeriangalliat/markdown-it-anchor/blob/master/index.mjs
 *
 * @param str - The string to slugify / 要生成 slug 的字符串
 * @returns The slugified string / 生成的 slug
 */
export const legacySlugify = (str: string): string =>
  encodeURIComponent(str.trim().toLowerCase().replaceAll(/\s+/g, "-"));

export const permalinkDefaults: PermalinkOptions = {
  class: "header-anchor",
  symbol: "#",
  renderHref,
  renderAttrs,
};
