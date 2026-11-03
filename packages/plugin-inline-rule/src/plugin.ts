import { hasRule, UNESCAPE_RE } from "@mdit/helper";
import type { InlineRule, PluginWithOptions } from "@mdit/helper";
import type { Delimiter, StateInline } from "markdown-it";

import type { InlineRuleAttrs, InlineRuleOptions } from "./options.js";

const UNESCAPED_SPACES_OR_NEW_LINES_RE = /(?:^|[^\\])(?:\\\\)*\s/u;

// Markers owned by markdown-it's built-in delimiter rules (`*`/`_` emphasis, `~` strikethrough).
// Those rules push delimiters of these markers without this plugin's tokenizer running, and
// `postProcess` is expected to still see them (e.g. it overrides `_` emphasis), so delimiter
// arrays are never skipped for them.
const BUILT_IN_DELIMITER_MARKERS: ReadonlySet<number> = new Set([0x2a, 0x5f, 0x7e]);

// Delimiter arrays that received at least one delimiter for a given marker. Keying by marker and
// sharing the set between plugin instances is safe because a delimiter array belongs to a single
// inline parse, and another instance installed with the same marker must keep processing that
// array (its delimiters are indistinguishable), exactly like before the quick check was added.
const MARKER_DELIMITER_ARRAYS = new Map<number, WeakSet<Delimiter[]>>();

// Resolve attrs for a single token. A factory is expected to return a fresh array for every call,
// while a static template array is cloned (both outer array and inner tuples) so that tokens never
// share attribute arrays. markdown-it's `Token#attrJoin` mutates the inner arrays in place (this is
// what `@mdit/plugin-attrs` uses), so sharing them would leak attributes between tokens.
const resolveAttrs = (attrs: InlineRuleAttrs): [string, string][] =>
  typeof attrs === "function"
    ? attrs()
    : attrs.map(([key, value]): [string, string] => [key, value]);

interface LinearRuleConfig {
  markerCode: number;
  tag: string;
  token: string;
  markup: string;
  allowSpace: boolean;
  attrs: InlineRuleAttrs | undefined;
}

const createLinearRule = (config: LinearRuleConfig): InlineRule => {
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
    if (attrs) openToken.attrs = resolveAttrs(attrs);

    const textToken = state.push("text", "", 0);

    // Without a backslash `UNESCAPE_RE` cannot match, so skip the extra string allocation.
    textToken.content = content.includes("\\") ? content.replace(UNESCAPE_RE, "$<char>") : content;

    const closeToken = state.push(`${token}_close`, tag, -1);

    closeToken.markup = markup;

    state.pos = state.posMax + markerLength;
    state.posMax = max;

    return true;
  };
};

const getMarkerDelimiterArrays = (markerCode: number): WeakSet<Delimiter[]> => {
  const markerDelimiterArrays = MARKER_DELIMITER_ARRAYS.get(markerCode);

  if (markerDelimiterArrays) return markerDelimiterArrays;

  const newMarkerDelimiterArrays = new WeakSet<Delimiter[]>();

  MARKER_DELIMITER_ARRAYS.set(markerCode, newMarkerDelimiterArrays);

  return newMarkerDelimiterArrays;
};

const createNestedTokenize =
  (markerCode: number, double: boolean, markerDelimiterArrays: WeakSet<Delimiter[]>): InlineRule =>
  (state, silent): boolean => {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);

    if (silent || marker !== markerCode) return false;

    const scanned = state.scanDelims(state.pos, true);
    const { length } = scanned;

    // A lone marker is left to the text rule in double mode, as before.
    if (double && length < 2) return false;

    // A run that can neither open nor close never produces a delimiter, so all of its characters
    // stay plain text. Emit the whole run as a single text token instead of one token per marker
    // pair: markdown-it's `text_join` core rule merges adjacent text tokens anyway, so the final
    // token stream is unchanged while the per-pair token/delimiter allocation and join are avoided.
    if (!scanned.can_open && !scanned.can_close) {
      state.push("text", "", 0).content = state.src.slice(start, start + length);
      state.pos += length;

      return true;
    }

    const markerChar = String.fromCharCode(marker);

    // Every remaining run contributes at least one delimiter, so its array can be recorded here.
    markerDelimiterArrays.add(state.delimiters);

    if (double) {
      let pairLength = length;

      if (pairLength % 2) {
        state.push("text", "", 0).content = markerChar;
        pairLength--;
      }

      for (let ii = 0; ii < pairLength; ii += 2) {
        state.push("text", "", 0).content = markerChar + markerChar;
        state.delimiters.push({
          marker: markerCode,
          length: 0, // disable "rule of 3" length checks meant for emphasis
          token: state.tokens.length - 1,
          end: -1,
          open: scanned.can_open,
          close: scanned.can_close,
        });
      }
    } else {
      // Single marker: each character is its own delimiter, like markdown-it emphasis
      for (let ii = 0; ii < length; ii++) {
        state.push("text", "", 0).content = markerChar;
        state.delimiters.push({
          marker: markerCode,
          length: 0,
          token: state.tokens.length - 1,
          end: -1,
          open: scanned.can_open,
          close: scanned.can_close,
        });
      }
    }

    state.pos += length;

    return true;
  };

interface NestedPostProcessConfig {
  markerCode: number;
  tag: string;
  token: string;
  markup: string;
  double: boolean;
  attrs: InlineRuleAttrs | undefined;
}

const createNestedPostProcess = (
  config: NestedPostProcessConfig,
): ((state: StateInline, delimiters: Delimiter[]) => void) => {
  const { markerCode, tag, token: tokenType, markup, double, attrs } = config;
  const closeType = `${tokenType}_close`;
  const markerChar = String.fromCharCode(markerCode);

  return (state, delimiters): void => {
    let token;
    const loneMarkers: number[] = [];
    const max = delimiters.length;

    for (let ii = 0; ii < max; ii++) {
      const startDelim = delimiters[ii];

      if (startDelim.marker === markerCode && startDelim.end !== -1) {
        const endDelim = delimiters[startDelim.end];

        token = state.tokens[startDelim.token];
        token.type = `${tokenType}_open`;
        token.tag = tag;
        token.nesting = 1;
        token.markup = markup;
        token.content = "";
        if (attrs) token.attrs = resolveAttrs(attrs);

        token = state.tokens[endDelim.token];
        token.type = closeType;
        token.tag = tag;
        token.nesting = -1;
        token.markup = markup;
        token.content = "";

        // Mark delimiters as consumed so other handlers (e.g., emphasis) won't re-process
        endDelim.end = -1;
        startDelim.end = -1;

        // In double mode, odd-length marker sequences leave lone characters
        // (e.g., `+++` → `+` + `++`). These need to be moved after close tags.
        // In single mode, every character has its own delimiter — no leftovers.
        if (
          double &&
          state.tokens[endDelim.token - 1].type === "text" &&
          state.tokens[endDelim.token - 1].content === markerChar
        )
          loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's split
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    // So, we have to move all those markers after subsequent close tags.
    if (double) {
      while (loneMarkers.length > 0) {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const ii = loneMarkers.pop()!;
        let jj = ii + 1;

        while (jj < state.tokens.length && state.tokens[jj].type === closeType) jj++;

        jj--;

        token = state.tokens[jj];
        state.tokens[jj] = state.tokens[ii];
        state.tokens[ii] = token;
      }
    }
  };
};

const createRuler2Handler = (
  postProcess: (state: StateInline, delimiters: Delimiter[]) => void,
  markerDelimiterArrays: WeakSet<Delimiter[]>,
  markerCode: number,
): ((state: StateInline) => void) => {
  // Delimiters of a built-in marker may be pushed by markdown-it itself, so those arrays must
  // always be processed. For any other marker only arrays this plugin pushed a delimiter into
  // can contain one; skipping the rest avoids scanning arrays that belong to other markers.
  const checkDelimiterArrays = !BUILT_IN_DELIMITER_MARKERS.has(markerCode);
  const shouldProcess = (delimiters: Delimiter[]): boolean =>
    !checkDelimiterArrays || markerDelimiterArrays.has(delimiters);

  return (state): void => {
    if (shouldProcess(state.delimiters)) postProcess(state, state.delimiters);

    const tokensMeta = state.tokens_meta;
    const tokensMetaLength = tokensMeta.length;

    for (let ii = 0; ii < tokensMetaLength; ii++) {
      const tokenMeta = tokensMeta[ii];
      const { delimiters } = tokenMeta ?? {};

      if (delimiters && shouldProcess(delimiters)) postProcess(state, delimiters);
    }
  };
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

  if (marker.length !== 1)
    throw new Error("Invalid marker for inlineRule plugin: 'marker' must be a single character.");

  const double = options.double ?? false;
  const allowSpace = nested ? false : (options.allowSpace ?? false);

  const markerCode = marker.charCodeAt(0);
  const markup = double ? marker + marker : marker;
  const ruleName = `${token}_${marker}`;
  const isBefore = placement === "before-emphasis";

  // Repeated installation of the same configuration must not register the rule twice.
  if (!hasRule(md, ruleName, "inline")) {
    if (nested) {
      // Arrays that received at least one delimiter for this marker, so the ruler2 handler can
      // skip the delimiter arrays of other markers without scanning them.
      const markerDelimiterArrays = getMarkerDelimiterArrays(markerCode);
      const tokenize = createNestedTokenize(markerCode, double, markerDelimiterArrays);
      const postProcess = createNestedPostProcess({
        markerCode,
        tag,
        token,
        markup,
        double,
        attrs,
      });
      const ruler2Handler = createRuler2Handler(postProcess, markerDelimiterArrays, markerCode);

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

      if (isBefore) md.inline.ruler.before("emphasis", ruleName, rule);
      else md.inline.ruler.after("emphasis", ruleName, rule);
    }
  }
};
