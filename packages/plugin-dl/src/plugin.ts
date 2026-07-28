/** Forked and modified from https://github.com/markdown-it/markdown-it-deflist/blob/master/index.mjs */

import type { PluginSimple } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";

// Search `[:~][\n ]`, returns next pos after marker on success
// or -1 on fail.
const checkAndSkipMarker = (state: StateBlock, line: number): number => {
  let start = state.bMarks[line] + state.tShift[line];
  const max = state.eMarks[line];

  if (start >= max) return -1;

  // Check bullet
  const marker = state.src.charCodeAt(start++);

  if (marker !== 126 /* ~ */ && marker !== 58 /* : */) return -1;

  const pos = state.skipSpaces(start);

  if (
    // require space after ":"
    start === pos ||
    // no empty definitions, e.g. "  : "
    pos >= max
  )
    return -1;

  return start;
};

const markTightParagraph = (state: StateBlock, start: number, end: number, level: number): void => {
  let block = -1;

  for (let i = start; i < end; i++) {
    const token = state.tokens[i];

    if (token.level !== level || token.nesting < 0) continue;
    if (block >= 0) return;
    block = i;
  }

  if (block < 0 || state.tokens[block].type !== "paragraph_open") return;

  state.tokens[block + 2].hidden = true;
  state.tokens[block].hidden = true;
};

const dlRule: RuleBlock = (state, startLine, endLine, silent) => {
  if (silent) {
    // validation mode validates a dd block only, not a whole definition list
    if (state.ddIndent < 0) return false;

    return checkAndSkipMarker(state, startLine) >= 0 && state.sCount[startLine] < state.blkIndent;
  }

  let nextLine = startLine + 1;

  if (nextLine >= endLine) return false;

  let termIsTight = true;

  if (state.isEmpty(nextLine)) {
    nextLine++;
    termIsTight = false;
    if (nextLine >= endLine) return false;
  }

  if (state.sCount[nextLine] < state.blkIndent) return false;

  let contentStart = checkAndSkipMarker(state, nextLine);

  if (contentStart < 0) return false;

  // Start list
  const dlOpenToken = state.push("dl_open", "dl", 1);
  const listLines: [start: number, end: number] = [startLine, 0];

  dlOpenToken.map = listLines;

  //
  // Iterate list items
  //

  let dtLine = startLine;
  let ddLine = nextLine;

  // One definition list can contain multiple DTs,
  // and one DT can be followed by multiple DDs.
  //
  // Thus, there is two loops here, and label is
  // needed to break out of the second one
  //
  // oxlint-disable-next-line no-labels
  OUTER: for (;;) {
    const dtOpenToken = state.push("dt_open", "dt", 1);

    dtOpenToken.map = [dtLine, dtLine];

    const inlineToken = state.push("inline", "", 0);

    inlineToken.map = [dtLine, dtLine];
    inlineToken.content = state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim();
    inlineToken.children = [];

    state.push("dt_close", "dt", -1);

    for (;;) {
      const itemTokenIndex = state.tokens.length;

      const ddOpenToken = state.push("dd_open", "dd", 1);
      const itemLines: [start: number, end: number] = [nextLine, 0];

      ddOpenToken.map = itemLines;

      let pos = contentStart;
      const max = state.eMarks[ddLine];
      let offset =
        state.sCount[ddLine] + contentStart - (state.bMarks[ddLine] + state.tShift[ddLine]);

      while (pos < max) {
        const ch = state.src.charCodeAt(pos);

        if (ch === 9 /* \t */) offset += 4 - (offset % 4);
        else if (ch === 32 /* space */) offset++;
        else break;

        pos++;
      }

      contentStart = pos;

      const oldTight = state.tight;
      const oldDDIndent = state.ddIndent;
      const oldIndent = state.blkIndent;
      const oldTShift = state.tShift[ddLine];
      const oldSCount = state.sCount[ddLine];
      const oldParentType = state.parentType;

      state.blkIndent = state.ddIndent = state.sCount[ddLine] + 2;
      state.tShift[ddLine] = contentStart - state.bMarks[ddLine];
      state.sCount[ddLine] = offset;
      state.tight = true;
      // @ts-expect-error: This type is not standard
      state.parentType = "dl";
      // @ts-expect-error: An internal param is used
      state.md.block.tokenize(state, ddLine, endLine, true);

      if (termIsTight)
        markTightParagraph(state, itemTokenIndex, state.tokens.length, ddOpenToken.level + 1);

      state.tShift[ddLine] = oldTShift;
      state.sCount[ddLine] = oldSCount;
      state.tight = oldTight;
      state.parentType = oldParentType;
      state.blkIndent = oldIndent;
      state.ddIndent = oldDDIndent;

      state.push("dd_close", "dd", -1);

      itemLines[1] = nextLine = state.line;

      // oxlint-disable-next-line no-labels
      if (nextLine >= endLine) break OUTER;

      // oxlint-disable-next-line no-labels
      if (state.sCount[nextLine] < state.blkIndent) break OUTER;

      contentStart = checkAndSkipMarker(state, nextLine);

      if (contentStart < 0) break;

      ddLine = nextLine;

      // go to the next loop iteration:
      // insert DD tag and repeat checking
    }

    dtLine = nextLine;
    ddLine = dtLine + 1;

    if (ddLine >= endLine) break;

    const skippedEmptyLine = state.isEmpty(ddLine);

    if (skippedEmptyLine) ddLine++;

    if (ddLine >= endLine || state.sCount[ddLine] < state.blkIndent) break;

    contentStart = checkAndSkipMarker(state, ddLine);

    if (contentStart < 0) break;

    termIsTight = !skippedEmptyLine;

    // go to the next loop iteration:
    // insert DT and DD tags and repeat checking
  }

  // Finalize list
  state.push("dl_close", "dl", -1);

  listLines[1] = nextLine;

  state.line = nextLine;

  return true;
};

export const dl: PluginSimple = (md) => {
  md.block.ruler.before("paragraph", "dl", dlRule, {
    alt: ["paragraph", "reference", "blockquote"],
  });
};
