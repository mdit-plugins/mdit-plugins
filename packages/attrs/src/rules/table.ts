import type { Rule } from "./types.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";
import type { MarkdownItAttrsOptions } from "../options.js";

export const getTableRules = (
  options: Required<MarkdownItAttrsOptions>,
): Rule[] => [
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
      const tableOpen = getMatchingOpeningToken(tokens, index);
      const attrs = getAttrs(token.content, 0, options);

      // add attributes
      addAttrs(attrs, tableOpen);
      // remove <p>{.c}</p>
      tokens.splice(index + 1, 3);
    },
  },
];
