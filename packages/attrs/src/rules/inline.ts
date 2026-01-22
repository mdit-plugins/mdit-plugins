import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, getDelimiterChecker, getMatchingOpeningToken } from "../helper/index.js";

export const getInlineRules = (options: DelimiterConfig): AttrRule[] => [
  /**
   * bla `click()`{.c} ![](img.png){.d}
   *
   * differs from 'inline attributes' as it does
   * not have a closing tag (nesting: -1)
   */
  {
    name: "inline nesting self-close",
    tests: [
      {
        shift: 0,
        type: "inline",
        children: [
          {
            shift: -1,
            type: (str) => str === "image" || str === "code_inline",
          },
          {
            shift: 0,
            type: "text",
            content: getDelimiterChecker(options, "start"),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex, range): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const childTokens = tokens[index].children!;
      const token = childTokens[childIndex];
      const targetToken = childTokens[childIndex - 1];
      const attrsEndIndex = options.right.length + range[1];

      // Apply attributes to the target token
      addAttrs(targetToken, token.content, range, options.allowed);

      if (token.content.length === attrsEndIndex) {
        childTokens.splice(childIndex, 1);
      } else {
        token.content = token.content.slice(attrsEndIndex);
      }
    },
  },

  /**
   * *emphasis*{.with attrs=1}
   */
  {
    name: "inline attributes",
    tests: [
      {
        shift: 0,
        type: "inline",
        children: [
          {
            shift: -1,
            nesting: -1, // closing inline tag, </em>{.a}
          },
          {
            shift: 0,
            type: "text",
            content: getDelimiterChecker(options, "start"),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex, range): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const childTokens = tokens[index].children!;
      const currentToken = childTokens[childIndex];
      const { content } = currentToken;
      const attrsEndIndex = options.right.length + range[1];

      // Find the corresponding opening token
      const openingToken = getMatchingOpeningToken(childTokens, childIndex - 1);

      // Apply attributes to the opening token
      addAttrs(openingToken, content, range, options.allowed);

      // Remove attribute syntax from content
      currentToken.content = content.slice(attrsEndIndex);
    },
  },
];
