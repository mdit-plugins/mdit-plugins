import { escapeRegExp } from "@mdit/helper";

import type { AttrRule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, getAttrs } from "../helper/index.js";

export const getHrRule = (options: Required<DelimiterConfig>): AttrRule => ({
  /**
   * horizontal rule --- {#id}
   */
  name: "horizontal rule",
  tests: [
    {
      shift: 0,
      type: "paragraph_open",
    },
    {
      shift: 1,
      type: "inline",
      children: (children) => children.length === 1,
      content: (content) =>
        new RegExp(
          `^ {0,3}[-*_]{3,} ?${escapeRegExp(options.left)}[^${escapeRegExp(
            options.right,
          )}]`,
        ).test(content),
    },
    {
      shift: 2,
      type: "paragraph_close",
    },
  ],
  transform: (tokens, index): void => {
    const token = tokens[index];

    token.type = "hr";
    token.tag = "hr";
    token.nesting = 0;

    // Extract attributes from the inline content
    const inlineToken = tokens[index + 1];
    const { content } = inlineToken;
    const attributeStartIndex = content.lastIndexOf(options.left);
    const attributes = getAttrs(content, attributeStartIndex, options);

    // Apply attributes to the hr token
    addAttrs(attributes, token);
    token.markup = content;

    // Remove the inline and closing paragraph tokens
    tokens.splice(index + 1, 2);
  },
});
