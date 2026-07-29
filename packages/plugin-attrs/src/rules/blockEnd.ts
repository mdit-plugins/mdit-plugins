import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";

import type { DelimiterConfig } from "../helper/index.js";
import { addAttrs, createDelimiterChecker, getMatchingOpeningToken } from "../helper/index.js";
import type { AttrRule, DelimiterRange } from "./types.js";
import { defineAttrRule } from "./types.js";

export const createBlockEndRule = (md: MarkdownIt, options: DelimiterConfig): AttrRule => {
  const isSpace = md.utils.isSpace;
  const isWhiteSpace = md.utils.isWhiteSpace;
  const endDelimiterChecker = createDelimiterChecker(options, "end");

  // Non-allocating whitespace-only check (markdown-it's whitespace set)
  const isWhitespaceOnly = (content: string): boolean => {
    for (let index = 0; index < content.length; index++)
      if (!isWhiteSpace(content.charCodeAt(index))) return false;

    return true;
  };

  // Find the last meaningful text child - the one end-of-block attributes live on - skipping
  // trailing whitespace-only text and balanced tag pairs (e.g. an appended permalink); returns -1
  // when inline code / math or an unmatched opening tag is found first
  const findEndOfBlockChild = (children: Token[]): number => {
    const lastIndex = children.length - 1;

    if (lastIndex >= 0) {
      const lastChild = children[lastIndex];

      // Fast path: no tokens were appended after the attribute text
      if (lastChild.type === "text" && !isWhitespaceOnly(lastChild.content)) return lastIndex;
    }

    let depth = 0;

    for (let index = lastIndex; index >= 0; index--) {
      const child = children[index];

      if (child.type === "code_inline" || child.type === "math_inline") return -1;

      // A closing tag enters a nested structure while scanning backwards
      if (child.nesting === -1) {
        depth++;
        continue;
      }

      // An opening tag leaves it; bail out on unmatched ones
      if (child.nesting === 1 && --depth < 0) return -1;

      // Skip nested, non-text and whitespace-only children
      if (depth > 0 || child.type !== "text" || isWhitespaceOnly(child.content)) continue;

      return index;
    }

    return -1;
  };

  // Captured by the children test and reused by the transform, which always
  // runs right after a match, to avoid scanning the children twice
  let endOfBlockChildIndex = -1;

  /** End of {.block} */
  return defineAttrRule({
    name: "end of block",
    tests: [
      {
        shift: 0,
        type: "inline",
        children: (children): DelimiterRange | false => {
          endOfBlockChildIndex = findEndOfBlockChild(children);

          return endOfBlockChildIndex === -1
            ? false
            : endDelimiterChecker(children[endOfBlockChildIndex].content);
        },
      },
    ],
    transform: (tokens, index, _, range): void => {
      // oxlint-disable-next-line typescript/no-non-null-assertion
      const token = tokens[index].children![endOfBlockChildIndex];
      const attrStartIndex = range[0] - options.left.length;
      const { content } = token;
      const hasTrailingSpace = isSpace(content.charCodeAt(attrStartIndex - 1));

      // Get the corresponding opening token of the innermost wrapper - its
      // closing token sits right after the inline token (unlike the softbreak
      // rule, this never climbs to an outer ancestor)
      const openingToken = getMatchingOpeningToken(tokens, index + 1);

      // Apply attributes to the opening token
      addAttrs(openingToken, content, range, options.filter);

      // Remove the attribute syntax from content
      token.content = content.slice(0, hasTrailingSpace ? attrStartIndex - 1 : attrStartIndex);
    },
  });
};
