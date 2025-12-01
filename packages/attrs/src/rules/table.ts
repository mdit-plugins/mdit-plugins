import { isSpace } from "markdown-it/lib/common/utils.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

interface TokenWithColumnCount extends Token {
  meta:
    | {
        columnCount?: number;
        [key: string]: unknown;
      }
    | undefined;
}

export const getTableRules = (options: DelimiterConfig): AttrRule[] => [
  {
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
  },
  /**
   * Handle table cell attributes: title {.class}
   * This rule processes attributes within table cell text content
   */
  {
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const cellOpenToken = tokens[index - 1];
      const { content } = token;
      const hasTrailingSpace = isSpace(content.charCodeAt(attrStartIndex - 1));

      // Find last attribute syntax in the content

      // Apply attributes to the table cell token
      addAttrs(cellOpenToken, content, range, options.allowed);

      // Remove attribute syntax from content
      token.content = content.slice(
        0,
        hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex,
      );
    },
  },
  {
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
          const tHeadOpenToken = tokens[
            currentIndex - 1
          ] as TokenWithColumnCount;

          tHeadOpenToken.meta = {
            ...tHeadOpenToken.meta,
            columnCount,
          };
          break;
        }

        // Count th_close tokens at the same level
        if (
          currentToken.level === thCloseToken.level &&
          currentToken.type === thCloseToken.type
        ) {
          columnCount++;
        }

        currentIndex--;
      }

      // Apply metadata to tbody_open token
      const tbodyOpenToken = tokens[index + 2] as TokenWithColumnCount;

      tbodyOpenToken.meta = {
        ...tbodyOpenToken.meta,
        columnCount,
      };
    },
  },
  {
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
      // Find the tbody_open token index
      let tbodyOpenIndex = index - 2;

      while (tbodyOpenIndex > 0) {
        tbodyOpenIndex--;
        if (tokens[tbodyOpenIndex].type === "tbody_open") break;
      }

      const columnCount =
        (tokens[tbodyOpenIndex] as TokenWithColumnCount).meta?.columnCount ?? 0;

      if (columnCount < 1) return;

      const rowState = Array.from({ length: columnCount }).fill(0) as number[];
      const rangesToRemove: { start: number; end: number }[] = [];

      // Iterate through the tbody content
      let currentTokenIndex = tbodyOpenIndex + 1;

      while (currentTokenIndex < index) {
        const token = tokens[currentTokenIndex];

        if (token.type === "tr_open") {
          const trStartIndex = currentTokenIndex;
          // Find tr_close
          let trEndIndex = trStartIndex;

          for (
            let trSearchIndex = trStartIndex + 1;
            trSearchIndex < index;
            trSearchIndex++
          ) {
            if (tokens[trSearchIndex].type === "tr_close") {
              trEndIndex = trSearchIndex;
              break;
            }
          }

          // Collect cell info
          const cells: { openIndex: number; closeIndex: number }[] = [];

          for (
            let cellSearchIndex = trStartIndex + 1;
            cellSearchIndex < trEndIndex;
            cellSearchIndex++
          ) {
            if (
              tokens[cellSearchIndex].type === "td_open" ||
              tokens[cellSearchIndex].type === "th_open"
            ) {
              let closeIndex = cellSearchIndex + 1;

              while (closeIndex < trEndIndex) {
                if (
                  tokens[closeIndex].type === "td_close" ||
                  tokens[closeIndex].type === "th_close"
                ) {
                  break;
                }
                closeIndex++;
              }

              // Include trailing tokens (e.g. whitespace/newlines)
              let nextIndex = closeIndex + 1;

              while (nextIndex < trEndIndex) {
                const type = tokens[nextIndex].type;

                if (type === "td_open" || type === "th_open") {
                  break;
                }
                nextIndex++;
              }

              cells.push({
                openIndex: cellSearchIndex,
                closeIndex: nextIndex - 1,
              });
              cellSearchIndex = nextIndex - 1;
            }
          }

          let cellIndex = 0;
          let colIndex = 0;

          while (colIndex < columnCount) {
            if (rowState[colIndex] > 0) {
              rowState[colIndex]--;
              // Consume a cell if available (it corresponds to this occupied slot)
              if (cellIndex < cells.length) {
                const { openIndex, closeIndex } = cells[cellIndex];

                rangesToRemove.push({ start: openIndex, end: closeIndex });
                cellIndex++;
              }
              colIndex++;
            } else {
              // Column is free
              if (cellIndex < cells.length) {
                const { openIndex } = cells[cellIndex];
                const cellToken = tokens[openIndex];

                cellIndex++;

                if (cellToken.hidden) {
                  colIndex++;
                  continue;
                }

                const colspan = Number(cellToken.attrGet("colspan")) || 1;
                const rowspan = Number(cellToken.attrGet("rowspan")) || 1;

                // Calculate real colspan based on availability
                let realColspan = 0;

                for (let i = 0; i < colspan; i++) {
                  if (colIndex + i < columnCount) {
                    if (rowState[colIndex + i] === 0) {
                      realColspan++;
                    } else {
                      break;
                    }
                  } else {
                    realColspan++;
                  }
                }

                if (realColspan < colspan) {
                  cellToken.attrSet("colspan", String(realColspan));
                }

                // Mark columns as occupied
                for (let i = 0; i < realColspan; i++) {
                  if (colIndex + i < columnCount) {
                    rowState[colIndex + i] = rowspan - 1;
                  }
                }

                // Consume merged cells
                const cellsToMerge = realColspan - 1;

                for (let i = 0; i < cellsToMerge; i++) {
                  if (cellIndex < cells.length) {
                    const { openIndex: mergeOpen, closeIndex: mergeClose } =
                      cells[cellIndex];

                    rangesToRemove.push({ start: mergeOpen, end: mergeClose });
                    cellIndex++;
                  }
                }

                colIndex += realColspan;
              } else {
                // No more cells
                colIndex++;
              }
            }
          }

          // Hide remaining cells
          while (cellIndex < cells.length) {
            const { openIndex, closeIndex } = cells[cellIndex];

            rangesToRemove.push({ start: openIndex, end: closeIndex });
            cellIndex++;
          }

          currentTokenIndex = trEndIndex + 1;
        } else {
          currentTokenIndex++;
        }
      }

      // Remove tokens in reverse order
      rangesToRemove.sort((a, b) => b.start - a.start);
      for (const { start, end } of rangesToRemove) {
        tokens.splice(start, end - start + 1);
      }
    },
  },
];
