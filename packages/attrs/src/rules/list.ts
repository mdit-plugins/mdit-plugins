import type { Rule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";

export const getListRules = (options: Required<DelimiterConfig>): Rule[] => [
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
    transform: (tokens, indx, childIndex): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[indx].children![childIndex];
      const attrs = getAttrs(token.content, 0, options);
      let ii = indx - 2;

      while (
        tokens[ii - 1] &&
        tokens[ii - 1].type !== "ordered_list_open" &&
        tokens[ii - 1].type !== "bullet_list_open"
      )
        ii--;

      addAttrs(attrs, tokens[ii - 1]);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tokens[indx].children = tokens[indx].children!.slice(0, -2);
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

      addAttrs(attrs, openingToken);
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
      const attrs = getAttrs(
        content,
        content.lastIndexOf(options.left),
        options,
      );

      addAttrs(attrs, tokens[index - 2]);

      const trimmed = content.slice(0, content.lastIndexOf(options.left));

      token.content =
        trimmed[trimmed.length - 1] === " " ? trimmed.slice(0, -1) : trimmed;
    },
  },
];
