/**
 * Forked from https://github.com/waylonflinn/markdown-it-katex/blob/master/index.js
 */

import type { PluginWithOptions } from "markdown-it";
import { isSpace } from "markdown-it/lib/common/utils.mjs";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";

import type { MarkdownItTexOptions } from "./options.js";

/*
 * Count preceding backslashes from a position
 */
const countPrecedingBackslashes = (
  src: string,
  pos: number,
  minPos = 0,
): number => {
  let count = 0;
  let checkPos = pos - 1;

  while (checkPos >= minPos && src.charCodeAt(checkPos) === 92 /* \ */) {
    count++;
    checkPos--;
  }

  return count;
};

/*
 * Test if potential opening or closing delimiter for dollar syntax
 * Assumes that there is a "$" at state.src[pos]
 */
const isValidDollarDelim = (
  state: StateInline,
  pos: number,
  allowInlineWithSpace: boolean,
): { canOpen: boolean; canClose: boolean } => {
  const prevCharCode = state.src.charCodeAt(pos - 1);
  const nextCharCode = state.src.charCodeAt(pos + 1);

  return {
    canOpen: allowInlineWithSpace || !isSpace(nextCharCode),

    /*
     * Check non-whitespace conditions for opening and closing, and
     * check that closing delimiter isn't followed by a number
     */
    canClose:
      !((nextCharCode >= 48 /* 0 */ && nextCharCode <= 57) /* 9 */) &&
      (allowInlineWithSpace || !isSpace(prevCharCode)),
  };
};

/*
 * Parse inline math with dollar signs: $...$
 */
const getDollarInlineTex =
  (allowInlineWithSpace: boolean): RuleInline =>
  (state, silent) => {
    if (state.src[state.pos] !== "$") return false;

    let delimState = isValidDollarDelim(state, state.pos, allowInlineWithSpace);

    if (!delimState.canOpen) {
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
    const start = state.pos + 1;

    let match = start;
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

      state.pos = start;

      return true;
    }

    // Check if we have empty content, ie: $$.  Do not parse.
    if (match - start === 0) {
      if (!silent) state.pending += "$$";

      state.pos = start + 1;

      return true;
    }

    // Check for valid closing delimiter
    delimState = isValidDollarDelim(state, match, allowInlineWithSpace);

    if (!delimState.canClose) {
      if (!silent) state.pending += "$";

      state.pos = start;

      return true;
    }

    if (!silent) {
      const token = state.push("math_inline", "math", 0);

      token.markup = "$";
      token.content = state.src.substring(start, match);
    }

    state.pos = match + 1;

    return true;
  };

/*
 * Parse inline math with bracket syntax: \(...\)
 */
const getBracketInlineTex = (): RuleInline => (state, silent) => {
  const start = state.pos;

  // Check for opening \(
  if (
    state.src.charCodeAt(start) !== 92 /* \ */ ||
    state.src.charCodeAt(start + 1) !== 40 /* ( */
  )
    return false;

  // Look for closing \)
  let pos = start + 2;
  let found = false;
  const srcLength = state.src.length;

  while (pos < srcLength - 1) {
    if (
      state.src.charCodeAt(pos) === 92 /* \ */ &&
      state.src.charCodeAt(pos + 1) === 41 /* ) */
    ) {
      // Check if the opening \( was escaped
      const openingBackslashes = countPrecedingBackslashes(state.src, start);

      // If opening \( is escaped (odd number of preceding backslashes), don't parse
      if (openingBackslashes % 2 === 1) return false;

      // Check if the closing \) is escaped
      const closingBackslashes = countPrecedingBackslashes(
        state.src,
        pos,
        start + 2,
      );

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

    token.markup = "\\(";
    token.content = state.src.substring(start + 2, pos);
  }

  state.pos = pos + 2;

  return true;
};

/*
 * Parse block math with dollar signs: $$...$$
 */
const dollarBlockTex: RuleBlock = (state, startLine, endLine, silent) => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  let end = state.eMarks[startLine];

  if (start + 2 > end) return false;

  if (
    state.src.charCodeAt(start) !== 36 /* $ */ ||
    state.src.charCodeAt(start + 1) !== 36 /* $ */
  )
    return false;

  if (silent) return true;

  let contentEnd = state.skipSpacesBack(end, start);
  let pos = start + 2;
  let firstLine: string;
  let found = false;

  if (
    contentEnd - pos >= 2 &&
    state.src.charCodeAt(contentEnd - 1) === 36 /* $ */ &&
    state.src.charCodeAt(contentEnd - 2) === 36 /* $ */
  ) {
    // Single line expression
    firstLine = state.src.substring(pos, contentEnd - 2);
    found = true;
  } else {
    firstLine = state.src.substring(pos, end);
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
    contentEnd = state.skipSpacesBack(end, pos);

    if (
      contentEnd - pos >= 2 &&
      state.src.charCodeAt(contentEnd - 1) === 36 /* $ */ &&
      state.src.charCodeAt(contentEnd - 2) === 36 /* $ */
    ) {
      lastLine = state.src.substring(pos, contentEnd - 2);
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
const getBracketBlockTex =
  (): RuleBlock => (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    let end = state.eMarks[startLine];

    if (start + 2 > end) return false;

    if (
      state.src.charCodeAt(start) !== 92 /* \ */ ||
      state.src.charCodeAt(start + 1) !== 91 /* [ */
    )
      return false;

    if (silent) return true;

    let contentEnd = state.skipSpacesBack(end, start);
    let pos = start + 2;
    let firstLine: string;
    let found = false;

    if (
      contentEnd - pos >= 2 &&
      state.src.charCodeAt(contentEnd - 1) === 93 /* ] */ &&
      state.src.charCodeAt(contentEnd - 2) === 92 /* \ */
    ) {
      // Single line expression
      firstLine = state.src.substring(pos, contentEnd - 2);
      found = true;
    } else {
      firstLine = state.src.substring(pos, end);
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
      contentEnd = state.skipSpacesBack(end, pos);

      if (
        contentEnd - pos >= 2 &&
        state.src.charCodeAt(contentEnd - 1) === 93 /* ] */ &&
        state.src.charCodeAt(contentEnd - 2) === 92 /* \ */
      ) {
        lastLine = state.src.substring(pos, contentEnd - 2).trimEnd();
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
    token.markup = "\\[";

    return true;
  };

const ruleOptions = {
  alt: ["paragraph", "reference", "blockquote", "list"],
};

export const tex: PluginWithOptions<MarkdownItTexOptions> = (md, options) => {
  if (typeof options?.render !== "function")
    throw new Error('[@mdit/plugin-tex]: "render" option should be a function');

  const {
    allowInlineWithSpace = false,
    mathFence = false,
    delimiters = "dollars",
    render,
  } = options;

  // Handle ```math blocks
  if (mathFence) {
    const fence = md.renderer.rules.fence;

    md.renderer.rules.fence = (...args): string => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [tokens, index, , env] = args;
      const { content, info } = tokens[index];

      if (info.trim() === "math") return render(content, true, env);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return fence!(...args);
    };
  }

  // Register inline and block rules based on delimiters option
  if (delimiters === "dollars" || delimiters === "all") {
    md.inline.ruler.after(
      "escape",
      "math_inline_dollar",
      getDollarInlineTex(allowInlineWithSpace),
    );
    md.block.ruler.after(
      "blockquote",
      "math_block_dollar",
      dollarBlockTex,
      ruleOptions,
    );
  }

  if (delimiters === "brackets" || delimiters === "all") {
    md.inline.ruler.before(
      "escape",
      "math_inline_bracket",
      getBracketInlineTex(),
    );
    md.block.ruler.after(
      "blockquote",
      "math_block_bracket",
      getBracketBlockTex(),
      ruleOptions,
    );
  }

  md.renderer.rules.math_inline = (tokens, index, _options, env): string =>
    render(tokens[index].content, false, env);
  md.renderer.rules.math_block = (tokens, index, _options, env): string =>
    render(tokens[index].content, true, env);
};
