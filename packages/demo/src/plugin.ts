import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { MarkdownItDemoOptions } from "./options.js";

const MIN_MARKER_NUM = 3;

export const demo: PluginWithOptions<MarkdownItDemoOptions> = (
  md,
  {
    name = "demo",
    openRender = (tokens: Token[], index: number): string =>
      `<details><summary>${tokens[index].info}</summary>\n`,
    closeRender = (): string => "</details>\n",
    codeRender,
    contentOpenRender,
    contentCloseRender,
    showCodeFirst = false,
  } = {},
) => {
  const demoRule: RuleBlock = (state, startLine, endLine, silent) => {
    const currentLineStart = state.bMarks[startLine] + state.tShift[startLine];
    const currentLineMax = state.eMarks[startLine];
    const currentLineIndent = state.sCount[startLine];

    if (state.src.charCodeAt(currentLineStart) !== 58 /* : */) return false;

    // check the minimal length of container
    if (currentLineMax - currentLineStart < MIN_MARKER_NUM + name.length)
      return false;

    let pos = currentLineStart + 1;

    // Check out the rest of the marker string
    while (pos <= currentLineMax) {
      if (state.src.charCodeAt(pos) !== 58 /* : */) break;
      pos++;
    }

    const markerCount = pos - currentLineStart;

    if (markerCount < MIN_MARKER_NUM) return false;

    pos = state.skipSpaces(pos);

    // check name is matched
    for (let i = 0; i < name.length; i++) {
      if (state.src.charCodeAt(pos) !== name.charCodeAt(i)) return false;
      pos++;
    }

    const nameEnd = pos;

    const titleStart = state.skipSpaces(nameEnd);

    if (titleStart === nameEnd) return false;

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

    let nextLine = startLine + 1;
    let autoClosed = false;

    // Search for the end of the block
    for (
      ;
      // nextLine should be accessible outside the loop,
      // unclosed block should be auto closed by end of document.
      // also block seems to be auto closed by end of parent
      nextLine < endLine;
      nextLine++
    ) {
      const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
      const nextLineMax = state.eMarks[nextLine];

      if (
        nextLineStart < nextLineMax &&
        state.sCount[nextLine] < currentLineIndent
      )
        // non-empty line with negative indent should stop the list:
        // - :::
        //  test
        break;

      if (
        // closing fence should be indented same as opening one
        state.sCount[nextLine] === currentLineIndent &&
        // match start
        state.src.charCodeAt(nextLineStart) === 58 /* : */
      ) {
        // check rest of marker
        for (pos = nextLineStart + 1; pos <= nextLineMax; pos++)
          if (state.src.charCodeAt(pos) !== 58 /* : */) break;

        // closing code fence must be at least as long as the opening one
        if (pos - nextLineStart >= markerCount) {
          // make sure tail has spaces only
          pos = state.skipSpaces(pos);

          if (pos >= nextLineMax) {
            // found!
            autoClosed = true;
            break;
          }
        }
      }
    }

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;

    // @ts-expect-error We are creating a new type called "demo"
    state.parentType = "demo";

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    // this will update the block indent
    state.blkIndent = currentLineIndent;

    const markup = ":".repeat(markerCount);
    const titleEnd = state.skipSpacesBack(currentLineMax, titleStart);
    const title = state.src.slice(titleStart, titleEnd);
    const openToken = state.push(`${name}_demo_open`, "div", 1);

    openToken.markup = markup;
    openToken.block = true;
    openToken.info = title;
    openToken.map = [startLine, nextLine];

    const pushCodeToken = (): void => {
      const codeToken = state.push(
        codeRender ? `${name}_demo_code` : "fence",
        "code",
        0,
      );

      const indent = state.sCount[startLine];

      codeToken.content = state.src
        .split(/\n\r?/)
        .slice(startLine + 1, nextLine)
        .map((line) => line.slice(indent))
        // this is a workaround to work with include plugin
        .filter(
          (line) => !/^<!-- #include-env-(?:start: .*|end) -->$/.test(line),
        )
        .join("\n")
        .replace(/^\n+/, "")
        .replace(/\n*$/, "\n");
      codeToken.map = [startLine, state.line];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (codeToken.meta ??= {}).title = title;
      if (!codeRender) codeToken.info = "md";
    };

    if (showCodeFirst) pushCodeToken();

    const contentOpenToken = state.push(`${name}_demo_content_open`, "div", 1);

    contentOpenToken.attrPush(["class", "demo-content"]);
    contentOpenToken.block = true;
    openToken.map = [startLine, nextLine];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    const contentCloseToken = state.push(
      `${name}_demo_content_close`,
      "div",
      -1,
    );

    contentCloseToken.block = true;

    if (!showCodeFirst) pushCodeToken();

    const closeToken = state.push(`${name}_demo_close`, "div", -1);

    closeToken.markup = markup;
    closeToken.block = true;
    closeToken.info = title;

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;
    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

  md.block.ruler.before("fence", "demo", demoRule, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
  md.renderer.rules[`${name}_demo_open`] = openRender;
  md.renderer.rules[`${name}_demo_close`] = closeRender;
  if (codeRender) md.renderer.rules[`${name}_demo_code`] = codeRender;
  if (contentOpenRender)
    md.renderer.rules[`${name}_demo_content_open`] = contentOpenRender;
  if (contentCloseRender)
    md.renderer.rules[`${name}_demo_content_close`] = contentCloseRender;
};
