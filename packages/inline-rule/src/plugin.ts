import { UNESCAPE_RE } from "@mdit/helper";
import type { PluginWithOptions } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";
import type { Delimiter } from "markdown-it/lib/rules_inline/state_inline.mjs";

import type { InlineRuleOptions } from "./options.js";

const UNESCAPED_SPACES_OR_NEW_LINES_RE = /(^|[^\\])(\\\\)*\s/u;

interface LinearRuleConfig {
  markerCode: number;
  tag: string;
  token: string;
  markup: string;
  allowSpace: boolean;
  attrs: [string, string][] | undefined;
}

const createLinearRule = (config: LinearRuleConfig): RuleInline => {
  const { markerCode, tag, token, markup, allowSpace, attrs } = config;
  const markerLength = markup.length;

  return (state, silent): boolean => {
    const max = state.posMax;
    const start = state.pos;

    if (state.src.charCodeAt(start) !== markerCode || silent || start + 2 * markerLength >= max)
      return false;

    // For double markers, check second char matches
    if (markerLength === 2 && state.src.charCodeAt(start + 1) !== markerCode) return false;

    state.pos = start + markerLength;

    let found = false;

    while (state.pos <= max - markerLength) {
      if (
        state.src.charCodeAt(state.pos) === markerCode &&
        (markerLength === 1 || state.src.charCodeAt(state.pos + 1) === markerCode)
      ) {
        found = true;
        break;
      }

      state.md.inline.skipToken(state);
    }

    if (!found || start + markerLength === state.pos) {
      state.pos = start;

      return false;
    }

    const content = state.src.slice(start + markerLength, state.pos);

    // Don't allow unescaped spaces/newlines inside if not allowed
    if (!allowSpace && UNESCAPED_SPACES_OR_NEW_LINES_RE.test(content)) {
      state.pos = start;

      return false;
    }

    // found!
    state.posMax = state.pos;
    state.pos = start + markerLength;

    const openToken = state.push(`${token}_open`, tag, 1);

    openToken.markup = markup;
    if (attrs) openToken.attrs = attrs;

    const textToken = state.push("text", "", 0);

    textToken.content = content.replace(UNESCAPE_RE, "$1");

    const closeToken = state.push(`${token}_close`, tag, -1);

    closeToken.markup = markup;

    state.pos = state.posMax + markerLength;
    state.posMax = max;

    return true;
  };
};

const createNestedTokenize =
  (markerCode: number): RuleInline =>
  (state, silent): boolean => {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);

    if (silent || marker !== markerCode) return false;

    const scanned = state.scanDelims(state.pos, true);
    let { length } = scanned;

    if (length < 2) return false;

    const markerChar = String.fromCharCode(marker);

    if (length % 2) {
      const textToken = state.push("text", "", 0);

      textToken.content = markerChar;
      length--;
    }

    for (let ii = 0; ii < length; ii += 2) {
      const textToken = state.push("text", "", 0);

      textToken.content = markerChar + markerChar;

      if (scanned.can_open || scanned.can_close) {
        state.delimiters.push({
          marker: markerCode,
          length: 0, // disable "rule of 3" length checks meant for emphasis
          token: state.tokens.length - 1,
          end: -1,
          open: scanned.can_open,
          close: scanned.can_close,
        });
      }
    }

    state.pos += scanned.length;

    return true;
  };

interface NestedPostProcessConfig {
  markerCode: number;
  tag: string;
  token: string;
  markup: string;
  attrs: [string, string][] | undefined;
}

const createNestedPostProcess = (
  config: NestedPostProcessConfig,
): ((state: StateInline, delimiters: Delimiter[]) => void) => {
  const { markerCode, tag, token, markup, attrs } = config;
  const closeType = `${token}_close`;

  return (state, delimiters): void => {
    let tk;
    const loneMarkers: number[] = [];
    const max = delimiters.length;

    for (let ii = 0; ii < max; ii++) {
      const startDelim = delimiters[ii];

      if (startDelim.marker === markerCode && startDelim.end !== -1) {
        const endDelim = delimiters[startDelim.end];

        tk = state.tokens[startDelim.token];
        tk.type = `${token}_open`;
        tk.tag = tag;
        tk.nesting = 1;
        tk.markup = markup;
        tk.content = "";
        if (attrs) tk.attrs = attrs;

        tk = state.tokens[endDelim.token];
        tk.type = closeType;
        tk.tag = tag;
        tk.nesting = -1;
        tk.markup = markup;
        tk.content = "";

        // Mark delimiters as consumed so other handlers (e.g., emphasis) won't re-process
        endDelim.end = -1;
        startDelim.end = -1;

        if (
          state.tokens[endDelim.token - 1].type === "text" &&
          state.tokens[endDelim.token - 1].content === String.fromCharCode(markerCode)
        )
          loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's split
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    // So, we have to move all those markers after subsequent close tags.
    while (loneMarkers.length > 0) {
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const ii = loneMarkers.pop()!;
      let jj = ii + 1;

      while (jj < state.tokens.length && state.tokens[jj].type === closeType) jj++;

      jj--;

      tk = state.tokens[jj];
      state.tokens[jj] = state.tokens[ii];
      state.tokens[ii] = tk;
    }
  };
};

const createRuler2Handler =
  (
    postProcess: (state: StateInline, delimiters: Delimiter[]) => void,
  ): ((state: StateInline) => boolean) =>
  (state): boolean => {
    postProcess(state, state.delimiters);

    const tokensMeta = state.tokens_meta;
    const tokensMetaLength = tokensMeta.length;

    for (let ii = 0; ii < tokensMetaLength; ii++) {
      const tokenMeta = tokensMeta[ii];

      // oxlint-disable-next-line typescript/strict-boolean-expressions
      if (tokenMeta?.delimiters.length) postProcess(state, tokenMeta.delimiters);
    }

    return true;
  };

export const inlineRule: PluginWithOptions<InlineRuleOptions> = (md, options) => {
  if (
    !options ||
    typeof options.marker !== "string" ||
    typeof options.token !== "string" ||
    typeof options.tag !== "string"
  ) {
    throw new Error(
      "Invalid options for inlineRule plugin: 'marker', 'token', and 'tag' are required string properties.",
    );
  }

  const { marker, tag, token, attrs, nested = false, placement = "after-emphasis" } = options;

  const double = nested ? true : (options?.double ?? false);
  const allowSpace = nested ? false : ((options as { allowSpace?: boolean })?.allowSpace ?? false);

  const markerCode = marker.charCodeAt(0);
  const markup = double ? marker + marker : marker;
  const ruleName = `${token}_${marker}`;
  const isBefore = placement === "before-emphasis";

  if (nested) {
    const tokenize = createNestedTokenize(markerCode);
    const postProcess = createNestedPostProcess({
      markerCode,
      tag,
      token,
      markup,
      attrs,
    });
    const ruler2Handler = createRuler2Handler(postProcess);

    if (isBefore) {
      md.inline.ruler.before("emphasis", ruleName, tokenize);
      md.inline.ruler2.before("emphasis", ruleName, ruler2Handler);
    } else {
      md.inline.ruler.after("emphasis", ruleName, tokenize);
      md.inline.ruler2.after("emphasis", ruleName, ruler2Handler);
    }
  } else {
    const rule = createLinearRule({
      markerCode,
      tag,
      token,
      markup,
      allowSpace,
      attrs,
    });

    if (isBefore) {
      md.inline.ruler.before("emphasis", ruleName, rule);
    } else {
      md.inline.ruler.after("emphasis", ruleName, rule);
    }
  }
};
