import type { Rule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

export const getBlockRule = (options: Required<DelimiterConfig>): Rule => ({
  /**
   * end of {.block}
   */

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
  transform: (tokens, indx, childIndex): void => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const token = tokens[indx].children![childIndex];
    const { content } = token;
    const attrs = getAttrs(content, content.lastIndexOf(options.left), options);
    let ii = indx + 1;

    while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) ii++;

    const openingToken = getMatchingOpeningToken(tokens, ii);

    addAttrs(attrs, openingToken);

    const trimmed = content.slice(0, content.lastIndexOf(options.left));

    token.content =
      trimmed[trimmed.length - 1] === " " ? trimmed.slice(0, -1) : trimmed;
  },
});
