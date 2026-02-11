import type MarkdownIt from "markdown-it";

import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, createDelimiterChecker, getMatchingOpeningToken } from "../helper/index.js";

export const createBlockRule = (md: MarkdownIt, options: DelimiterConfig): AttrRule => {
  const isSpace = md.utils.isSpace;

  /**
   * end of {.block}
   */
  return defineAttrRule({
    name: "end of block",
    tests: [
      {
        shift: 0,
        type: "inline",
        children: [
          {
            position: -1,
            content: createDelimiterChecker(options, "end"),
            type: (type) => type !== "code_inline" && type !== "math_inline",
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex, range): void => {
      const attrStartIndex = range[0] - options.left.length;
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const { content } = token;
      const hasTrailingSpace = isSpace(content.charCodeAt(attrStartIndex - 1));

      // Find the closing token by skipping all nested closing tokens
      let closingTokenIndex = index + 1;

      while (tokens[closingTokenIndex + 1]?.nesting === -1) closingTokenIndex++;

      // Get the corresponding opening token
      const openingToken = getMatchingOpeningToken(tokens, closingTokenIndex);

      // Apply attributes to the opening token
      addAttrs(openingToken, content, range, options.allowed);

      // Remove the attribute syntax from content
      token.content = content.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
    },
  });
};
