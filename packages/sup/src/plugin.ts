/**
 * Forked from https://github.com/markdown-it/markdown-it-sup/blob/master/index.mjs
 */

import { UNESCAPE_RE } from "@mdit/helper";
import type { PluginSimple } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";

const UNESCAPED_SPACES_OR_NEW_LINES_RE = /(^|[^\\])(\\\\)*\s/u;

const superscriptRender: RuleInline = (state, silent) => {
  const max = state.posMax;
  const start = state.pos;

  if (
    state.src.charCodeAt(start) !== 94 /* ^ */ ||
    // don’t run any pairs in validation mode
    silent ||
    start + 2 >= max
  ) {
    return false;
  }

  state.pos = start + 1;

  let found = false;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 94 /* ^ */) {
      found = true;
      break;
    }

    state.md.inline.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;

    return false;
  }

  const content = state.src.slice(start + 1, state.pos);

  // don’t allow unescaped spaces/newlines inside
  if (UNESCAPED_SPACES_OR_NEW_LINES_RE.test(content)) {
    state.pos = start;

    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 1;

  // Earlier we checked !silent, but this implementation does not need it
  const openToken = state.push("sup_open", "sup", 1);

  openToken.markup = "^";

  const textToken = state.push("text", "", 0);

  textToken.content = content.replace(UNESCAPE_RE, "$1");

  const closeToken = state.push("sup_close", "sup", -1);

  closeToken.markup = "^";

  state.pos = state.posMax + 1;
  state.posMax = max;

  return true;
};

export const sup: PluginSimple = (md) => {
  md.inline.ruler.after("emphasis", "sup", superscriptRender);
};
