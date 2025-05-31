import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  removeDelimiter,
} from "../helper/index.js";

export const getFenceRule = (options: Required<DelimiterConfig>): AttrRule =>
  /**
   * fenced code blocks
   *
   * ```python {.cls}
   * for i in range(10):
   *     print(i)
   * ```
   */
  ({
    name: "code-block",
    tests: [
      {
        shift: 0,
        block: true,
        info: getDelimiterChecker(options, "end"),
      },
    ],
    transform: (tokens, index): void => {
      const token = tokens[index];
      let lineNumbers = "";

      // Special handler for VuePress line numbers syntax
      const lineNumberMatch = /{(?:[\d,-]+)}/.exec(token.info);

      if (lineNumberMatch) {
        token.info = token.info.replace(lineNumberMatch[0], "");
        lineNumbers = lineNumberMatch[0];
      }

      // Extract attributes from the token info
      const attributeStartIndex = token.info.lastIndexOf(options.left);
      const attributes = getAttrs(token.info, attributeStartIndex, options);

      // Apply attributes to the current token
      addAttrs(attributes, token);

      // Remove attribute syntax from info and restore line numbers
      const infoWithoutAttributes = removeDelimiter(
        token.info,
        options.left,
        options.right,
      );

      token.info = `${infoWithoutAttributes} ${lineNumbers}`.trim();
    },
  });
