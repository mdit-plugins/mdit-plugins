// oxlint-disable typescript/explicit-function-return-type
import { isSpace } from "markdown-it/lib/common/utils.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, getDelimiterChecker, getMatchingOpeningToken } from "../helper/index.js";

interface TokenWithColumnCount extends Token {
  meta:
    | {
        columnCount?: number;
        [key: string]: unknown;
      }
    | undefined;
}

// oxlint-disable-next-line max-lines-per-function
export const getTableRules = (options: DelimiterConfig): AttrRule[] => [
  defineAttrRule({
    /**
     * | h1 |
     * | -- |
     * | c1 |
     *
     * {.c}
     */
    name: "table",
    tests: [
      {
        // let this token be i, such that for-loop continues at
        // next token after tokens.splice
        shift: 0,
        type: "table_close",
      },
      {
        shift: 1,
        type: "paragraph_open",
      },
      {
        shift: 2,
        type: "inline",
        content: getDelimiterChecker(options, "only"),
      },
    ],
    transform: (tokens, index, _, range): void => {
      const token = tokens[index + 2];
      const tableOpeningToken = getMatchingOpeningToken(tokens, index);

      // Apply attributes to the table opening token
      addAttrs(tableOpeningToken, token.content, range, options.allowed);

      // Remove the paragraph tokens containing the attributes
      tokens.splice(index + 1, 3);
    },
  }),
  /**
   * Handle table cell attributes: title {.class}
   * This rule processes attributes within table cell text content
   */
  defineAttrRule({
    name: "table cell attributes",
    tests: [
      {
        shift: -1,
        type: (type) => type === "td_open" || type === "th_open",
      },
      {
        shift: 0,
        type: "inline",
        children: [
          {
            shift: 0,
            type: "text",
            content: getDelimiterChecker(options, "end"),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex, range): void => {
      const attrStartIndex = range[0] - options.left.length;
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const cellOpenToken = tokens[index - 1];
      const { content } = token;
      const hasTrailingSpace = isSpace(content.charCodeAt(attrStartIndex - 1));

      // Find last attribute syntax in the content

      // Apply attributes to the table cell token
      addAttrs(cellOpenToken, content, range, options.allowed);

      // Remove attribute syntax from content
      token.content = content.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
    },
  }),
  defineAttrRule({
    /**
     * | A | B |
     * | -- | -- |
     * | 1 | 2 |
     *
     * | C | D |
     * | -- | -- |
     *
     * only `| A | B |` sets the columnCount metadata
     */
    name: "table thead metadata",
    tests: [
      {
        shift: 0,
        type: "tr_close",
      },
      {
        shift: 1,
        type: "thead_close",
      },
      {
        shift: 2,
        type: "tbody_open",
      },
    ],

    transform: (tokens, index): void => {
      const trOpenToken = getMatchingOpeningToken(tokens, index);
      const thCloseToken = tokens[index - 1];
      let columnCount = 0;
      let currentIndex = index - 1;

      // Find the matching tr_open token and count columns
      while (currentIndex > 0) {
        const currentToken = tokens[currentIndex];

        if (currentToken === trOpenToken) {
          const tHeadOpenToken = tokens[currentIndex - 1] as TokenWithColumnCount;

          tHeadOpenToken.meta = {
            ...tHeadOpenToken.meta,
            columnCount,
          };
          break;
        }

        // Count th_close tokens at the same level
        if (currentToken.level === thCloseToken.level && currentToken.type === thCloseToken.type)
          columnCount++;

        currentIndex--;
      }

      // Apply metadata to tbody_open token
      const tbodyOpenToken = tokens[index + 2] as TokenWithColumnCount;

      tbodyOpenToken.meta = {
        ...tbodyOpenToken.meta,
        columnCount,
      };
    },
  }),
  defineAttrRule({
    /**
     * | A | B | C | D |
     * | -- | -- | -- | -- |
     * | 1 | 11 | 111 | 1111 {rowspan=3} |
     * | 2 {colspan=2 rowspan=2} | 22 | 222 | 2222 |
     * | 3 | 33 | 333 | 3333 |
     */
    name: "table tbody calculate",
    tests: [
      {
        shift: 0,
        type: "tbody_close",
        hidden: false,
      },
    ],
    transform: (tokens, index): void => {
      let tbodyOpenIndex = index - 2;

      while (tbodyOpenIndex >= 0 && tokens[tbodyOpenIndex].type !== "tbody_open") tbodyOpenIndex--;

      // oxlint-disable-next-line typescript/no-non-null-assertion
      const columnCount = (tokens[tbodyOpenIndex] as TokenWithColumnCount).meta!.columnCount!;

      if (columnCount < 2) return;

      const remainingCellRemovedByRowSpan = Array.from({
        length: columnCount,
      }).fill(0) as number[];
      const rangesToRemove: [start: number, end: number][] = [];

      let currentTokenIndex = tbodyOpenIndex + 1;

      while (currentTokenIndex < index) {
        // The current token should be tr_open
        const trOpenIndex = currentTokenIndex;
        // Find tr_close
        let trCloseIndex = trOpenIndex + 1;

        while (trCloseIndex < index && tokens[trCloseIndex].type !== "tr_close") trCloseIndex++;

        // Collect cell info
        const cells: [openIndex: number, closeIndex: number][] = [];

        let cellSearchIndex = trOpenIndex + 1;

        // if it's not tr_close, then it should be a td_open or th_open
        while (cellSearchIndex < trCloseIndex) {
          let closeIndex = cellSearchIndex + 1;

          // find the close token
          while (
            closeIndex < trCloseIndex &&
            tokens[closeIndex].type !== "td_close" &&
            tokens[closeIndex].type !== "th_close"
          )
            closeIndex++;

          cells.push([cellSearchIndex, closeIndex]);
          // move to next token
          cellSearchIndex = closeIndex + 1;
        }

        let cellIndex = 0;
        let colIndex = 0;

        while (colIndex < columnCount) {
          // skip cells removed by rowspan
          if (remainingCellRemovedByRowSpan[colIndex] > 0) {
            remainingCellRemovedByRowSpan[colIndex]--;
            rangesToRemove.push(cells[cellIndex]);
            cellIndex++;
            colIndex++;
            continue;
          }

          // get rowspan and colspan for current cell
          const cellOpenToken = tokens[cells[cellIndex][0]];
          const colspan = Number(cellOpenToken.attrGet("colspan")) || 1;
          const rowspan = Number(cellOpenToken.attrGet("rowspan")) || 1;

          cellIndex++;

          // Calculate real colspan based on availability
          let realColspan = 0;

          for (let colSpanIndex = 0; colSpanIndex < colspan; colSpanIndex++) {
            // colspan should not overflow table columns
            if (colIndex + colSpanIndex < columnCount) {
              // the column is not occupied by rowspan
              if (remainingCellRemovedByRowSpan[colIndex + colSpanIndex] === 0) realColspan++;
              else break;
            }
          }

          if (colspan > 1 && realColspan < colspan)
            cellOpenToken.attrSet("colspan", String(realColspan));

          // Mark columns as occupied
          for (let i = 0; i < realColspan; i++)
            remainingCellRemovedByRowSpan[colIndex + i] = rowspan - 1;

          // Consume merged cells
          const cellsToMerge = realColspan - 1;

          if (cellsToMerge > 0) {
            for (let i = 0; i < cellsToMerge; i++) {
              rangesToRemove.push(cells[cellIndex]);
              cellIndex++;
            }
          }

          colIndex += realColspan;
        }

        // Move to next tr
        currentTokenIndex = trCloseIndex + 1;
      }

      // Remove tokens in reverse order
      rangesToRemove.sort((a, b) => b[0] - a[0]);
      for (const [start, end] of rangesToRemove) tokens.splice(start, end - start + 1);
    },
  }),
];
