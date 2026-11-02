/**
 * Forked from `markdown-it-cjk-friendly`
 * (https://github.com/tats-u/markdown-cjk-friendly/blob/main/packages/markdown-it-cjk-friendly/src/index.ts),
 * which is licensed under the MIT License.
 *
 * Copyright (c) 2024 Tatsunori Uchino
 *
 * The overridden `StateInline#scanDelims` is derived from markdown-it
 * (https://github.com/markdown-it/markdown-it/blob/master/src/rules_inline/state_inline.mjs).
 *
 * Copyright (c) 2014 Vitaly Puzrin, Alex Kocharin
 */

import type { PluginSimple } from "@mdit/helper";
import { eastAsianWidthType } from "get-east-asian-width";
import type { MarkdownIt } from "markdown-it";

/** Characters with the Emoji_Presentation property / 默认 emoji 展示字符 */
const EMOJI_PRESENTATION_RE = /^\p{Emoji_Presentation}/u;
/** Unicode space separators / Unicode 空格分隔符 */
const SPACE_SEPARATOR_RE = /^\p{Zs}/u;
/** Characters whose Script is Hangul / Unicode 脚本为韩文的字符 */
const HANGUL_SCRIPT_RE = /^\p{sc=Hangul}/u;

/** Code point of the space character / 空格字符的码点 */
const SPACE = 0x20;
/** Start of the Hangul scripts; smaller code points can never be Hangul / 韩文脚本的起点，更小的码点一定不是韩文 */
const HANGUL_START = 0x1100;
/** Ideographic Variation Selector range / 表意文字变体选择符范围 */
const IVS_MIN = 0xe0100;
const IVS_MAX = 0xe01ef;
/** Non-emoji general-use variation selector range / 非 emoji 通用变体选择符范围 */
const SVS_MIN = 0xfe00;
const SVS_MAX = 0xfe0e;

// Check whether a code point has a default emoji presentation
const isEmoji = (uc: number): boolean => EMOJI_PRESENTATION_RE.test(String.fromCodePoint(uc));

/**
 * Check if `uc` is CJK. Deferred (returns `null`) if IVS.
 *
 * 判断 `uc` 是否为 CJK 字符。若需要结合前置字符判断则返回 `null`。
 *
 * @param uc - Code point / 码点
 * @returns `true` if `uc` is CJK, `false` if not, `null` if IVS / 是 CJK 返回 `true`，不是返回 `false`，待定返回
 *   `null`
 */
const isCjkBase = (uc: number): boolean | null => {
  // Fast path; see: https://www.unicode.org/Public/UCD/latest/ucd/Scripts.txt
  if (uc < HANGUL_START) return false;

  const eastAsianWidth = eastAsianWidthType(uc);

  if (eastAsianWidth === "fullwidth" || eastAsianWidth === "halfwidth") return true; // never be emoji
  if (eastAsianWidth === "wide") return !isEmoji(uc);
  if (eastAsianWidth === "narrow") return false;
  if (eastAsianWidth === "ambiguous") {
    // no Hangul as of Unicode 16
    // needs an additional check according to the distance from the emphasis
    return null;
  }

  // neutral
  // 1160..11FF     ; N  # Lo   [160] HANGUL JUNGSEONG FILLER..HANGUL JONGSEONG SSANGNIEUN
  return HANGUL_SCRIPT_RE.test(String.fromCodePoint(uc));
};

// Check whether `uc` is a CJK quotation mark
const isQuotationMark = (uc: number): boolean =>
  uc === 0x2018 /* ‘ */ || uc === 0x2019 /* ’ */ || uc === 0x201c /* “ */ || uc === 0x201d; /* ” */

/**
 * Check if `uc` is CJK, taking the character before it into account.
 *
 * 结合前置字符判断 `uc` 是否为 CJK 字符。
 *
 * @param uc - Code point to check / 待判断码点
 * @param prev - Code point immediately before `uc` / `uc` 紧邻的前置码点
 * @returns Whether `uc` is CJK / `uc` 是否为 CJK
 */
const is2PreviousCjk = (uc: number, prev: number): boolean =>
  // https://www.unicode.org/Public/16.0.0/ucd/StandardizedVariants.txt
  // See {left,right}-justified fullwidth form in East Asian punctuation positional and width variants
  isCjkBase(uc) ?? (prev === 0xfe01 && isQuotationMark(uc));

// Check if the character before the delimiter run is CJK
const isPreviousCjk = (uc: number): boolean =>
  // IVS is Ambiguous
  isCjkBase(uc) ?? (IVS_MIN <= uc && uc <= IVS_MAX);

// Check if the character after the delimiter run is CJK
const isNextCjk = (uc: number): boolean => isCjkBase(uc) ?? false;

// Check whether `uc` is a non-emoji general-use variation selector
const nonEmojiGeneralUseVS = (uc: number): boolean => SVS_MIN <= uc && uc <= SVS_MAX;

/**
 * Get the code point and start position of the last character before `pos`.
 *
 * 获取 `pos` 之前最后一个字符的码点及起始位置。
 *
 * @param str - Source string / 源字符串
 * @param pos - Position to look before / 查找位置
 * @returns Code point and its start position; `[space, -1]` at the beginning of the line /
 *   码点及其起始位置，行首返回 `[空格, -1]`
 */
const getLastCharCode = (str: string, pos: number): [number, number] => {
  // treat beginning of the line as a whitespace
  if (pos <= 0) return [SPACE, -1];

  const charCode = str.charCodeAt(pos - 1);
  // not low surrogates (BMP)
  if (charCode < 0xdc00 || charCode > 0xdfff) return [charCode, pos - 1];

  // 0 if out of range (leading stray low surrogates)
  const codePoint = str.codePointAt(pos - 2) ?? 0;

  return codePoint > 0xffff ? [codePoint, pos - 2] : [charCode, pos - 1];
};

/** MarkdownIt instances that already installed this plugin / 已安装此插件的 MarkdownIt 实例 */
const installedMarkdownIt = new WeakSet<MarkdownIt>();

export const cjkFriendly: PluginSimple = (md) => {
  if (installedMarkdownIt.has(md)) return;

  installedMarkdownIt.add(md);

  const PreviousState = md.inline.State;

  class CjkFriendlyState extends PreviousState {
    override scanDelims(
      start: number,
      canSplitWord: boolean,
    ): ReturnType<typeof PreviousState.prototype.scanDelims> {
      const max = this.posMax;
      const marker = this.src.charCodeAt(start);

      const [lastChar, lastCharPos] = getLastCharCode(this.src, start);
      let lastMainChar = lastChar;
      let twoPrevChar: number | null = null;

      if (nonEmojiGeneralUseVS(lastChar)) {
        twoPrevChar = getLastCharCode(this.src, lastCharPos)[0];

        if (!SPACE_SEPARATOR_RE.test(String.fromCodePoint(twoPrevChar))) lastMainChar = twoPrevChar;
      }

      let pos = start;

      while (pos < max && this.src.charCodeAt(pos) === marker) pos++;

      const count = pos - start;

      // treat end of the line as a whitespace
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const nextChar = pos < max ? this.src.codePointAt(pos)! : SPACE;

      // We don't consider a sequence of a Unicode whitespace followed by a general-use VS
      const isLastWhiteSpace = this.md.utils.isWhiteSpace(lastMainChar);
      const isNextWhiteSpace = this.md.utils.isWhiteSpace(nextChar);

      // Fast path for the most cases adjacent to whitespaces (no need to check for CJK characters)
      if (isLastWhiteSpace || isNextWhiteSpace) {
        return {
          can_open: !isNextWhiteSpace,
          can_close: !isLastWhiteSpace,
          length: count,
        };
      }

      const isLastPunctChar =
        this.md.utils.isMdAsciiPunct(lastMainChar) ||
        this.md.utils.isPunctChar(String.fromCodePoint(lastMainChar));
      const isNextPunctChar =
        this.md.utils.isMdAsciiPunct(nextChar) ||
        this.md.utils.isPunctChar(String.fromCodePoint(nextChar));

      // Fast path for `_`
      let leftFlanking = isLastPunctChar;
      let rightFlanking = isNextPunctChar;

      if (canSplitWord) {
        // Slow path for `*`

        const isEitherCjkChar =
          // We don't consider a sequence of an ideographic VS followed by a general-purpose VS
          isNextCjk(nextChar) ||
          // isPreviousCjk (more complex than isNextCjk as for now, so place it last)
          (twoPrevChar == null ? isPreviousCjk(lastChar) : is2PreviousCjk(twoPrevChar, lastChar));

        leftFlanking ||= isEitherCjkChar || !isNextPunctChar;
        rightFlanking ||= isEitherCjkChar || !isLastPunctChar;
      }

      return {
        can_open: leftFlanking,
        can_close: rightFlanking,
        length: count,
      };
    }
  }

  md.inline.State = CjkFriendlyState;
};
