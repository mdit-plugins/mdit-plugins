import { isSpace } from "markdown-it/lib/common/utils.mjs";

import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

export const getBlockRule = (options: DelimiterConfig): AttrRule =>
  /**
   * end of {.block}
   */
  ({
    name: "end of block",
    tests: [
      {
        shift: 0,
        type: "inline",
        children: [
          {
            position: -1,
            content: getDelimiterChecker(options, "end"),
            type: (type) => type !== "code_inline" && type !== "math_inline",
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex, range): void => {
      const attrStartIndex = range[0] - options.left.length;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const { content } = token;
      const hasTrailingSpace = isSpace(content.charCodeAt(attrStartIndex - 1));

      // Find the closing token by skipping all nested closing tokens
      let closingTokenIndex = index + 1;

      while (
        tokens[closingTokenIndex + 1] &&
        tokens[closingTokenIndex + 1].nesting === -1
      ) {
        closingTokenIndex++;
      }

      // Get the corresponding opening token
      const openingToken = getMatchingOpeningToken(tokens, closingTokenIndex);

      // Apply attributes to the opening token
      addAttrs(openingToken, content, range, options.allowed);

      // Remove the attribute syntax from content
      token.content = content.substring(
        0,
        hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex,
      );
    },
  });
