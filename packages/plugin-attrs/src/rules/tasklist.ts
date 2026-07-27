import type MarkdownIt from "markdown-it";

import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, createDelimiterChecker } from "../helper/index.js";
import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";

// List rules for task list plugins that wrap item contents in a label (e.g.
// @mdit/plugin-tasklist): the trailing label closing token hides the attribute
// text from the standard list rules
export const createTasklistRules = (md: MarkdownIt, options: DelimiterConfig): AttrRule[] => {
  const isSpace = md.utils.isSpace;
  const allowed = options.allowed;

  return [
    /** - Task \n {.a} */
    defineAttrRule({
      name: "tasklist softbreak",
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
              position: -3,
              type: "softbreak",
            },
            {
              position: -2,
              type: "text",
              content: createDelimiterChecker(options, "only"),
            },
            {
              position: -1,
              type: "label_close",
            },
          ],
        },
      ],
      transform: (tokens, index, childIndex, range): void => {
        // childIndex points at label_close - the attribute text sits before it
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const childTokens = tokens[index].children!;
        const token = childTokens[childIndex - 1];

        let listOpenIndex = index - 2;

        // Find the list opening token - a list item always has an enclosing
        // list, so the scan cannot run past the start of the stream
        while (
          tokens[listOpenIndex - 1].type !== "ordered_list_open" &&
          tokens[listOpenIndex - 1].type !== "bullet_list_open"
        )
          listOpenIndex--;

        // Apply attributes to the list opening token
        addAttrs(tokens[listOpenIndex - 1], token.content, range, allowed);

        // Remove the attribute tokens from inside the label
        childTokens.splice(childIndex - 2, 2);
      },
    }),

    /** - End of {.task-item} */
    defineAttrRule({
      name: "tasklist item end",
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
              type: "text",
              content: createDelimiterChecker(options, "end"),
            },
            {
              position: -1,
              type: "label_close",
            },
          ],
        },
      ],
      transform: (tokens, index, childIndex, range): void => {
        // childIndex points at label_close - the attribute text sits before it
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const token = tokens[index].children![childIndex - 1];
        const content = token.content;
        const attrStartIndex = range[0] - options.left.length;
        const hasTrailingSpace = isSpace(content.charCodeAt(attrStartIndex - 1));

        // Apply attributes to the list item opening token
        addAttrs(tokens[index - 2], content, range, allowed);

        // Remove attribute syntax from content
        token.content = content.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
      },
    }),
  ];
};
