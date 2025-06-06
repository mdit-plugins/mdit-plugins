import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

export const getListRules = (
  options: Required<DelimiterConfig>,
): AttrRule[] => [
  /**
   * - item
   * {.a}
   */
  {
    name: "list softbreak",
    tests: [
      {
        shift: -2,
        type: "list_item_open",
      },
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
      let listOpenIndex = index - 2;

      // Find the list opening token
      while (
        tokens[listOpenIndex - 1] &&
        tokens[listOpenIndex - 1].type !== "ordered_list_open" &&
        tokens[listOpenIndex - 1].type !== "bullet_list_open"
      ) {
        listOpenIndex--;
      }

      // Apply attributes to the list opening token
      addAttrs(attrs, tokens[listOpenIndex - 1]);

      // Remove the attribute tokens from children
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tokens[index].children = tokens[index].children!.slice(0, -2);
    },
  },

  /**
   * - nested list
   *   - with double \n
   *   {.a} <-- apply to nested ul
   *
   * {.b} <-- apply to root <ul>
   */
  {
    name: "list double softbreak",
    tests: [
      {
        // let this token be i = 0 so that we can erase
        // the <p>{.a}</p> tokens below
        shift: 0,
        type: (type) =>
          type === "bullet_list_close" || type === "ordered_list_close",
      },
      {
        shift: 1,
        type: "paragraph_open",
      },
      {
        shift: 2,
        type: "inline",
        content: getDelimiterChecker(options, "only"),
        children: (children) => children.length === 1,
      },
      {
        shift: 3,
        type: "paragraph_close",
      },
    ],
    transform: (tokens, index): void => {
      const token = tokens[index + 2];
      const attrs = getAttrs(token.content, 0, options);
      const openingToken = getMatchingOpeningToken(tokens, index);

      // Apply attributes to the opening token
      addAttrs(attrs, openingToken);

      // Remove the paragraph tokens containing the attributes
      tokens.splice(index + 1, 3);
    },
  },

  /**
   * - end of {.list-item}
   */
  {
    name: "list item end",
    tests: [
      {
        shift: -2,
        type: "list_item_open",
      },
      {
        shift: 0,
        type: "inline",
        children: [
          {
            position: -1,
            type: "text",
            content: getDelimiterChecker(options, "end"),
          },
        ],
      },
    ],
    transform: (tokens, index, childIndex): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const { content } = token;

      // Extract attributes from the content
      const attrStartIndex = content.lastIndexOf(options.left);
      const attrs = getAttrs(content, attrStartIndex, options);

      // Apply attributes to the list item opening token
      addAttrs(attrs, tokens[index - 2]);

      // Remove attribute syntax from content
      const contentWithoutAttributes = content.slice(0, attrStartIndex);
      const hasTrailingSpace =
        contentWithoutAttributes[contentWithoutAttributes.length - 1] === " ";

      token.content = hasTrailingSpace
        ? contentWithoutAttributes.slice(0, -1)
        : contentWithoutAttributes;
    },
  },
];
