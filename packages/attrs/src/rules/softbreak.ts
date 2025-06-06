import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

export const getSoftBreakRule = (
  options: Required<DelimiterConfig>,
): AttrRule => ({
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

    // Find the last closing tag by searching forward
    let closingTokenIndex = index + 1;

    while (
      tokens[closingTokenIndex + 1] &&
      tokens[closingTokenIndex + 1].nesting === -1
    ) {
      closingTokenIndex++;
    }

    // Get the corresponding opening token
    const openingToken = getMatchingOpeningToken(tokens, closingTokenIndex);

    // Apply attributes to the opening token
    addAttrs(attrs, openingToken);

    // Remove the softbreak and attribute tokens
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tokens[index].children = tokens[index].children!.slice(0, -2);
  },
});
