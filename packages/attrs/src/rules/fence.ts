import type MarkdownIt from "markdown-it";

import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, createDelimiterChecker } from "../helper/index.js";

export const createFenceRule = (md: MarkdownIt, options: DelimiterConfig): AttrRule => {
  const isSpace = md.utils.isSpace;

  /**
   * fenced code blocks
   *
   * ```python {.cls}
   * for i in range(10):
   *     print(i)
   * ```
   */
  return defineAttrRule({
    name: "code-block",
    tests: [
      {
        shift: 0,
        block: true,
        info: createDelimiterChecker(options, "end"),
      },
    ],
    transform: (tokens, index, _, range): void => {
      const attrStartIndex = range[0] - options.left.length;
      const token = tokens[index];
      const { info } = token;
      const hasTrailingSpace = isSpace(info.charCodeAt(attrStartIndex - 1));

      // Apply attributes to the current token
      addAttrs(token, info, range, options.allowed);

      // Remove the attribute syntax from info
      token.info = info.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
    },
  });
};
