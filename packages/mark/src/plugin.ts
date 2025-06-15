/**
 * Forked and modified from https://github.com/markdown-it/markdown-it-mark/blob/master/index.mjs
 */

import type { PluginSimple } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";
import type { Delimiter } from "markdown-it/lib/rules_inline/state_inline.mjs";

/*
 * Insert each marker as a separate text token, and add it to delimiter list
 *
 */
const tokenize: RuleInline = (state, silent) => {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);

  if (silent || marker !== 61 /* = */) return false;

  const scanned = state.scanDelims(state.pos, true);
  let { length } = scanned;

  if (length < 2) return false;

  const markerChar = String.fromCharCode(marker);

  if (length % 2) {
    const token = state.push("text", "", 0);

    token.content = markerChar;
    length--;
  }

  for (let i = 0; i < length; i += 2) {
    const token = state.push("text", "", 0);

    token.content = markerChar + markerChar;

    if (scanned.can_open || scanned.can_close)
      state.delimiters.push({
        marker: 0x3d,
        length: 0, // disable "rule of 3" length checks meant for emphasis
        token: state.tokens.length - 1,
        end: -1,
        open: scanned.can_open,
        close: scanned.can_close,
      });
  }

  state.pos += scanned.length;

  return true;
};

/*
 * Walk through delimiter list and replace text tokens with tags
 *
 */
const postProcess = (state: StateInline, delimiters: Delimiter[]): void => {
  let token;
  const loneMarkers = [];
  const max = delimiters.length;

  for (let i = 0; i < max; i++) {
    const startDelim = delimiters[i];

    if (startDelim.marker === 0x3d /* = */ && startDelim.end !== -1) {
      const endDelim = delimiters[startDelim.end];

      token = state.tokens[startDelim.token];
      token.type = "mark_open";
      token.tag = "mark";
      token.nesting = 1;
      token.markup = "==";
      token.content = "";

      token = state.tokens[endDelim.token];
      token.type = "mark_close";
      token.tag = "mark";
      token.nesting = -1;
      token.markup = "==";
      token.content = "";

      if (
        state.tokens[endDelim.token - 1].type === "text" &&
        state.tokens[endDelim.token - 1].content === "="
      )
        loneMarkers.push(endDelim.token - 1);
    }
  }

  /*
   * If a marker sequence has an odd number of characters, it’s splitted
   * like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
   * start of the sequence.
   *
   * So, we have to move all those markers after subsequent s_close tags.
   *
   */
  while (loneMarkers.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const i = loneMarkers.pop()!;
    let j = i + 1;

    while (j < state.tokens.length && state.tokens[j].type === "mark_close")
      j++;

    j--;

    if (i !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i];
      state.tokens[i] = token;
    }
  }
};

export const mark: PluginSimple = (md) => {
  md.inline.ruler.before("emphasis", "mark", tokenize);
  md.inline.ruler2.before("emphasis", "mark", (state) => {
    postProcess(state, state.delimiters);

    for (const tokenMeta of state.tokens_meta) {
      if (tokenMeta?.delimiters) postProcess(state, tokenMeta.delimiters);
    }

    return true;
  });
};
