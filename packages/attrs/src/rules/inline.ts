import type { Rule } from "./types.js";
import {
  addAttrs,
  getAttrs,
  getDelimiterChecker,
  getMatchingOpeningToken,
} from "../helper/index.js";
import type { MarkdownItAttrsOptions } from "../options.js";

export const getInlineRules = (
  options: Required<MarkdownItAttrsOptions>,
): Rule[] => [
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
      const rightLength = options.right.length;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = tokens[index].children![childIndex];

      const endChar = token.content.indexOf(options.right);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const attrToken = tokens[index].children![childIndex - 1];
      const attrs = getAttrs(token.content, 0, options);

      addAttrs(attrs, attrToken);
      if (token.content.length === endChar + rightLength) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tokens[index].children!.splice(childIndex, 1);
      } else {
        token.content = token.content.slice(endChar + rightLength);
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
      const token = tokens[index].children![childIndex];
      const { content } = token;
      const attrs = getAttrs(content, 0, options);
      const openingToken = getMatchingOpeningToken(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tokens[index].children!,
        childIndex - 1,
      );

      addAttrs(attrs, openingToken);
      token.content = content.slice(
        content.indexOf(options.right) + options.right.length,
      );
    },
  },
];
