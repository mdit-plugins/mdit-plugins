import type { Rule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

export const getSoftBreakRule = (options: Required<DelimiterConfig>): Rule => ({
  /**
   * something with softbreak
   * {.cls}
   */

  name: "\n{.a} softbreak then curly in start",
  tests: [
    {
      shift: 0,
      type: "inline",
      children: [
        {
          position: -2,
          type: "softbreak",
        },
        {
          position: -1,
          type: "text",
          content: getDelimiterChecker(options, "only"),
        },
      ],
    },
  ],
  transform: (tokens, index, childIndex): void => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const token = tokens[index].children![childIndex];
    const attrs = getAttrs(token.content, 0, options);

    // find last closing tag
    let ii = index + 1;

    while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) ii++;

    const openingToken = getMatchingOpeningToken(tokens, ii);

    addAttrs(attrs, openingToken);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tokens[index].children = tokens[index].children!.slice(0, -2);
  },
});
