/** Forked from https://github.com/waylonflinn/markdown-it-katex/blob/master/index.js */

import type { BlockRule, InlineRule, PluginWithOptions } from "@mdit/helper";
import type { StateBlock, StateInline } from "markdown-it";

import type { MarkdownItTexOptions } from "./options.js";

const BLOCK_MARKER = String.raw`\[`;
const INLINE_MARKER = String.raw`\(`;

/*
 * Count preceding backslashes from a position
 */
const countPrecedingBackslashes = (src: string, pos: number, minPos = 0): number => {
  let count = 0;
  let checkPos = pos - 1;

  while (checkPos >= minPos && src.charCodeAt(checkPos) === 92 /* \ */) {
    count++;
    checkPos--;
  }

  return count;
};

/*
 * Test if a character code is a word character or number
 * Equivalent to regex \w which matches [a-zA-Z0-9_]
 */
const isWordCharacterOrNumber = (code: number): boolean =>
  (code >= 48 && code <= 57) || // 0-9
  (code >= 65 && code <= 90) || // A-Z
  (code >= 97 && code <= 122) || // a-z
  code === 95; // _

/*
 * Test if this position is a valid opening $ delimiter
 * Checks word boundary for opening: prevChar must be whitespace,
 * start-of-line, or non-word/non-number. Prevents `a$x$b` from parsing.
 */
const isDollarOpen = (state: StateInline, pos: number, allowInlineWithSpace: boolean): boolean => {
  const prevCharCode = state.src.charCodeAt(pos - 1);
  const nextCharCode = state.src.charCodeAt(pos + 1);
  const isSpace = state.md.utils.isSpace;

  return (
    prevCharCode !== 36 /* $ */ &&
    (pos === 0 || isSpace(prevCharCode) || !isWordCharacterOrNumber(prevCharCode)) &&
    (allowInlineWithSpace || !isSpace(nextCharCode))
  );
};

/*
 * Test if this position is a valid closing $ delimiter
 * Checks word boundary for closing: nextChar must be whitespace,
 * end-of-line, or non-word/non-number. Prevents `$x$a` from parsing.
 */
const isDollarClose = (state: StateInline, pos: number, allowInlineWithSpace: boolean): boolean => {
  const prevCharCode = state.src.charCodeAt(pos - 1);
  const nextCharCode = state.src.charCodeAt(pos + 1);
  const isSpace = state.md.utils.isSpace;

  return (
    nextCharCode !== 36 /* $ */ &&
    (nextCharCode == null || isSpace(nextCharCode) || !isWordCharacterOrNumber(nextCharCode)) &&
    (allowInlineWithSpace || !isSpace(prevCharCode))
  );
};

/*
 * Parse inline math with dollar signs: $...$
 */
const createDollarInlineTexRule =
  (allowInlineWithSpace: boolean): InlineRule =>
  (state, silent) => {
    if (state.src[state.pos] !== "$") return false;

    if (!isDollarOpen(state, state.pos, allowInlineWithSpace)) {
      if (!silent) state.pending += "$";

      state.pos++;

      return true;
    }

    /*
     * First check for and bypass all properly escaped delimiters
     * This loop will assume that the first leading backtick can not
     * be the first character in state.src, which is known since
     * we have found an opening delimiter already.
     */
    let match = state.pos + 1;
    let pos: number;

    while ((match = state.src.indexOf("$", match)) !== -1) {
      /*
       * Found potential $, look for escapes, pos will point to
       * first non escape when complete
       */
      pos = match - 1;
      while (state.src.charCodeAt(pos) === 92 /* \ */) pos--;

      // Even number of escapes, potential closing delimiter found
      if ((match - pos) % 2 === 1) break;

      match++;
    }

    // No closing delimiter found.  Consume $ and continue.
    if (match === -1) {
      if (!silent) state.pending += "$";

      state.pos += 1;

      return true;
    }

    // Check if we have empty content, ie: $$.  Do not parse.
    if (match - (state.pos + 1) === 0) {
      if (!silent) state.pending += "$$";

      state.pos += 2;

      return true;
    }

    // Check for valid closing delimiter
    if (!isDollarClose(state, match, allowInlineWithSpace)) {
      if (!silent) state.pending += "$";

      state.pos += 1;

      return true;
    }

    if (!silent) {
      const token = state.push("math_inline", "math", 0);

      token.markup = "$";
      token.content = state.src.slice(state.pos + 1, match);
    }

    state.pos = match + 1;

    return true;
  };

/*
 * Parse inline math with bracket syntax: \(...\)
 */
const createBracketInlineTexRule = (): InlineRule => (state, silent) => {
  const start = state.pos;

  // Check for opening \(
  if (state.src.charCodeAt(start) !== 92 /* \ */ || state.src.charCodeAt(start + 1) !== 40 /* ( */)
    return false;

  // Look for closing \)
  let pos = start + 2;
  let found = false;
  const srcLength = state.src.length;

  while (pos < srcLength - 1) {
    if (state.src.charCodeAt(pos) === 92 /* \ */ && state.src.charCodeAt(pos + 1) === 41 /* ) */) {
      // Check if the opening \( was escaped
      const openingBackslashes = countPrecedingBackslashes(state.src, start);

      // If opening \( is escaped (odd number of preceding backslashes), don't parse
      if (openingBackslashes % 2 === 1) return false;

      // Check if the closing \) is escaped
      const closingBackslashes = countPrecedingBackslashes(state.src, pos, start + 2);

      // If closing \) is not escaped (even number of preceding backslashes), we found it
      if (closingBackslashes % 2 === 0) {
        found = true;
        break;
      }
    }
    pos++;
  }

  if (!found) return false;

  if (!silent) {
    const token = state.push("math_inline", "math", 0);

    token.markup = INLINE_MARKER;
    token.content = state.src.slice(start + 2, pos);
  }

  state.pos = pos + 2;

  return true;
};

// Like state.skipSpacesBack, but skips markdown-it's Unicode whitespace set (e.g. NBSP)
const skipWhitespaceBack = (state: StateBlock, max: number, min: number): number => {
  const isWhiteSpace = state.md.utils.isWhiteSpace;
  let pos = max;

  while (pos > min && isWhiteSpace(state.src.charCodeAt(pos - 1))) pos--;

  return pos;
};

/*
 * Parse block math with dollar signs: $$...$$
 */
const dollarBlockTexRule: BlockRule = (state, startLine, endLine, silent) => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  let end = state.eMarks[startLine];

  if (state.src.charCodeAt(start) !== 36 /* $ */ || state.src.charCodeAt(start + 1) !== 36 /* $ */)
    return false;

  if (silent) return true;

  let contentEnd = skipWhitespaceBack(state, end, start);
  let pos = start + 2;
  let firstLine: string;
  let found = false;

  if (
    contentEnd - pos >= 2 &&
    state.src.charCodeAt(contentEnd - 1) === 36 /* $ */ &&
    state.src.charCodeAt(contentEnd - 2) === 36 /* $ */
  ) {
    // Single line expression
    firstLine = state.src.slice(pos, contentEnd - 2);
    found = true;
  } else {
    firstLine = state.src.slice(pos, end);
  }

  let current = startLine;
  let lastLine = "";

  while (!found) {
    current++;
    if (current >= endLine) break;

    pos = state.bMarks[current] + state.tShift[current];
    end = state.eMarks[current];

    // non-empty line with negative indent should stop the list:
    if (pos < end && state.tShift[current] < state.blkIndent) break;

    // found end marker
    contentEnd = skipWhitespaceBack(state, end, pos);

    if (
      contentEnd - pos >= 2 &&
      state.src.charCodeAt(contentEnd - 1) === 36 /* $ */ &&
      state.src.charCodeAt(contentEnd - 2) === 36 /* $ */
    ) {
      lastLine = state.src.slice(pos, contentEnd - 2);
      found = true;
    }
  }

  state.line = found ? current + 1 : current;

  const token = state.push("math_block", "math", 0);

  token.block = true;
  token.content =
    (firstLine ? `${firstLine}\n` : "") +
    state.getLines(startLine + 1, current, state.tShift[startLine], true) +
    (lastLine ? `${lastLine}\n` : "");
  token.map = [startLine, state.line];
  token.markup = "$$";

  return true;
};

/*
 * Parse block math with bracket syntax: \[...\]
 */
const bracketBlockTexRule: BlockRule = (state, startLine, endLine, silent) => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  let end = state.eMarks[startLine];

  if (state.src.charCodeAt(start) !== 92 /* \ */ || state.src.charCodeAt(start + 1) !== 91 /* [ */)
    return false;

  if (silent) return true;

  let contentEnd = skipWhitespaceBack(state, end, start);
  let pos = start + 2;
  let firstLine: string;
  let found = false;

  if (
    contentEnd - pos >= 2 &&
    state.src.charCodeAt(contentEnd - 1) === 93 /* ] */ &&
    state.src.charCodeAt(contentEnd - 2) === 92 /* \ */
  ) {
    // Single line expression
    firstLine = state.src.slice(pos, contentEnd - 2);
    found = true;
  } else {
    firstLine = state.src.slice(pos, end);
  }

  let current = startLine;
  let lastLine = "";

  while (!found) {
    current++;
    if (current >= endLine) break;

    pos = state.bMarks[current] + state.tShift[current];
    end = state.eMarks[current];

    // non-empty line with negative indent should stop the list:
    if (pos < end && state.tShift[current] < state.blkIndent) break;

    // found end marker
    contentEnd = skipWhitespaceBack(state, end, pos);

    if (
      contentEnd - pos >= 2 &&
      state.src.charCodeAt(contentEnd - 1) === 93 /* ] */ &&
      state.src.charCodeAt(contentEnd - 2) === 92 /* \ */
    ) {
      lastLine = state.src.slice(pos, contentEnd - 2).trimEnd();
      found = true;
    }
  }

  if (!found) return false;

  state.line = current + 1;

  const token = state.push("math_block", "math", 0);

  token.block = true;
  token.content =
    (firstLine ? `${firstLine}\n` : "") +
    state.getLines(startLine + 1, current, state.tShift[startLine], true) +
    (lastLine ? `${lastLine}\n` : "");
  token.map = [startLine, state.line];
  token.markup = BLOCK_MARKER;

  return true;
};

const ruleOptions = {
  alt: ["paragraph", "reference", "blockquote", "list"],
};

export const tex: PluginWithOptions<MarkdownItTexOptions> = (md, options) => {
  if (typeof options?.render !== "function")
    throw new TypeError('[@mdit/plugin-tex]: "render" option should be a function');

  const {
    allowInlineWithSpace = false,
    mathFence = false,
    delimiters = "dollars",
    render,
  } = options;

  // Handle ```math blocks
  if (mathFence) {
    const fence = md.renderer.rules.fence;

    md.renderer.rules.fence = (tokens, index, mdItOptions, env, self): string => {
      const token = tokens[index];

      if (token.info.trim() === "math")
        // oxlint-disable-next-line typescript/no-non-null-assertion
        return render(token.content, true, env!);

      return fence(tokens, index, mdItOptions, env, self);
    };
  }

  // Register inline and block rules based on delimiters option
  if (delimiters === "dollars" || delimiters === "all") {
    md.inline.ruler.after(
      "escape",
      "math_inline_dollar",
      createDollarInlineTexRule(allowInlineWithSpace),
    );
    md.block.ruler.after("blockquote", "math_block_dollar", dollarBlockTexRule, ruleOptions);
  }

  if (delimiters === "brackets" || delimiters === "all") {
    md.inline.ruler.before("escape", "math_inline_bracket", createBracketInlineTexRule());
    md.block.ruler.after("blockquote", "math_block_bracket", bracketBlockTexRule, ruleOptions);
  }

  md.renderer.rules.math_inline = (tokens, index, _options, env): string =>
    // oxlint-disable-next-line typescript/no-non-null-assertion
    render(tokens[index].content, false, env!);
  md.renderer.rules.math_block = (tokens, index, _options, env): string =>
    // oxlint-disable-next-line typescript/no-non-null-assertion
    render(tokens[index].content, true, env!);
};
