import { escapeRegExp } from "@mdit/helper";

import type { Rule } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, getAttrs } from "../helper/index.js";

export const getHrRule = (options: Required<DelimiterConfig>): Rule => ({
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

    const { content } = tokens[index + 1];
    const start = content.lastIndexOf(options.left);
    const attrs = getAttrs(content, start, options);

    addAttrs(attrs, token);
    token.markup = content;
    tokens.splice(index + 1, 2);
  },
});
