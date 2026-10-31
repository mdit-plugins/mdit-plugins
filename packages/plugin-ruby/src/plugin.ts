/** Forked and modified from https://github.com/lostandfound/markdown-it-ruby/blob/master/index.js */

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

  if (silent || state.src.charCodeAt(start) !== 123 /* { */ || start + 4 >= max) return false;

  state.pos = start + 1;

  let dividerPosition = 0;
  let closePos = 0;

  while (state.pos < max) {
    if (dividerPosition) {
      if (state.src.charCodeAt(state.pos) === 125 /* } */ && !isEscaped(state.src, state.pos)) {
        closePos = state.pos;
        break;
      }
    } else if (state.src.charCodeAt(state.pos) === 58 /* : */ && !isEscaped(state.src, state.pos)) {
      dividerPosition = state.pos;
    }

    state.pos++;
  }

  if (!closePos || start + 1 === state.pos) {
    state.pos = start;

    return false;
  }

  // reject an empty ruby text (e.g. `{ab:}`) which would render an empty <rt>
  if (dividerPosition + 1 >= closePos) {
    state.pos = start;

    return false;
  }

  const baseText = state.src.slice(start + 1, dividerPosition);
  const rubyText = state.src.slice(dividerPosition + 1, closePos);
  const rubyArray = rubyText.split("|");

  // reject empty `|`-separated ruby segments (e.g. `{ab:|}`), which would
  // otherwise render empty <rt> elements just like `{ab:}`
  if (rubyArray.some((text) => text.length === 0)) {
    state.pos = start;

    return false;
  }

  state.posMax = state.pos;
  state.pos = start + 1;

  const openToken = state.push("ruby_open", "ruby", 1);

  openToken.markup = "{";

  const baseArray = Array.from(baseText);

  if (baseArray.length === rubyArray.length) {
    baseArray.forEach((content, index) => {
      state.md.inline.parse(content, state.md, state.env, (tokens = []));

      state.tokens.push(...tokens);

      state.push("rt_open", "rt", 1);

      state.md.inline.parse(rubyArray[index], state.md, state.env, (tokens = []));

      state.tokens.push(...tokens);

      state.push("rt_close", "rt", -1);
    });
  } else {
    state.md.inline.parse(baseText, state.md, state.env, (tokens = []));
    state.tokens.push(...tokens);

    state.push("rt_open", "rt", 1);

    state.md.inline.parse(rubyText, state.md, state.env, (tokens = []));
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
  md.inline.ruler.before("text", "ruby", rubyRule);
};
