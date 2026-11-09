/**
 * Forked from `markdown-it-cjk-breaks`
 * (https://github.com/markdown-it/markdown-it-cjk-breaks/blob/master/index.mjs), which is licensed
 * under the MIT License.
 *
 * Copyright (c) 2018 Authors.
 */

import { hasRule } from "@mdit/helper";
import type { CoreRule, PluginSimple } from "@mdit/helper";
import { eastAsianWidthType } from "get-east-asian-width";
import type { Token } from "markdown-it";

/** Zero-width space character / 零宽空格字符 */
const ZWSP = "\u200B";
/** Default character used when an adjacent character is missing / 相邻字符缺失时使用的默认字符 */
const SPACE = " ";

/**
 * Characters whose Script is Hangul (Unicode 10.0)
 *
 * 脚本为韩文的字符（Unicode 10.0）
 */
// The combining Hangul tone marks must stay at the start of the character class,
// otherwise `no-misleading-character-class` treats them as a combining sequence.
const HANGUL_RE =
  /[\u302E\u302F\u1100-\u11FF\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/u;

// Check whether two UTF-16 code units form a surrogate pair
const isSurrogatePair = (c1: number, c2: number): boolean =>
  c1 >= 0xd800 && c1 <= 0xdbff && c2 >= 0xdc00 && c2 <= 0xdfff;

// Check whether a character belongs to the Hangul script
const isHangul = (char: string): boolean => HANGUL_RE.test(char);

// Check whether a character has a fullwidth (F), wide (W) or halfwidth (H) East Asian Width
const isFwh = (char: string): boolean => {
  // oxlint-disable-next-line typescript/no-non-null-assertion
  const eastAsianWidth = eastAsianWidthType(char.codePointAt(0)!);

  return (
    eastAsianWidth === "fullwidth" || eastAsianWidth === "wide" || eastAsianWidth === "halfwidth"
  );
};

/**
 * Remove soft breaks that cannot be converted to spaces.
 *
 * 移除无法转换为空格的软换行。
 *
 * This is an internal helper exported for tests only; use the `cjkBreaks` plugin instead.
 *
 * 这是仅为测试而导出的内部函数，请使用 `cjkBreaks` 插件。
 *
 * @param tokens - Inline token children / 行内 token 子节点
 */
export const processInlines = (tokens: Token[]): void => {
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];

    if (token.type !== "softbreak") continue;

    // default last/next character to space
    let last = SPACE;
    let next = SPACE;

    for (let cursor = index - 1; cursor >= 0; cursor--) {
      const previousToken = tokens[cursor];

      if (previousToken.type !== "text") continue;
      if (previousToken.content.length === 0) break;

      const c1 = previousToken.content.charCodeAt(previousToken.content.length - 2);
      const c2 = previousToken.content.charCodeAt(previousToken.content.length - 1);

      last = previousToken.content.slice(isSurrogatePair(c1, c2) ? -2 : -1);
      break;
    }

    for (let cursor = index + 1; cursor < tokens.length; cursor++) {
      const nextToken = tokens[cursor];

      if (nextToken.type !== "text") continue;
      if (nextToken.content.length === 0) break;

      const c1 = nextToken.content.charCodeAt(0);
      const c2 = nextToken.content.charCodeAt(1);

      next = nextToken.content.slice(0, isSurrogatePair(c1, c2) ? 2 : 1);
      break;
    }

    let removeBreak = false;

    // remove newline if it's adjacent to ZWSP
    if (last === ZWSP || next === ZWSP) removeBreak = true;

    // remove newline if both characters are fullwidth (F), wide (W) or
    // halfwidth (H), but not Hangul
    if (isFwh(last) && isFwh(next) && !isHangul(last) && !isHangul(next)) removeBreak = true;

    if (removeBreak) {
      token.type = "text";
      token.content = "";
    }
  }
};

// Core rule rewriting soft breaks between East Asian characters
const cjkBreaksRule: CoreRule = (state) => {
  for (let blockIndex = state.tokens.length - 1; blockIndex >= 0; blockIndex--) {
    const blockToken = state.tokens[blockIndex];

    if (blockToken.type !== "inline") continue;

    // oxlint-disable-next-line typescript/no-non-null-assertion
    processInlines(blockToken.children!);
  }
};

export const cjkBreaks: PluginSimple = (md) => {
  if (hasRule(md, "cjk_breaks", "core")) return;

  md.core.ruler.push("cjk_breaks", cjkBreaksRule);
};
