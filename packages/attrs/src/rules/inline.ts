import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

export const getInlineRules = (
  options: Required<DelimiterConfig>,
): AttrRule[] => [
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
    transform: (tokens, index, childIndex): void => {
      const rightDelimiterLength = options.right.length;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[index].children![childIndex];

      const attrEndIndex = token.content.indexOf(options.right);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const targetToken = tokens[index].children![childIndex - 1];
      const attrs = getAttrs(token.content, 0, options);

      // Apply attributes to the target token
      addAttrs(attrs, targetToken);

      // Remove or update token content based on remaining content
      if (token.content.length === attrEndIndex + rightDelimiterLength) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tokens[index].children!.splice(childIndex, 1);
      } else {
        token.content = token.content.slice(
          attrEndIndex + rightDelimiterLength,
        );
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
    transform: (tokens, index, childIndex): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentToken = tokens[index].children![childIndex];
      const { content } = currentToken;

      // Extract attributes from the content
      const attributes = getAttrs(content, 0, options);

      // Find the corresponding opening token
      const openingToken = getMatchingOpeningToken(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tokens[index].children!,
        childIndex - 1,
      );

      // Apply attributes to the opening token
      addAttrs(attributes, openingToken);

      // Remove attribute syntax from content
      const attributeEndIndex =
        content.indexOf(options.right) + options.right.length;

      currentToken.content = content.slice(attributeEndIndex);
    },
  },
];
