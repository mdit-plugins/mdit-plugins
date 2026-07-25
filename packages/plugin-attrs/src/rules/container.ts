import type MarkdownIt from "markdown-it";

import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, createDelimiterChecker } from "../helper/index.js";
import type { AttrRule } from "./types.js";
import { defineAttrRule } from "./types.js";

export const createContainerRule = (md: MarkdownIt, options: DelimiterConfig): AttrRule => {
  const isSpace = md.utils.isSpace;

  /**
   * Block tokens carrying attributes on their info line, e.g. containers from
   * `@mdit/plugin-container` or `markdown-it-container`
   *
   * ```md
   * ::: warning {.custom-class #custom-id}
   * content
   * :::
   * ```
   */
  return defineAttrRule({
    name: "container",
    tests: [
      {
        shift: 0,
        type: (type): boolean => type !== "fence",
        block: true,
        info: createDelimiterChecker(options, "end"),
      },
    ],
    transform: (tokens, index, _, range): void => {
      const attrStartIndex = range[0] - options.left.length;
      const token = tokens[index];
      const { info } = token;
      const hasTrailingSpace = isSpace(info.charCodeAt(attrStartIndex - 1));

      // Apply attributes to the current token
      addAttrs(token, info, range, options.allowed);

      // Remove the attribute syntax from info
      token.info = info.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
    },
  });
};
