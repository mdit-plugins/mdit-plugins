/** Forked and modified from https://github.com/lostandfound/markdown-it-ruby/blob/master/index.js */

import { hasRule } from "@mdit/helper";
import type { InlineRule, PluginSimple } from "@mdit/helper";
import type { Token } from "markdown-it";

/**
 * Check whether the character at `pos` is escaped by an odd number of preceding backslashes.
 *
 * 检查 `pos` 位置的字符是否被转义，即其前面是否有奇数个反斜杠。
 *
 * @param src - Source string / 源字符串
 * @param pos - Position of the character to check / 要检查的字符位置
 * @returns Whether the character is escaped / 字符是否被转义
 */
const isEscaped = (src: string, pos: number): boolean => {
  let backslashes = 0;

  for (let index = pos - 1; index >= 0; index--) {
    if (src.charCodeAt(index) !== 92 /* \ */) break;

    backslashes++;
  }

  return backslashes % 2 === 1;
};

const rubyRule: InlineRule = (state, silent) => {
  let tokens: Token[];
  const start = state.pos;
  const max = state.posMax;
  const src = state.src;

  if (silent || src.charCodeAt(start) !== 123 /* { */ || start + 4 >= max) return false;

  let pos = start + 1;
  let dividerPosition = 0;
  let closePos = 0;

  while (pos < max) {
    const code = src.charCodeAt(pos);

    if (dividerPosition) {
      if (code === 125 /* } */ && !isEscaped(src, pos)) {
        closePos = pos;
        break;
      }
    } else if (code === 58 /* : */) {
      if (!isEscaped(src, pos)) dividerPosition = pos;
    } else if (code === 125 /* } */ && !isEscaped(src, pos)) {
      // The divider has to be followed by the closing brace, so an unescaped
      // closing brace before the divider means this opener can never match.
      // Returning here keeps non-matching input linear instead of scanning the
      // rest of the inline content for every opener.
      return false;
    }

    pos++;
  }

  if (!closePos) return false;

  // reject an empty ruby text (e.g. `{ab:}`) which would render an empty <rt>
  if (dividerPosition + 1 >= closePos) return false;

  const baseText = src.slice(start + 1, dividerPosition);
  const rubyText = src.slice(dividerPosition + 1, closePos);

  // reject empty `|`-separated ruby segments (e.g. `{ab:|}`), which would
  // otherwise render empty <rt> elements just like `{ab:}`; the segment count
  // is collected in the same pass so `split` is only needed for pairing
  let segments = 1;
  let segmentStart = 0;

  for (let index = 0; index < rubyText.length; index++) {
    if (rubyText.charCodeAt(index) === 124 /* | */) {
      if (index === segmentStart) return false;

      segments++;
      segmentStart = index + 1;
    }
  }

  if (segmentStart === rubyText.length) return false;

  // A single ruby segment annotates the whole base text, so only multi-segment
  // rubies can pair the base per code point. Besides, a base text of
  // `segments` to `2 * segments` UTF-16 code units is the only length that can
  // hold exactly `segments` code points, which avoids building the code point
  // array of `Array.from` for long base texts.
  const baseArray = segments === 1 || baseText.length > segments * 2 ? [] : Array.from(baseText);

  state.posMax = closePos;
  state.pos = start + 1;

  const { inline } = state.md;
  const openToken = state.push("ruby_open", "ruby", 1);

  openToken.markup = "{";

  if (baseArray.length === segments) {
    const rubyArray = rubyText.split("|");

    for (let index = 0; index < baseArray.length; index++) {
      inline.parse(baseArray[index], state.md, state.env, (tokens = []));
      state.tokens.push(...tokens);

      state.push("rt_open", "rt", 1);

      inline.parse(rubyArray[index], state.md, state.env, (tokens = []));
      state.tokens.push(...tokens);

      state.push("rt_close", "rt", -1);
    }
  } else {
    inline.parse(baseText, state.md, state.env, (tokens = []));
    state.tokens.push(...tokens);

    state.push("rt_open", "rt", 1);

    inline.parse(rubyText, state.md, state.env, (tokens = []));
    state.tokens.push(...tokens);

    state.push("rt_close", "rt", -1);
  }

  const closeToken = state.push("ruby_close", "ruby", -1);

  closeToken.markup = "}";

  state.pos = state.posMax + 1;
  state.posMax = max;

  return true;
};

export const ruby: PluginSimple = (md) => {
  // A second installation would register the inline rule twice.
  if (hasRule(md, "ruby", "inline")) return;

  md.inline.ruler.before("text", "ruby", rubyRule);
};
