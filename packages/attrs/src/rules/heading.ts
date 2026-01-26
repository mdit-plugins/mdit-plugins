import { isSpace } from "markdown-it/lib/common/utils.mjs";

import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, getDelimiterChecker, getMatchingOpeningToken } from "../helper/index.js";

export const getHeadingRule = (options: DelimiterConfig): AttrRule =>
  /**
   * ## end of {#heading}
   */
  defineAttrRule({
    name: "end of block",
    tests: [
      {
        shift: -1,
        type: "heading_open",
      },
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
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const { content } = token;
      const hasTrailingSpace = isSpace(content.charCodeAt(attrStartIndex - 1));

      // Get the corresponding opening token
      const openingToken = getMatchingOpeningToken(tokens, index + 1);

      // Apply attributes to the opening token
      addAttrs(openingToken, content, range, options.allowed);

      // Remove the attribute syntax from content
      token.content = content.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
    },
  });
