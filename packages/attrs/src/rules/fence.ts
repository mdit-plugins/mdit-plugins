import type { Rule } from "./types.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  removeDelimiter,
} from "../helper/index.js";
import type { MarkdownItAttrsOptions } from "../options.js";

export const getFenceRule = (
  options: Required<MarkdownItAttrsOptions>,
): Rule => ({
  /**
   * fenced code blocks
   *
   * ```python {.cls}
   * for i in range(10):
   *     print(i)
   * ```
   */

  // fenced code blocks
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
    let lineNumber = "";

    // special handler for VuePress line number
    const results = /{(?:[\d,-]+)}/.exec(token.info);

    if (results) {
      token.info = token.info.replace(results[0], "");
      lineNumber = results[0];
    }

    const attrs = getAttrs(
      token.info,
      token.info.lastIndexOf(options.left),
      options,
    );

    addAttrs(attrs, token);
    token.info = `${removeDelimiter(
      token.info,
      options.left,
      options.right,
    )} ${lineNumber}`.trim();
  },
});
