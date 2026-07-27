import type MarkdownIt from "markdown-it";

import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, createDelimiterChecker, getMatchingOpeningToken } from "../helper/index.js";
import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";

export const createBlockEndRule = (md: MarkdownIt, options: DelimiterConfig): AttrRule => {
  const isSpace = md.utils.isSpace;

  /** End of {.block} */
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

      // Get the corresponding opening token of the innermost wrapper - its
      // closing token sits right after the inline token (unlike the softbreak
      // rule, this never climbs to an outer ancestor)
      const openingToken = getMatchingOpeningToken(tokens, index + 1);

      // Apply attributes to the opening token
      addAttrs(openingToken, content, range, options.allowed);

      // Remove the attribute syntax from content
      token.content = content.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
    },
  });
};
