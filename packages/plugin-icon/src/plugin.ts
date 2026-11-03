import { escapeHtml, hasRule } from "@mdit/helper";
import type { InlineRule, PluginWithOptions } from "@mdit/helper";

import type { MarkdownItIconOptions } from "./options.js";

const AMPERSAND = 0x26; /* & */
const BACKSLASH = 0x5c; /* \ */
const BACKTICK = 0x60; /* ` */
const BANG = 0x21; /* ! */
const COLON = 0x3a; /* : */
const LESS_THAN = 0x3c; /* < */
const NEWLINE = 0x0a; /* \n */
const OPEN_BRACKET = 0x5b; /* [ */
const SPACE = 0x20;

/**
 * Check whether a character can start a token skipped by `skipToken`.
 *
 * Only the inline rules that also run in silent mode can consume input here: backtick code spans,
 * autolinks and inline HTML, link labels, images, entities and escapes. Any other character is
 * scanned one by one, since no silent rule can hide a `::` or a line break behind it.
 *
 * @param charCode Character code / 字符编码
 * @returns Whether the character can start a nested token / 该字符是否可以开始一个嵌套 token
 */
const canStartToken = (charCode: number): boolean =>
  charCode === BACKTICK ||
  charCode === LESS_THAN ||
  charCode === OPEN_BRACKET ||
  charCode === BANG ||
  charCode === AMPERSAND ||
  charCode === BACKSLASH;

const iconRule: InlineRule = (state, silent) => {
  let found = false;
  let mayHaveNewline = false;
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

  // With `linkify` enabled the reference implementation lets the linkify rule consume URL-ish
  // content while scanning, which changes some contrived inputs. Keep the legacy scan for those
  // candidates only: icon class names containing `://` are not realistic, so the fast path stays
  // the default.
  let legacyScan = false;

  if (state.md.options.linkify) {
    for (let index = start + 2; index < max; index++) {
      const code = state.src.charCodeAt(index);

      if (code === NEWLINE) break;

      if (code === COLON && state.src.charCodeAt(index + 1) === COLON) break;
      if (
        code === COLON &&
        state.src.charCodeAt(index + 1) === 0x2f /* / */ &&
        state.src.charCodeAt(index + 2) === 0x2f /* / */
      ) {
        legacyScan = true;
        break;
      }
    }
  }

  state.pos = start + 2;

  while (state.pos < max) {
    const code = state.src.charCodeAt(state.pos);

    // ::xxx::
    //      ^^
    if (code === COLON && state.src.charCodeAt(state.pos + 1) === COLON) {
      found = true;
      break;
    }

    // icon content must stay on a single line
    if (code === NEWLINE) break;

    if (legacyScan) {
      const pos = state.pos;

      state.md.inline.skipToken(state);

      if (state.pos - pos > 1) mayHaveNewline = true;
    } else if (canStartToken(code)) {
      const pos = state.pos;

      state.md.inline.skipToken(state);

      // only a token spanning more than one character (e.g. a multi-line code span) can hide a
      // line break from the checks above
      if (state.pos - pos > 1) mayHaveNewline = true;
    } else {
      state.pos++;
    }
  }

  if (!found) {
    state.pos = start;

    return false;
  }

  if (
    // ::xxx ::
    //      ^
    state.src.charCodeAt(state.pos - 1) === SPACE
  ) {
    state.pos = start;

    return false;
  }

  // a nested token (e.g. a multi-line code span) can hide a line break from the loop above.
  // Only the matched span needs to be checked, and only when a skipped token spanned more than
  // one character, so the scan stays away from the common single-line icon path.
  if (mayHaveNewline) {
    for (let index = start + 2; index < state.pos; index++) {
      if (state.src.charCodeAt(index) === NEWLINE) {
        state.pos = start;

        return false;
      }
    }
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
  { render = (content: string): string => `<i class="${escapeHtml(content)}"></i>` } = {},
) => {
  // Repeated installation of the same configuration must not register the rule twice.
  if (!hasRule(md, "icon", "inline")) md.inline.ruler.before("link", "icon", iconRule);

  md.renderer.rules.icon = (tokens, idx, _, env): string => render(tokens[idx].content, env);
};
