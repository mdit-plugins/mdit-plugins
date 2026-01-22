/**
 * Forked and modified from https://github.com/lostandfound/markdown-it-ruby/blob/master/index.js
 */

import type { PluginSimple } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";

const rubyRule: RuleInline = (state, silent) => {
  let tokens: Token[];
  const start = state.pos;
  const max = state.posMax;

  if (silent || state.src.charCodeAt(start) !== 123 /* { */ || start + 4 >= max) return false;

  state.pos = start + 1;

  let dividerPosition = 0;
  let closePos = 0;

  while (state.pos < max) {
    if (dividerPosition) {
      if (
        state.src.charCodeAt(state.pos) === 125 /* } */ &&
        state.src.charCodeAt(state.pos - 1) !== 92 /* \ */
      ) {
        closePos = state.pos;
        break;
      }
    } else if (
      state.src.charCodeAt(state.pos) === 58 /* : */ &&
      state.src.charCodeAt(state.pos - 1) !== 92 /* \ */
    ) {
      dividerPosition = state.pos;
    }

    state.pos++;
  }

  if (!closePos || start + 1 === state.pos) {
    state.pos = start;

    return false;
  }

  state.posMax = state.pos;
  state.pos = start + 1;

  const openToken = state.push("ruby_open", "ruby", 1);

  openToken.markup = "{";

  const baseText = state.src.slice(start + 1, dividerPosition);
  const rubyText = state.src.slice(dividerPosition + 1, closePos);

  const baseArray = baseText.split("");
  const rubyArray = rubyText.split("|");

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
