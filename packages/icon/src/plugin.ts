/**
 * ::icon-name:: ::icon-name fa-fw sm::
 * ::icon-name =24px:: ::icon-name =24pxx24px:: ::icon-name =x24px:: ::icon-name =24pxx::
 *
 * ::icon-name #000:: ::icon-name rgb(0,0,0):: ::icon-name hsl(30deg 82% 43%);::
 * ::icon-name var(--color)::
 */
import type { PluginWithOptions } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
// import type { Delimiter } from "markdown-it/lib/rules_inline/state_inline.mjs";
// import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";

import type { MarkdownItIconOptions } from "./options.js";

const iconRule: RuleInline = (state, silent) => {
  let found = false;
  const max = state.posMax;
  const start = state.pos;

  // console.log(state);

  // ::xxx
  // ^^
  if (
    state.src.charCodeAt(start) !== 0x3a ||
    state.src.charCodeAt(start + 1) !== 0x3a
  )
    return false;

  const next = state.src.charCodeAt(start + 2);

  // :: xxx  |  :::xxx
  //   ^     |    ^
  if (next === 0x20 || next === 0x3a) return false;

  if (silent) return false;

  // ::::
  if (max - start < 5) return false;

  state.pos = start + 2;

  while (state.pos < max) {
    // ::xxx::
    //      ^^
    if (
      state.src.charCodeAt(state.pos) === 0x3a &&
      state.src.charCodeAt(state.pos + 1) === 0x3a
    ) {
      found = true;
      break;
    }

    state.md.inline.skipToken(state);
  }

  if (
    !found ||
    start + 2 === state.pos ||
    // ::xxx ::
    //      ^
    state.src.charCodeAt(state.pos - 1) === 0x20
  ) {
    state.pos = start;

    return false;
  }

  const info = state.src.slice(start + 2, state.pos);

  // found
  state.posMax = state.pos;
  state.pos = start + 2;

  const icon = state.push("icon", "i", 0);

  icon.markup = "::";
  icon.content = info;

  state.pos = state.posMax + 2;
  state.posMax = max;

  return true;
};

// /*
//  * Walk through delimiter list and replace text tokens with tags
//  *
//  */
// const postProcess = (state: StateInline, delimiters: Delimiter[]): void => {
//   let token;
//   // const loneMarkers = [];
//   const max = delimiters.length;

//   for (let i = 0; i < max; i++) {
//     const startDelim = delimiters[i];

//     if (startDelim.marker === 0x3a /* : */ && startDelim.end !== -1) {
//       const endDelim = delimiters[startDelim.end];

//       token = state.tokens[startDelim.token];
//       token.type = "icon_open";
//       token.tag = "icon";
//       token.nesting = 1;
//       token.markup = "::";
//       token.content = "";

//       token = state.tokens[endDelim.token];
//       token.type = "icon_close";
//       token.tag = "icon";
//       token.nesting = -1;
//       token.markup = "::";
//       token.content = "";

// if (
//   state.tokens[endDelim.token - 1].type === "text" &&
//   state.tokens[endDelim.token - 1].content === ":"
// )
//   loneMarkers.push(endDelim.token - 1);
//   }
// }

// /*
//  * If a marker sequence has an odd number of characters, it’s splitted
//  * like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
//  * start of the sequence.
//  *
//  * So, we have to move all those markers after subsequent s_close tags.
//  *
//  */
// while (loneMarkers.length) {
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   const i = loneMarkers.pop()!;
//   let j = i + 1;

//   while (j < state.tokens.length && state.tokens[j].type === "icon_close")
//     j++;

//   j--;

//   if (i !== j) {
//     token = state.tokens[j];
//     state.tokens[j] = state.tokens[i];
//     state.tokens[i] = token;
//   }
// }
// };

export const icon: PluginWithOptions<MarkdownItIconOptions> = (
  md,
  { render = (content: string): string => `<i class="${content}"></i>` } = {},
) => {
  md.inline.ruler.before("link", "icon", iconRule);
  // console.log(md.inline.ruler);
  // md.inline.ruler.after("emphasis", "icon", iconRule);
  // md.inline.ruler2.before("fragments_join", "icon", (state) => {
  //   postProcess(state, state.delimiters);

  //   console.log(state.tokens_meta);

  //   for (const tokenMeta of state.tokens_meta) {
  //     if (tokenMeta?.delimiters) postProcess(state, tokenMeta.delimiters);
  //   }

  //   return true;
  // });
  // console.log(md.inline.ruler2);

  md.renderer.rules.icon = (tokens, idx, _, env): string =>
    render(tokens[idx].content, env);
};
