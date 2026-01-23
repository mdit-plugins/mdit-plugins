import { isSpace } from "markdown-it/lib/common/utils.mjs";

import { defineAttarRule } from "./types.js";
import type { AttrRule, DelimiterRange } from "./types.js";
import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, getDelimiterChecker } from "../helper/index.js";

export const getHrRule = (options: DelimiterConfig): AttrRule =>
  defineAttarRule({
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
        content: (content): DelimiterRange | false => {
          let pos = 0;
          let charCode;
          const markerCode = content.charCodeAt(pos++);

          if (
            markerCode !== 45 /** - */ &&
            markerCode !== 42 /** * */ &&
            markerCode !== 95 /** _ */
          ) {
            return false;
          }

          let count = 1;

          while (pos < content.length) {
            charCode = content.charCodeAt(pos++);
            if (charCode !== markerCode) break;
            count++;
          }

          if (count < 3) return false;

          if (!isSpace(content.charCodeAt(pos - 1))) pos--;

          return getDelimiterChecker(options, "end")(content);
        },
      },
      {
        shift: 2,
        type: "paragraph_close",
      },
    ],
    transform: (tokens, index, _, range): void => {
      const token = tokens[index];
      // Extract attributes from the inline content
      const inlineToken = tokens[index + 1];
      const { content } = inlineToken;

      token.type = "hr";
      token.tag = "hr";
      token.nesting = 0;

      // Apply attributes to the hr token
      addAttrs(token, content, range, options.allowed);
      token.markup = content;

      // Remove the inline and closing paragraph tokens
      tokens.splice(index + 1, 2);
    },
  });
