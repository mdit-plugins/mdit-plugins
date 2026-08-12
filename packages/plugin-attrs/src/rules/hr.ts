import type { MarkdownIt } from "markdown-it";

import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, createDelimiterChecker } from "../helper/index.js";
import type { AttrRule, DelimiterRange } from "./types.js";
import { defineAttrRule } from "./types.js";

export const createHrRule = (md: MarkdownIt, options: DelimiterConfig): AttrRule => {
  const isSpace = md.utils.isSpace;
  const endDelimiterChecker = createDelimiterChecker(options, "end");

  return defineAttrRule({
    /** Horizontal rule --- {#id} */
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

          if (markerCode !== 45 /** - */ && markerCode !== 42 && markerCode !== 95 /** _ */)
            return false;

          let count = 1;

          while (pos < content.length) {
            charCode = content.charCodeAt(pos++);
            if (charCode !== markerCode) break;

            count++;
          }

          if (count < 3) return false;

          if (!isSpace(content.charCodeAt(pos - 1))) pos--;

          const range = endDelimiterChecker(content);

          // attrs must directly follow the marker run, or the transform would drop the extra text
          return range !== false && range[0] - options.left.length === pos ? range : false;
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
      addAttrs(token, content, range, options.filter);
      token.markup = content;

      // Remove the inline and closing paragraph tokens
      tokens.splice(index + 1, 2);
    },
  });
};
