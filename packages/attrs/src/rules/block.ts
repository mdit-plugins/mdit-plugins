import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

export const getBlockRule = (options: Required<DelimiterConfig>): AttrRule =>
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
    transform: (tokens, index, childIndex): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const { content } = token;

      // Extract attributes from the content
      const attrStartIndex = content.lastIndexOf(options.left);
      const attrs = getAttrs(content, attrStartIndex, options);

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
      addAttrs(attrs, openingToken);

      // Remove the attribute syntax from content
      const contentWithoutAttributes = content.slice(0, attrStartIndex);
      const hasTrailingSpace =
        contentWithoutAttributes[contentWithoutAttributes.length - 1] === " ";

      token.content = hasTrailingSpace
        ? contentWithoutAttributes.slice(0, -1)
        : contentWithoutAttributes;
    },
  });
