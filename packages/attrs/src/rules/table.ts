import type Token from "markdown-it/lib/token.mjs";

import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

interface TokenWithMeta extends Token {
  meta:
    | {
        colsnum?: number;
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
      const tokenWithMeta = tokens[tokenIndex] as TokenWithMeta;

      tokenWithMeta.meta = { ...tokenWithMeta.meta };

      if (tokenWithMeta.meta.colsnum) {
        adjustedColumnCount -= 1;
      }

      tokenWithMeta.meta.colsnum = adjustedColumnCount;
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
  const token = tokens[startIndex] as TokenWithMeta;
  const expectedColumnCount = token.meta?.colsnum;

  if (!expectedColumnCount) return;

  // hide extra table cells in the row
  for (let index = startIndex, cellCount = 0; index < endIndex; index++) {
    const currentToken = tokens[index];

    // Count table cells in the row
    if (currentToken.type === "td_open") {
      cellCount += 1;
    }
    // break at end of table row
    else if (currentToken.type === "tr_close") {
      break;
    }

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
        (tokens[tokenIndex] as TokenWithMeta).meta?.colsnum ?? colspanNum;
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

  const startHideIndex = cellIndices.slice(
    colspanNum + 1 - columnCount - realColspan,
  )[0];

  for (let index = startHideIndex; index < end; index++) {
    if (!tokens[index].hidden) {
      hideTokenContent(tokens[index]);
    }
  }
};

export const getTableRules = (
  options: Required<DelimiterConfig>,
): AttrRule[] => [
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
    transform: (tokens, index): void => {
      const token = tokens[index + 2];
      const tableOpeningToken = getMatchingOpeningToken(tokens, index);
      const attrs = getAttrs(token.content, 0, options);

      // Apply attributes to the table opening token
      addAttrs(attrs, tableOpeningToken);

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
        shift: 0,
        type: "inline",
        children: [
          {
            shift: 0,
            type: "text",
            content: (content: string): boolean => {
              // Check if content contains attribute syntax and we're in a table cell context
              return (
                content.includes(options.left) &&
                content.includes(options.right)
              );
            },
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentToken = tokens[index].children![childIndex];
      const { content } = currentToken;

      // Find attribute syntax in the content
      const leftDelimiterIndex = content.lastIndexOf(options.left);
      const rightDelimiterIndex = content.indexOf(
        options.right,
        leftDelimiterIndex,
      );

      if (leftDelimiterIndex === -1 || rightDelimiterIndex === -1) {
        return;
      }

      // Check if we're in a table cell context by looking for parent th_open or td_open
      let tableCellToken = null;

      // Look for the table cell opening token in the current token stream
      for (let i = index - 1; i >= 0; i--) {
        if (tokens[i].type === "th_open" || tokens[i].type === "td_open") {
          tableCellToken = tokens[i];
          break;
        }
        // Stop if we encounter a table row or table end
        if (
          tokens[i].type === "tr_close" ||
          tokens[i].type === "tbody_close" ||
          tokens[i].type === "table_close"
        ) {
          break;
        }
      }

      // Not in a table cell context
      if (!tableCellToken) return;

      // Extract attributes from the content
      const attributes = getAttrs(content, leftDelimiterIndex, options);

      // Apply attributes to the table cell token
      addAttrs(attributes, tableCellToken);

      // Remove attribute syntax from content
      const beforeAttrs = content.substring(0, leftDelimiterIndex).trim();
      const afterAttrs = content.substring(
        rightDelimiterIndex + options.right.length,
      );

      currentToken.content = beforeAttrs + afterAttrs;
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
     * only `| A | B |` sets the colsnum metadata
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
      let currentIndex = index;

      // Find the matching tr_open token and count columns
      currentIndex--; // Start from the index before current
      while (currentIndex > 0) {
        const currentToken = tokens[currentIndex];

        if (currentToken === trOpenToken) {
          // Apply metadata to the token before tr_open
          const metaToken = tokens[currentIndex - 1] as TokenWithMeta;

          metaToken.meta = {
            ...metaToken.meta,
            colsnum: columnCount,
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
      const tbodyOpenToken = tokens[index + 2] as TokenWithMeta;

      tbodyOpenToken.meta = {
        ...tbodyOpenToken.meta,
        colsnum: columnCount,
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
        (tokens[tbodyOpenIndex] as TokenWithMeta).meta?.colsnum ?? 0,
      );

      if (columnCount < 2) return;

      const level = tokens[index].level + 2;

      for (
        let currentIndex = tbodyOpenIndex;
        currentIndex < index;
        currentIndex++
      ) {
        if (tokens[currentIndex].level > level) continue;

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
