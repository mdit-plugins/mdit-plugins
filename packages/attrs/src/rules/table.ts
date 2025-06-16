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

/**
 * Hidden table's cells and them inline children,
 * specially cast inline's content as empty
 * to prevent that escapes the table's box model
 */
const hideTokenContent = (token: Token): void => {
  token.hidden = true;
  token.children?.forEach((childToken) => {
    childToken.content = "";
    hideTokenContent(childToken);
  });
};

/**
 * Handle rowspan logic for table cells
 */
const handleRowspan = (
  tokens: Token[],
  startIndex: number,
  endIndex: number,
  columnCount: number,
  colspan: number,
  rowspan: number,
): void => {
  let adjustedColumnCount = columnCount - (colspan > 0 ? colspan : 1);

  for (
    let tokenIndex = startIndex, remainingRows = rowspan;
    tokenIndex < endIndex && remainingRows > 1;
    tokenIndex++
  ) {
    if (tokens[tokenIndex].type === "tr_open") {
      const trOpenToken = tokens[tokenIndex] as TokenWithColumnCount;

      trOpenToken.meta ??= {};

      if (trOpenToken.meta.columnCount) adjustedColumnCount -= 1;
      trOpenToken.meta.columnCount = adjustedColumnCount;
      remainingRows--;
    }
  }
};

/**
 * Handle table row processing
 */
const handleTableRow = (
  tokens: Token[],
  startIndex: number,
  endIndex: number,
): void => {
  const token = tokens[startIndex] as TokenWithColumnCount;
  const expectedColumnCount = token.meta?.columnCount;

  if (!expectedColumnCount) return;

  // hide extra table cells in the row
  for (let index = startIndex, cellCount = 0; index < endIndex; index++) {
    const currentToken = tokens[index];

    // break at end of table row
    if (currentToken.type === "tr_close") break;

    // Count table cells in the row
    if (currentToken.type === "td_open") cellCount += 1;

    // hide extra table cells
    if (cellCount > expectedColumnCount && !currentToken.hidden) {
      hideTokenContent(currentToken);
    }
  }
};

/**
 * Handle colspan logic for table cells
 */
const handleColspan = (
  tokens: Token[],
  startIndex: number,
  endIndex: number,
  columnCount: number,
  colspan: number,
  tbodyOpenIndex: number,
): void => {
  const cellIndices: number[] = [];
  const startToken = tokens[startIndex];

  let end = startIndex + 3;
  let colspanNum = columnCount;

  // Find previous row children indices
  for (let tokenIndex = startIndex; tokenIndex > tbodyOpenIndex; tokenIndex--) {
    if (tokens[tokenIndex].type === "tr_open") {
      colspanNum =
        (tokens[tokenIndex] as TokenWithColumnCount).meta?.columnCount ??
        colspanNum;
      break;
    } else if (tokens[tokenIndex].type === "td_open") {
      cellIndices.unshift(tokenIndex);
    }
  }

  // Find current row children indices
  for (let index = startIndex + 2; index < endIndex; index++) {
    if (tokens[index].type === "tr_close") {
      end = index;
      break;
    } else if (tokens[index].type === "td_open") {
      cellIndices.push(index);
    }
  }

  const cellOffset = cellIndices.indexOf(startIndex);

  const realColspan = Math.min(colspan, colspanNum - cellOffset);

  if (colspan > realColspan) {
    startToken.attrSet("colspan", realColspan.toString());
  }

  const hiddenStartIndex = cellIndices.slice(
    colspanNum + 1 - columnCount - realColspan,
  )[0];

  for (let index = hiddenStartIndex; index < end; index++) {
    if (!tokens[index].hidden) hideTokenContent(tokens[index]);
  }
};

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

      const columnCount = Number(
        (tokens[tbodyOpenIndex] as TokenWithColumnCount).meta?.columnCount ?? 0,
      );

      if (columnCount < 2) return;

      const maxLevel = tokens[index].level + 2;

      for (
        let currentIndex = tbodyOpenIndex;
        currentIndex < index;
        currentIndex++
      ) {
        if (tokens[currentIndex].level > maxLevel) continue;

        const token = tokens[currentIndex];
        const rowspan = token.hidden ? 0 : Number(token.attrGet("rowspan"));
        const colspan = token.hidden ? 0 : Number(token.attrGet("colspan"));

        if (rowspan > 1) {
          handleRowspan(
            tokens,
            currentIndex,
            index,
            columnCount,
            colspan,
            rowspan,
          );
        }

        if (token.type === "tr_open") {
          handleTableRow(tokens, currentIndex, index);
        }

        if (colspan > 1) {
          handleColspan(
            tokens,
            currentIndex,
            index,
            columnCount,
            colspan,
            tbodyOpenIndex,
          );
        }
      }
    },
  },
];
