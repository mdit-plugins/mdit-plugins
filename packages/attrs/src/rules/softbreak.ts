import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, createDelimiterChecker, getMatchingOpeningToken } from "../helper/index.js";

export const createSoftBreakRule = (options: DelimiterConfig): AttrRule =>
  defineAttrRule({
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
            content: createDelimiterChecker(options, "only"),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex, range): void => {
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const childTokens = tokens[index].children!;
      const token = childTokens[childIndex];

      // Find the last closing tag by searching forward
      let closingTokenIndex = index + 1;

      while (tokens[closingTokenIndex + 1]?.nesting === -1) closingTokenIndex++;

      // Apply attributes to the opening token
      addAttrs(
        getMatchingOpeningToken(tokens, closingTokenIndex),
        token.content,
        range,
        options.allowed,
      );

      // Remove the softbreak and attribute tokens
      tokens[index].children = childTokens.slice(0, -2);
    },
  });
