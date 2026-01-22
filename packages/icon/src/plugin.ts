import type { PluginWithOptions } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";

import type { MarkdownItIconOptions } from "./options.js";

const iconRule: RuleInline = (state, silent) => {
  let found = false;
  const max = state.posMax;
  const start = state.pos;

  // ::xxx
  // ^^
  if (state.src.charCodeAt(start) !== 0x3a || state.src.charCodeAt(start + 1) !== 0x3a)
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
    if (state.src.charCodeAt(state.pos) === 0x3a && state.src.charCodeAt(state.pos + 1) === 0x3a) {
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

export const icon: PluginWithOptions<MarkdownItIconOptions> = (
  md,
  { render = (content: string): string => `<i class="${content}"></i>` } = {},
) => {
  md.inline.ruler.before("link", "icon", iconRule);
  md.renderer.rules.icon = (tokens, idx, _, env): string => render(tokens[idx].content, env);
};
