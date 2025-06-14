import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";

import type { MarkdownItAlertOptions } from "./options.js";

const getAlertRule =
  (types: Set<string>, deep: boolean): RuleBlock =>
  (state, startLine, endLine, silent) => {
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
    if (state.src.charCodeAt(pos) !== 62 /* > */) return false;

    let currentPos = pos + 1;

    let initial = state.sCount[startLine] + 1;
    let adjustTab = false;

    // skip one optional space after '>'
    if (state.src.charCodeAt(currentPos) === 32 /* space */) {
      // ' >   [!tip] '
      //     ^ -- position start of line here:
      currentPos++;
      initial++;
    } else if (state.src.charCodeAt(currentPos) === 9 /* tab */) {
      if ((state.bsCount[startLine] + initial) % 4 === 3) {
        // '  >\t  [!tip] '
        //       ^ -- position start of line here (tab has width===1)
        currentPos++;
        initial++;
      } else {
        // ' >\t  [!tip] '
        //    ^ -- position start of line here + shift bsCount slightly
        //         to make extra space appear
        adjustTab = true;
      }
    }

    let offset = initial;

    while (currentPos < max) {
      const ch = state.src.charCodeAt(currentPos);

      if (ch === 9 /** \t */)
        offset +=
          4 - ((offset + state.bsCount[startLine] + (adjustTab ? 1 : 0)) % 4);
      else if (ch === 32 /** space */) offset++;
      else break;

      currentPos++;
    }

    // skip blockquote
    if (offset - initial >= 4) return false;

    // the minimum length of an alert is 4 characters [!x]
    if (max - currentPos < 4) return false;

    // check opening marker '[!'
    if (
      state.src.charCodeAt(currentPos) !== 91 /* [ */ ||
      state.src.charCodeAt(currentPos + 1) !== 33 /* ! */
    )
      return false;

    currentPos += 2;

    let typeName = "";

    // find closing bracket ']'
    while (currentPos < max) {
      const char = state.src.charAt(currentPos);

      if (char === "]") break;

      typeName += char;
      currentPos++;
    }

    if (currentPos === max) return false;

    const type = typeName.toLowerCase();

    if (!types.has(type)) return false;

    // skip spaces after ']'
    currentPos = state.skipSpaces(currentPos + 1);

    // if there are non-space characters after ']', it's not a valid alert
    if (currentPos < max) return false;

    // we know that it's going to be a valid alert,
    // so no point trying to find the end of it in silent mode
    if (silent) return true;

    const oldBMarks = [];
    const oldBSCount = [];
    const oldSCount = [];
    const oldTShift = [];
    const oldLineMax = state.lineMax;
    const oldParentType = state.parentType;
    const terminatorRules = [
      state.md.block.ruler.getRules("blockquote"),
      state.md.block.ruler.getRules("alert"),
    ].flat();

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
    let currentLine;

    for (currentLine = startLine; currentLine < endLine; currentLine++) {
      // check if it's outdented, i.e. it's inside list item and indented
      // less than said list item:
      //
      // ```
      // 1. anything
      //    > current blockquote
      // 2. checking this line
      // ```
      const isOutdented = state.sCount[currentLine] < state.blkIndent;

      let pos = state.bMarks[currentLine] + state.tShift[currentLine];
      const max = state.eMarks[currentLine];

      // Case 1: line is not inside the blockquote, and this line is empty.
      if (pos >= max) break;

      let lastLineEmpty = false;

      if (state.src.charCodeAt(pos++) === 62 /* > */ && !isOutdented) {
        // This line is inside the blockquote.

        // set offset past spaces and ">"
        let initial = state.sCount[currentLine] + 1;
        let spaceAfterMarker = false;
        let adjustTab = false;

        // skip one optional space after '>'
        if (state.src.charCodeAt(pos) === 32 /* space */) {
          // ' >   test '
          //     ^ -- position start of line here:
          pos++;
          initial++;
          spaceAfterMarker = true;
        } else if (state.src.charCodeAt(pos) === 9 /* \t */) {
          spaceAfterMarker = true;

          if ((state.bsCount[currentLine] + initial) % 4 === 3) {
            // '  >\t  test '
            //       ^ -- position start of line here (tab has width===1)
            pos++;
            initial++;
          } else {
            // ' >\t  test '
            //    ^ -- position start of line here + shift bsCount slightly
            //         to make extra space appear
            adjustTab = true;
          }
        }

        let offset = initial;

        oldBMarks.push(state.bMarks[currentLine]);
        state.bMarks[currentLine] = pos;

        while (pos < max) {
          const ch = state.src.charCodeAt(pos);

          if (ch === 9 /** \t */)
            offset +=
              4 -
              ((offset + state.bsCount[currentLine] + (adjustTab ? 1 : 0)) % 4);
          else if (ch === 32 /** space */) offset++;
          else break;

          pos++;
        }

        lastLineEmpty = pos >= max;

        oldBSCount.push(state.bsCount[currentLine]);
        state.bsCount[currentLine] =
          state.sCount[currentLine] + 1 + (spaceAfterMarker ? 1 : 0);

        oldSCount.push(state.sCount[currentLine]);
        state.sCount[currentLine] = offset - initial;

        oldTShift.push(state.tShift[currentLine]);
        state.tShift[currentLine] = pos - state.bMarks[currentLine];
        continue;
      }

      // Case 2: line is not inside the blockquote, and the last line was empty.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (lastLineEmpty) break;

      // Case 3: another tag found.
      let terminate = false;

      for (const terminatorRule of terminatorRules)
        if (terminatorRule(state, currentLine, endLine, true)) {
          terminate = true;
          break;
        }

      if (terminate) {
        // Quirk to enforce "hard termination mode" for paragraphs;
        // normally if you call `tokenize(state, startLine, nextLine)`,
        // paragraphs will look below nextLine for paragraph continuation,
        // but if blockquote is terminated by another tag, they shouldn't
        state.lineMax = currentLine;

        if (state.blkIndent !== 0) {
          // state.blkIndent was non-zero, we now set it to zero,
          // so we need to re-calculate all offsets to appear as
          // if indent wasn't changed
          oldBMarks.push(state.bMarks[currentLine]);
          oldBSCount.push(state.bsCount[currentLine]);
          oldSCount.push(state.sCount[currentLine]);
          oldTShift.push(state.tShift[currentLine]);

          state.sCount[currentLine] -= state.blkIndent;
        }

        break;
      }

      oldBMarks.push(state.bMarks[currentLine]);
      oldBSCount.push(state.bsCount[currentLine]);
      oldSCount.push(state.sCount[currentLine]);
      oldTShift.push(state.tShift[currentLine]);

      // A negative indentation means that this is a paragraph continuation
      //
      state.sCount[currentLine] = -1;
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
    titleToken.content = typeName;
    titleToken.map = titleLines;

    state.md.block.tokenize(state, startLine + 1, currentLine);

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
  md.block.ruler.before(
    "blockquote",
    "alert",
    getAlertRule(new Set(alertNames.map((name) => name.toLowerCase())), deep),
    {
      alt: ["paragraph", "reference", "blockquote", "list"],
    },
  );

  if (openRender) md.renderer.rules.alert_open = openRender;
  if (closeRender) md.renderer.rules.alert_close = closeRender;

  md.renderer.rules.alert_title =
    titleRender ??
    ((tokens, index): string => {
      const token = tokens[index];

      return `<p class="markdown-alert-title">${
        token.content[0].toUpperCase() +
        token.content.substring(1).toLowerCase()
      }</p>\n`;
    });
};
