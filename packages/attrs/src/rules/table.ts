import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

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
];
