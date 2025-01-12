/**
 * Forked from https://github.com/waylonflinn/markdown-it-katex/blob/master/index.js
 */

import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";

import type { MarkdownItTexOptions } from "./options.js";

/*
 * Test if potential opening or closing delimiter
 * Assumes that there is a "$" at state.src[pos]
 */
const isValidDelim = (
  state: StateInline,
  pos: number,
  allowInlineWithSpace: boolean,
): { canOpen: boolean; canClose: boolean } => {
  const prevChar = state.src.charAt(pos - 1);
  const nextChar = state.src.charAt(pos + 1);

  return {
    canOpen: allowInlineWithSpace || (nextChar !== " " && nextChar !== "\t"),

    /*
     * Check non-whitespace conditions for opening and closing, and
     * check that closing delimiter isn’t followed by a number
     */
    canClose:
      !/[0-9]/u.exec(nextChar) &&
      (allowInlineWithSpace || (prevChar !== " " && prevChar !== "\t")),
  };
};

const getInlineTex =
  (allowInlineWithSpace: boolean): RuleInline =>
  (state, silent) => {
    if (state.src[state.pos] !== "$") return false;

    let delimState = isValidDelim(state, state.pos, allowInlineWithSpace);

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
      while (state.src[pos] === "\\") pos--;

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
    delimState = isValidDelim(state, match, allowInlineWithSpace);

    if (!delimState.canClose) {
      if (!silent) state.pending += "$";

      state.pos = start;

      return true;
    }

    if (!silent) {
      const token = state.push("math_inline", "math", 0);

      token.markup = "$";
      token.content = state.src.slice(start, match);
    }

    state.pos = match + 1;

    return true;
  };

const blockTex: RuleBlock = (state, start, end, silent) => {
  let pos = state.bMarks[start] + state.tShift[start];
  let max = state.eMarks[start];

  if (pos + 2 > max) return false;

  if (state.src.slice(pos, pos + 2) !== "$$") return false;

  pos += 2;
  let firstLine = state.src.slice(pos, max).trim();

  if (silent) return true;

  let found = false;

  if (firstLine.endsWith("$$")) {
    // Single line expression
    firstLine = firstLine.slice(0, -2);
    found = true;
  }

  let current = start;
  let lastLine = "";

  while (!found) {
    current++;
    if (current >= end) break;

    pos = state.bMarks[current] + state.tShift[current];
    max = state.eMarks[current];

    // non-empty line with negative indent should stop the list:
    if (pos < max && state.tShift[current] < state.blkIndent) break;

    // found end marker
    if (state.src.slice(pos, max).trim().endsWith("$$")) {
      lastLine = state.src
        .slice(pos, state.src.slice(0, max).lastIndexOf("$$"))
        .trim();
      found = true;
    }
  }

  state.line = found ? current + 1 : current;

  const token = state.push("math_block", "math", 0);

  token.block = true;
  token.content =
    (firstLine ? `${firstLine}\n` : "") +
    state.getLines(start + 1, current, state.tShift[start], true) +
    (lastLine ? `${lastLine}\n` : "");
  token.map = [start, state.line];
  token.markup = "$$";

  return true;
};

export const tex: PluginWithOptions<MarkdownItTexOptions> = (md, options) => {
  if (typeof options?.render !== "function")
    throw new Error('[@mdit/plugin-tex]: "render" option should be a function');

  const { allowInlineWithSpace = false, mathFence = false, render } = options;

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

  md.inline.ruler.after(
    "escape",
    "math_inline",
    getInlineTex(allowInlineWithSpace),
  );
  md.block.ruler.after("blockquote", "math_block", blockTex, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.renderer.rules.math_inline = (tokens, index, _options, env): string =>
    render(tokens[index].content, false, env);
  md.renderer.rules.math_block = (tokens, index, _options, env): string =>
    render(tokens[index].content, true, env);
};
