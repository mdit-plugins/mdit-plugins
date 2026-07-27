import type MarkdownIt from "markdown-it";

import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, createDelimiterChecker, getMatchingOpeningToken } from "../helper/index.js";
import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";

// List rules for definition lists (@mdit/plugin-dl): dd contents are wrapped
// in (possibly hidden) paragraphs and no list_item_open exists, so neither the
// standard list rules nor the end-of-block rule can target the dd or dl
export const createDlRules = (md: MarkdownIt, options: DelimiterConfig): AttrRule[] => {
  const isSpace = md.utils.isSpace;
  const allowed = options.allowed;

  return [
    /** : Definition \n {.a} */
    defineAttrRule({
      name: "dl softbreak",
      tests: [
        {
          shift: -2,
          type: "dd_open",
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
              content: createDelimiterChecker(options, "only"),
            },
          ],
        },
      ],
      transform: (tokens, index, childIndex, range): void => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const childTokens = tokens[index].children!;
        const token = childTokens[childIndex];

        let dlOpenIndex = index - 2;

        // Find the definition list opening token - a dd always has an
        // enclosing dl, so the scan cannot run past the start of the stream
        while (tokens[dlOpenIndex - 1].type !== "dl_open") dlOpenIndex--;

        // Apply attributes to the definition list opening token
        addAttrs(tokens[dlOpenIndex - 1], token.content, range, allowed);

        // Remove the attribute tokens from children
        tokens[index].children = childTokens.slice(0, -2);
      },
    }),

    /** {.a} in its own paragraph after a definition list */
    defineAttrRule({
      name: "dl double softbreak",
      tests: [
        {
          shift: 0,
          type: "dl_close",
        },
        {
          shift: 1,
          type: "paragraph_open",
        },
        {
          shift: 2,
          type: "inline",
          content: createDelimiterChecker(options, "only"),
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

        // Apply attributes to the definition list opening token
        addAttrs(openingToken, token.content, range, allowed);

        // Remove the paragraph tokens containing the attributes
        tokens.splice(index + 1, 3);
      },
    }),

    /** : End of {.definition} */
    defineAttrRule({
      name: "dl item end",
      tests: [
        {
          // the dd's first paragraph: dd_open sits behind the paragraph_open
          shift: -2,
          type: "dd_open",
        },
        {
          shift: 0,
          type: "inline",
          children: [
            {
              position: -1,
              type: "text",
              content: createDelimiterChecker(options, "end"),
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

        // Apply attributes to the dd opening token - the end-of-block rule
        // cannot: its target is the paragraph, which is hidden in tight lists
        addAttrs(tokens[index - 2], content, range, allowed);

        // Remove attribute syntax from content
        token.content = content.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
      },
    }),
  ];
};
