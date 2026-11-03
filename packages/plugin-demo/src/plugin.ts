import { hasRule, scanFence } from "@mdit/helper";
import type { BlockRule, PluginWithOptions } from "@mdit/helper";
import type { Token } from "markdown-it";

import type { MarkdownItDemoOptions } from "./options.js";

const MIN_MARKER_NUM = 3;

// Hoisted to module scope so no RegExp object is allocated per content line of every demo block.
// Matches both the nonce-form include markers and the legacy literal ones.
const INCLUDE_MARKER_RE = /^\s*<!-- #include-env-(?:start:(?:[^:]+: )?.*|end(?::[^:]+)?) -->$/;

/**
 * Extract the source code displayed by a demo block in a single pass over `src`.
 *
 * The range starts at the end of the opening marker line and ends at the end of the last content
 * line. The opening line is skipped, every remaining line is dedented by `indent` characters,
 * include markers are dropped, and leading/trailing blank lines are trimmed (the result always ends
 * with exactly one newline).
 *
 * @param src - Source string / 源字符串
 * @param start - Start position of the code range / 代码范围的起始位置
 * @param end - End position of the code range / 代码范围的结束位置
 * @param indent - Characters to remove from every line / 每行需要移除的缩进字符数
 * @returns Demo source code / 示例源码
 */
const extractDemoCode = (src: string, start: number, end: number, indent: number): string => {
  // The range starts with the line break that terminates the opening marker line, which belongs
  // to the dropped first segment of a split on `/\n\r?/`.
  let pos = start;

  /* istanbul ignore next -- callers pass `eMarks[startLine]`, so the range starts at a line break */
  while (pos < end && src.charCodeAt(pos) !== 10 /* \n */) pos++;

  let code = "";
  let pendingEmptyLines = 0;
  let hasCode = false;

  if (pos < end) {
    // Skip the line break itself: `\n` optionally followed by `\r`.
    pos += 1;
    if (pos < end && src.charCodeAt(pos) === 13 /* \r */) pos += 1;

    while (pos < end) {
      let lineEnd = pos;

      while (lineEnd < end && src.charCodeAt(lineEnd) !== 10 /* \n */) lineEnd++;

      // `line.slice(indent)` is empty when the line is shorter than the indentation.
      const lineStart = pos + indent;
      const line = src.slice(lineStart < lineEnd ? lineStart : lineEnd, lineEnd);

      // this is a workaround to work with include plugin
      if (!INCLUDE_MARKER_RE.test(line)) {
        if (line.length === 0) {
          // Empty lines only matter between two code lines; leading ones are trimmed by the
          // leading `\n+` trim and trailing ones collapse into the final newline.
          if (hasCode) pendingEmptyLines += 1;
        } else {
          if (hasCode) code += "\n".repeat(pendingEmptyLines + 1);

          code += line;
          hasCode = true;
          pendingEmptyLines = 0;
        }
      }

      if (lineEnd === end) break;

      pos = lineEnd + 1;
      if (pos < end && src.charCodeAt(pos) === 13 /* \r */) pos += 1;
    }
  }

  // Both `replace(/^\n+/, "")` and `replace(/\n*$/, "\n")` are folded into the accumulation
  // above: leading empty lines were skipped and trailing ones collapse into this newline.
  return `${code}\n`;
};

/**
 * Demo block plugin, rendering `::: demo` blocks with both the source code and the result
 *
 * 示例块插件，渲染 `::: demo` 块，同时展示源码与渲染结果
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param options - Demo options / 示例选项
 */
// oxlint-disable-next-line max-lines-per-function
export const demo: PluginWithOptions<MarkdownItDemoOptions> = (
  md,
  {
    name = "demo",
    openRenderer = (tokens: Token[], index: number): string =>
      `<details><summary>${md.renderInline(tokens[index].info)}</summary>\n`,
    closeRenderer = (): string => "</details>\n",
    codeRenderer,
    contentOpenRenderer,
    contentCloseRenderer,
    showCodeFirst = false,
  } = {},
) => {
  // oxlint-disable-next-line max-lines-per-function
  const demoRule: BlockRule = (state, startLine, endLine, silent) => {
    const currentLineStart = state.bMarks[startLine] + state.tShift[startLine];
    const currentLineMax = state.eMarks[startLine];
    const currentLineIndent = state.sCount[startLine];

    if (state.src.charCodeAt(currentLineStart) !== 58 /* : */) return false;

    // check the minimal length of container
    if (currentLineMax - currentLineStart < MIN_MARKER_NUM + name.length) return false;

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

    const titleEnd = state.skipSpacesBack(currentLineMax, pos);
    const hasTitle = titleEnd > nameEnd;
    let titleStart = -1;

    if (hasTitle) {
      titleStart = state.skipSpaces(nameEnd);
      if (titleStart === nameEnd) return false;
    }

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

      if (nextLineStart < nextLineMax && state.sCount[nextLine] < currentLineIndent) {
        // non-empty line with negative indent should stop the list:
        // - :::
        //  test
        break;
      }

      // Markers inside fenced code blocks are literal text, skip them. Like plugin-tab and
      // plugin-field this uses the container's indentation as the fence base; a fence opened
      // inside a list item has a larger markdown-it `blkIndent`, so its closing fence may not be
      // recognized here (a known limitation of this forward scan).
      const fenceEnd = scanFence(state, nextLine, endLine, currentLineIndent);

      if (fenceEnd != null && fenceEnd > nextLine) {
        nextLine = fenceEnd - 1;
        continue;
      }

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

    state.parentType = "demo";

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    // this will update the block indent
    state.blkIndent = currentLineIndent;

    const markup = ":".repeat(markerCount);
    const title = hasTitle ? state.src.slice(titleStart, titleEnd) : "Demo";
    const openToken = state.push(`${name}_demo_open`, "div", 1);

    openToken.markup = markup;
    openToken.block = true;
    openToken.info = title;
    openToken.map = [startLine, nextLine];

    const pushCodeToken = (): void => {
      const codeToken = state.push(codeRenderer ? `${name}_demo_code` : "fence", "code", 0);

      const indent = state.sCount[startLine];
      // The content of the block is the source between the opening and closing markers.
      // The extraction skips the line break that terminates the opening marker line, so the
      // range starts at `eMarks[startLine]`: do not switch to `eMarks[startLine] + 1`, that
      // changes raw LFCR (`\n\r`) handling.
      const contentStart = state.eMarks[startLine];
      const contentEnd = state.eMarks[nextLine - 1];

      codeToken.content = extractDemoCode(state.src, contentStart, contentEnd, indent);
      // the code content is the source between the opening and closing markers
      codeToken.map = [startLine + 1, nextLine];
      (codeToken.meta ??= {}).title = title;
      if (!codeRenderer) {
        codeToken.info = "md";
        codeToken.markup = "```";
      }
    };

    if (showCodeFirst) pushCodeToken();

    const contentOpenToken = state.push(`${name}_demo_content_open`, "div", 1);

    contentOpenToken.attrPush(["class", "demo-content"]);
    contentOpenToken.block = true;
    contentOpenToken.map = [startLine + 1, nextLine];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    const contentCloseToken = state.push(`${name}_demo_content_close`, "div", -1);

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

  const ruleName = `demo_${name}`;

  // Repeated installation with the same name must not register the rule twice; a differing
  // configuration for that name keeps the first installation's parse rule (renderers are still
  // refreshed). Different names register their own rule so they can coexist.
  if (!hasRule(md, ruleName, "block")) {
    md.block.ruler.before("fence", ruleName, demoRule, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });
  }

  md.renderer.rules[`${name}_demo_open`] = openRenderer;
  md.renderer.rules[`${name}_demo_close`] = closeRenderer;
  if (codeRenderer) md.renderer.rules[`${name}_demo_code`] = codeRenderer;

  if (contentOpenRenderer) md.renderer.rules[`${name}_demo_content_open`] = contentOpenRenderer;

  if (contentCloseRenderer) md.renderer.rules[`${name}_demo_content_close`] = contentCloseRenderer;
};
