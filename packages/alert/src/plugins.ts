import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";

import type { MarkdownItAlertOptions } from "./options.js";

const HINT_REGEXP = /^>(?:(?: {0,3})| {0,2}\t {0,1})\[!(.*)\]\s*$/i;

export const alert: PluginWithOptions<MarkdownItAlertOptions> = (
  md,
  {
    alertNames = ["tip", "warning", "caution", "important", "note"],
    deep = false,
    openRender,
    closeRender,
    titleRender,
  } = {},
) => {
  const alertRule: RuleBlock = (state, startLine, endLine, silent) => {
    if (
      // if it's indented more than 3 spaces, it should be a code block
      state.sCount[startLine] - state.blkIndent >= 4 ||
      // check whether it's at first level
      (state.level !== 0 && !deep)
    )
      return false;

    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    // check the block quote marker
    if (state.src.charAt(pos) !== ">") return false;

    // check alert markers
    const match = HINT_REGEXP.exec(state.src.slice(pos, max));

    if (!match || !alertNames.includes(match[1].toLowerCase())) return false;

    // we know that it's going to be a valid alert,
    // so no point trying to find the end of it in silent mode
    if (silent) return true;

    const type = match[1].toLowerCase();
    const oldBMarks = [];
    const oldBSCount = [];
    const oldSCount = [];
    const oldTShift = [];
    const oldLineMax = state.lineMax;
    const oldParentType = state.parentType;
    const terminatorRules = state.md.block.ruler.getRules("alert");

    // @ts-expect-error: We are creating a new type called "alert"
    state.parentType = "alert";

    // Search the end of the block
    //
    // Block ends with either:
    //  1. an empty line outside:
    //     ```
    //     > test
    //
    //     ```
    //  2. an empty line inside:
    //     ```
    //     >
    //     test
    //     ```
    //  3. another tag:
    //     ```
    //     > test
    //      - - -
    //     ```
    let nextLine;

    for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
      let adjustTab = false;
      let lastLineEmpty = false;
      let pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];

      // check if it's outdented, i.e. it's inside list item and indented
      // less than said list item:
      //
      // ```
      // 1. anything
      //    > current blockquote
      // 2. checking this line
      // ```
      const isOutdented = state.sCount[nextLine] < state.blkIndent;

      if (pos >= max)
        // Case 1: line is not inside the blockquote, and this line is empty.
        break;

      if (state.src.charAt(pos++) === ">" && !isOutdented) {
        let spaceAfterMarker: boolean;
        // This line is inside the blockquote.

        // set offset past spaces and ">"
        let initial = state.sCount[nextLine] + 1;

        // skip one optional space after '>'
        if (state.src.charAt(pos) === " ") {
          // ' >   test '
          //     ^ -- position start of line here:
          pos++;
          initial++;
          adjustTab = false;
          spaceAfterMarker = true;
        } else if (state.src.charAt(pos) === "\t") {
          spaceAfterMarker = true;

          if ((state.bsCount[nextLine] + initial) % 4 === 3) {
            // '  >\t  test '
            //       ^ -- position start of line here (tab has width===1)
            pos++;
            initial++;
            adjustTab = false;
          } else {
            // ' >\t  test '
            //    ^ -- position start of line here + shift bsCount slightly
            //         to make extra space appear
            adjustTab = true;
          }
        } else {
          spaceAfterMarker = false;
        }

        let offset = initial;

        oldBMarks.push(state.bMarks[nextLine]);
        state.bMarks[nextLine] = pos;

        while (pos < max) {
          const ch = state.src.charAt(pos);

          if (ch === "\t")
            offset +=
              4 -
              ((offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4);
          else if (ch === " ") offset++;
          else break;

          pos++;
        }

        lastLineEmpty = pos >= max;

        oldBSCount.push(state.bsCount[nextLine]);
        state.bsCount[nextLine] =
          state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);

        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] = offset - initial;

        oldTShift.push(state.tShift[nextLine]);
        state.tShift[nextLine] = pos - state.bMarks[nextLine];
        continue;
      }

      // Case 2: line is not inside the blockquote, and the last line was empty.
      if (lastLineEmpty) break;

      // Case 3: another tag found.
      let terminate = false;

      for (const terminatorRule of terminatorRules)
        if (terminatorRule(state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }

      if (terminate) {
        // Quirk to enforce "hard termination mode" for paragraphs;
        // normally if you call `tokenize(state, startLine, nextLine)`,
        // paragraphs will look below nextLine for paragraph continuation,
        // but if blockquote is terminated by another tag, they shouldn't
        state.lineMax = nextLine;

        if (state.blkIndent !== 0) {
          // state.blkIndent was non-zero, we now set it to zero,
          // so we need to re-calculate all offsets to appear as
          // if indent wasn't changed
          oldBMarks.push(state.bMarks[nextLine]);
          oldBSCount.push(state.bsCount[nextLine]);
          oldTShift.push(state.tShift[nextLine]);
          oldSCount.push(state.sCount[nextLine]);
          state.sCount[nextLine] -= state.blkIndent;
        }

        break;
      }

      oldBMarks.push(state.bMarks[nextLine]);
      oldBSCount.push(state.bsCount[nextLine]);
      oldTShift.push(state.tShift[nextLine]);
      oldSCount.push(state.sCount[nextLine]);

      // A negative indentation means that this is a paragraph continuation
      //
      state.sCount[nextLine] = -1;
    }

    const oldIndent = state.blkIndent;

    state.blkIndent = 0;

    const titleLines: [number, number] = [startLine, startLine + 1];
    const contentLines: [number, number] = [startLine + 1, 0];

    const openToken = state.push("alert_open", "div", 1);

    openToken.markup = type;
    openToken.attrJoin("class", `markdown-alert markdown-alert-${type}`);
    openToken.map = contentLines;

    const titleToken = state.push("alert_title", "", 0);

    titleToken.attrJoin("class", `markdown-alert-title`);
    titleToken.markup = type;
    titleToken.content = match[1];
    titleToken.map = titleLines;

    state.md.block.tokenize(state, startLine + 1, nextLine);

    const closeToken = state.push("alert_close", "div", -1);

    closeToken.markup = type;

    state.lineMax = oldLineMax;
    state.parentType = oldParentType;
    contentLines[1] = state.line;

    // Restore original tShift; this might not be necessary since the parser
    // has already been here, but just to make sure we can do that.
    for (let i = 0; i < oldTShift.length; i++) {
      state.bMarks[i + startLine] = oldBMarks[i];
      state.tShift[i + startLine] = oldTShift[i];
      state.sCount[i + startLine] = oldSCount[i];
      state.bsCount[i + startLine] = oldBSCount[i];
    }
    state.blkIndent = oldIndent;

    return true;
  };

  md.block.ruler.before("blockquote", "alert", alertRule, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  if (openRender) md.renderer.rules["alert_open"] = openRender;
  if (closeRender) md.renderer.rules["alert_close"] = closeRender;

  md.renderer.rules["alert_title"] =
    titleRender ??
    ((tokens, index): string => {
      const token = tokens[index];

      return `<p class="markdown-alert-title">${
        token.content[0].toUpperCase() +
        token.content.substring(1).toLowerCase()
      }</p>\n`;
    });
};
