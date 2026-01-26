import { isSpace } from "markdown-it/lib/common/utils.mjs";

import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, getDelimiterChecker, getMatchingOpeningToken } from "../helper/index.js";

export const getListRules = (options: DelimiterConfig): AttrRule[] => [
  /**
   * - item
   * {.a}
   */
  defineAttrRule({
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
    transform: (tokens, index, childIndex, range): void => {
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const childTokens = tokens[index].children!;
      const token = childTokens[childIndex];

      let listOpenIndex = index - 2;

      // Find the list opening token
      while (
        tokens[listOpenIndex - 1]?.type !== "ordered_list_open" &&
        tokens[listOpenIndex - 1].type !== "bullet_list_open"
      )
        listOpenIndex--;

      // Apply attributes to the list opening token
      addAttrs(tokens[listOpenIndex - 1], token.content, range, options.allowed);

      // Remove the attribute tokens from children
      tokens[index].children = childTokens.slice(0, -2);
    },
  }),

  /**
   * - nested list
   *   - with double \n
   *   {.a} <-- apply to nested ul
   *
   * {.b} <-- apply to root <ul>
   */
  defineAttrRule({
    name: "list double softbreak",
    tests: [
      {
        // let this token be i = 0 so that we can erase
        // the <p>{.a}</p> tokens below
        shift: 0,
        type: (type) => type === "bullet_list_close" || type === "ordered_list_close",
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
    transform: (tokens, index, _, range): void => {
      const token = tokens[index + 2];
      const openingToken = getMatchingOpeningToken(tokens, index);

      // Apply attributes to the opening token
      addAttrs(openingToken, token.content, range, options.allowed);

      // Remove the paragraph tokens containing the attributes
      tokens.splice(index + 1, 3);
    },
  }),

  /**
   * - end of {.list-item}
   */
  defineAttrRule({
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
    transform: (tokens, index, childIndex, range): void => {
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const token = tokens[index].children![childIndex];
      const content = token.content;
      const attrStartIndex = range[0] - options.left.length;
      const hasTrailingSpace = isSpace(content.charCodeAt(attrStartIndex - 1));

      // Apply attributes to the list item opening token
      addAttrs(tokens[index - 2], content, range, options.allowed);

      // Remove attribute syntax from content
      token.content = content.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
    },
  }),
];
