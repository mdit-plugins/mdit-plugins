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
      `<details><summary>${tokens[index].info.trim()}</summary>\n`,
    closeRender = (): string => "</details>\n",
    codeRender,
    contentOpenRender,
    contentCloseRender,
    beforeContent = false,
  } = {},
) => {
  const demoRule: RuleBlock = (state, startLine, endLine, silent) => {
    let start = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    if (state.src.charAt(start) !== ":") return false;

    let pos = start + 1;

    // Check out the rest of the marker string
    while (pos <= max) {
      if (state.src.charAt(pos) !== ":") break;
      pos++;
    }

    const markerCount = pos - start;

    if (markerCount < MIN_MARKER_NUM) return false;

    const markup = state.src.slice(start, pos);
    const params = state.src.slice(pos, max);

    if (params.trim().split(" ", 2)[0] !== name) return false;

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

    let nextLine = startLine;
    let autoClosed = false;

    // Search for the end of the block
    while (
      // unclosed block should be auto closed by end of document.
      // also block seems to be auto closed by end of parent
      nextLine < endLine
    ) {
      nextLine++;
      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (start < max && state.sCount[nextLine] < state.blkIndent)
        // non-empty line with negative indent should stop the list:
        // - :::
        //  test
        break;

      if (
        // match start
        ":" === state.src[start] &&
        // closing fence should be indented less than 4 spaces
        state.sCount[nextLine] - state.blkIndent < 4
      ) {
        // check rest of marker
        for (pos = start + 1; pos <= max; pos++)
          if (":" !== state.src[pos]) break;

        // closing code fence must be at least as long as the opening one
        if (Math.floor(pos - start) >= markerCount) {
          // make sure tail has spaces only
          pos = state.skipSpaces(pos);

          if (pos >= max) {
            // found!
            autoClosed = true;
            break;
          }
        }
      }
    }

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;

    // @ts-expect-error We are creating a new type called "demo"
    state.parentType = "demo";

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    const title = params.trim().slice(name.length).trim();
    const openToken = state.push("demo_open", "div", 1);

    openToken.markup = markup;
    openToken.block = true;
    openToken.info = title;
    openToken.map = [startLine, nextLine];

    const pushCodeToken = (): void => {
      const codeToken = state.push(
        codeRender ? "demo_code" : "fence",
        "code",
        0,
      );

      const indent = state.sCount[startLine];

      codeToken.content = state.src
        .split(/\n\r?/)
        .slice(startLine + 1, nextLine)
        .map((line) => line.substring(indent))
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

    if (beforeContent) pushCodeToken();

    const contentOpenToken = state.push("demo_content_open", "div", 1);

    contentOpenToken.attrPush(["class", "demo-content"]);
    contentOpenToken.block = true;
    openToken.map = [startLine, nextLine];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    const contentCloseToken = state.push("demo_content_close", "div", -1);

    contentCloseToken.block = true;

    if (!beforeContent) pushCodeToken();

    const closeToken = state.push(`demo_close`, "div", -1);

    closeToken.markup = state.src.slice(start, pos);
    closeToken.block = true;
    closeToken.info = title;

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

  md.block.ruler.before("fence", "demo", demoRule, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
  md.renderer.rules.demo_open = openRender;
  md.renderer.rules.demo_close = closeRender;
  if (codeRender) md.renderer.rules.demo_code = codeRender;
  if (contentOpenRender)
    md.renderer.rules.demo_content_open = contentOpenRender;
  if (contentCloseRender)
    md.renderer.rules.demo_content_close = contentCloseRender;
};
