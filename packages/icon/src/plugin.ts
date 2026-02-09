import type { PluginWithOptions } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";

import type { MarkdownItIconOptions } from "./options.js";

const COLON = 0x3a /* : */;
const SPACE = 0x20;

const iconRule: RuleInline = (state, silent) => {
  let found = false;
  const max = state.posMax;
  const start = state.pos;

  // ::xxx
  // ^^
  if (state.src.charCodeAt(start) !== COLON || state.src.charCodeAt(start + 1) !== COLON)
    return false;

  const next = state.src.charCodeAt(start + 2);

  // :: xxx  |  :::xxx
  //   ^     |    ^
  if (next === SPACE || next === COLON) return false;

  // ::::
  if (max - start < 5) return false;

  state.pos = start + 2;

  while (state.pos < max) {
    // ::xxx::
    //      ^^
    if (
      state.src.charCodeAt(state.pos) === COLON &&
      state.src.charCodeAt(state.pos + 1) === COLON
    ) {
      found = true;
      break;
    }

    state.md.inline.skipToken(state);
  }

  if (
    !found ||
    // ::xxx ::
    //      ^
    state.src.charCodeAt(state.pos - 1) === SPACE
  ) {
    state.pos = start;

    return false;
  }

  if (silent) {
    state.pos += 2;

    return true;
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
