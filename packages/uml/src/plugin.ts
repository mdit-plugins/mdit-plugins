import { dedent } from "@mdit/helper";
import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";

import type { MarkdownItUMLOptions } from "./options.js";

export const uml: PluginWithOptions<MarkdownItUMLOptions> = (
  md,
  { name, open, close, render } = {
    name: "uml",
    open: "start",
    close: "end",
    render: (tokens, index): string => {
      const token = tokens[index];
      const { content, info, type } = token;

      return `<div class="${type}" title="${info}">${content}</div>`;
    },
  },
) => {
  const OPEN_MARKER = `@${open}`;
  const CLOSE_MARKER = `@${close}`;

  const umlRule: RuleBlock = (state, startLine, endLine, silent) => {
    let start = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    /*
     * Check out the first character quickly,
     * this should filter out most of non-uml blocks
     */
    if (state.src.charCodeAt(start) !== 64 /* @ */) return false;

    let index;

    // Check out the rest of the marker string
    for (index = 0; index < OPEN_MARKER.length; ++index)
      if (OPEN_MARKER[index] !== state.src[start + index]) return false;

    const markup = state.src.substring(start, start + index);
    const params = state.src.substring(start + index, max);

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

    let autoClosed = false;
    let nextLine = startLine;

    // Search for the end of the block
    while (
      // unclosed block should be auto closed by end of document.
      // also block seems to be auto closed by end of parent
      nextLine < endLine
    ) {
      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (start < max && state.sCount[nextLine] < state.blkIndent)
        // non-empty line with negative indent should stop the list:
        // - @umlstart
        //  test
        break;

      if (
        // didn’t find the closing fence
        state.src.charCodeAt(start) === 64 /* @ */ &&
        // closing fence should not be indented with respect of opening fence
        state.sCount[nextLine] <= state.sCount[startLine]
      ) {
        let closeMarkerMatched = true;

        for (index = 0; index < CLOSE_MARKER.length; ++index)
          if (CLOSE_MARKER[index] !== state.src[start + index]) {
            closeMarkerMatched = false;
            break;
          }

        if (
          closeMarkerMatched &&
          // make sure tail has spaces only
          state.skipSpaces(start + index) >= max
        ) {
          // found!
          autoClosed = true;
          break;
        }
      }

      nextLine++;
    }

    const contents = state.src
      .split("\n")
      .slice(startLine + 1, nextLine)
      .join("\n");

    const umlToken = state.push(name, "uml", 0);

    umlToken.block = true;
    umlToken.info = params;
    umlToken.content = dedent(contents);
    umlToken.map = [startLine, nextLine];
    umlToken.markup = markup;

    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

  md.block.ruler.before("fence", name, umlRule, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.renderer.rules[name] = render;
};
