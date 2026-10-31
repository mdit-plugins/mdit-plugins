import { escapeHtml, scanFence } from "@mdit/helper";
import type { BlockRule, PluginWithOptions } from "@mdit/helper";

import { AT, CONTAINER_DISPLAY, LAYOUT_COLUMN, layoutKey } from "./constant.js";
import { detectDirective, parseAttributes } from "./directive.js";
import type { MarkdownItLayoutOptions } from "./options.js";
import type { LayoutMeta, LayoutStateBlock } from "./types.js";
import { buildStyleString, resolveUtility } from "./utilities.js";

// `scanFence` is provided by @mdit/helper (forked and modified from
// markdown-it/lib/rules_block/fence.mjs).
//
// Directive scans run at the container/item level, before markdown-it's block rules
// re-tokenize nested content with a deeper blkIndent. They therefore have to recognize
// fenced and indented code blocks from the raw line array so that directives written as
// code examples stay literal.

/**
 * Check whether a line belongs to an indented code block for directive scanning.
 *
 * Mirrors markdown-it's `code` block rule: a line indented at least 4 spaces beyond `blkIndent` is
 * code, but an indented code block cannot interrupt a paragraph. The block therefore only starts at
 * the beginning of the scanned range or after a blank line, and continues over consecutive indented
 * lines.
 *
 * 判断某行是否属于缩进代码块：相对 `blkIndent` 缩进至少 4 个空格的行属于代码块，但代码块不能打断段落，只会在扫描范围起始处或空行之后开始。
 *
 * @param state - Parser state / 解析器状态
 * @param line - Line to check / 要检查的行
 * @param startLine - First line of the scanned range / 扫描范围的首行
 * @param blkIndent - Indent of the scanned container / 扫描容器的缩进
 * @returns Whether the line is indented code / 该行是否属于缩进代码块
 */
const isIndentedCodeLine = (
  state: LayoutStateBlock,
  line: number,
  startLine: number,
  blkIndent: number,
): boolean => {
  if (state.sCount[line] - blkIndent < 4) return false;

  // Walk back over consecutive indented lines: a blank line means the block starts here,
  // while a paragraph line means this line is a lazy continuation instead of code.
  for (let prevLine = line - 1; prevLine >= startLine; prevLine--) {
    if (state.isEmpty(prevLine)) return true;
    if (state.sCount[prevLine] - blkIndent < 4) return false;
  }

  // The block starts at the beginning of the scanned range.
  return true;
};

/**
 * Count matching container opens/ends to find the `@end` that closes the container opened at
 * startLine. Works at the same `@` depth.
 *
 * 通过计数匹配的容器开/闭来找到关闭 startLine 处容器的 `@end`。
 *
 * @param state - Parser state / 解析器状态
 * @param startLine - First line after the container open / 容器开始后的第一行
 * @param endLine - Search boundary / 搜索边界
 * @param depth - `@` depth of the container / 容器的 `@` 深度
 * @param blkIndent - Indent of the container / 容器的缩进
 * @returns Line number of matching `@end`, or endLine if not found / 匹配 `@end` 的行号，未找到则返回 endLine
 */
const findMatchingEnd = (
  state: LayoutStateBlock,
  startLine: number,
  endLine: number,
  depth: number,
  blkIndent: number,
): number => {
  let nesting = 1;

  const isSpace = state.md.utils.isSpace;

  for (let line = startLine; line < endLine; line++) {
    const lineStart = state.bMarks[line] + state.tShift[line];
    const lineMax = state.eMarks[line];

    // directives inside fenced code blocks are literal text, skip them
    const fenceEnd = scanFence(state, line, endLine, blkIndent);

    if (fenceEnd != null && fenceEnd > line) {
      line = fenceEnd - 1;
      continue;
    }

    if (lineStart >= lineMax) continue;
    if (state.src.charCodeAt(lineStart) !== AT) continue;

    // directives inside indented code blocks are literal text, skip them
    if (isIndentedCodeLine(state, line, startLine, blkIndent)) continue;

    const dir = detectDirective(state.src, lineStart, lineMax, isSpace);

    if (!dir || dir.depth !== depth) continue;

    if (dir.kind === "container") {
      nesting++;
    } else if (dir.kind === "end") {
      nesting--;
      if (nesting === 0) return line;
    }
  }

  return endLine;
};

const getItemRule = (): BlockRule => (state: LayoutStateBlock, startLine, endLine, silent) => {
  const ctx = state.env[layoutKey];

  if (!ctx || state.level !== ctx.level) return false;

  const isSpace = state.md.utils.isSpace;
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max, isSpace);

  if (
    !directive ||
    directive.kind !== "item" ||
    directive.type !== ctx.type ||
    directive.depth !== ctx.depth
  )
    return false;

  if (silent) return true;

  const indent = state.sCount[startLine];
  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max, isSpace);

  let nextLine = startLine + 1;
  let nesting = 0;

  // Search for the next item marker or end of container, counting nested containers
  for (; nextLine < endLine; nextLine++) {
    const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
    const nextLineMax = state.eMarks[nextLine];

    // Blank lines never end the item, tokenize skips them as well
    if (nextLineStart >= nextLineMax) continue;

    // directives inside indented code blocks are literal text, skip them
    if (isIndentedCodeLine(state, nextLine, startLine + 1, indent)) continue;

    const nextDirective =
      state.src.charCodeAt(nextLineStart) === AT
        ? detectDirective(state.src, nextLineStart, nextLineMax, isSpace)
        : null;

    if (state.sCount[nextLine] < indent) {
      // `state.blkIndent` is raised to `indent` for the item content, so tokenize
      // stops before any outdented line. Such a line must end the item so that its
      // content is parsed again by an upper container, unless it is an `@end` that
      // closes a nested container (directive indentation is flexible).
      const closesNestedContainer =
        nextDirective != null &&
        nextDirective.depth === ctx.depth &&
        nextDirective.kind === "end" &&
        nesting > 0;

      if (!closesNestedContainer) break;
    }

    // directives inside fenced code blocks are literal text, skip them
    const fenceEnd = scanFence(state, nextLine, endLine, indent);

    if (fenceEnd != null && fenceEnd > nextLine) {
      nextLine = fenceEnd - 1;
      continue;
    }

    if (nextDirective == null || nextDirective.depth !== ctx.depth) continue;

    if (nextDirective.kind === "container") nesting++;
    else if (nextDirective.kind === "end" && nesting > 0) nesting--;
    else if (nextDirective.kind === "item" && nextDirective.type === ctx.type && nesting === 0)
      break;
  }

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldBlkIndent = state.blkIndent;

  state.parentType = "layout_item";
  state.lineMax = nextLine;
  state.blkIndent = indent;

  const openToken = state.push("layout_item_open", "div", 1);

  openToken.block = true;
  openToken.map = [startLine, nextLine];
  openToken.meta = {
    type: directive.type,
    classes: parsedAttrs.classes,
    id: parsedAttrs.id,
    utilities: parsedAttrs.utilities,
  } satisfies LayoutMeta;

  state.md.block.tokenize(state, startLine + 1, nextLine);

  const closeToken = state.push("layout_item_close", "div", -1);

  closeToken.block = true;

  state.parentType = oldParent;
  state.lineMax = oldLineMax;
  state.blkIndent = oldBlkIndent;
  state.line = nextLine;

  return true;
};

const getContainerRule = (): BlockRule => (state: LayoutStateBlock, startLine, endLine, silent) => {
  const isSpace = state.md.utils.isSpace;
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max, isSpace);

  if (!directive || directive.kind !== "container") return false;

  const depth = directive.depth;
  const ctx = state.env[layoutKey];

  // Validate depth consistency
  if (ctx) {
    // Inside an existing container: prefix depth must be parent + 1, or 1 (same)
    if (depth > 1 && depth !== ctx.depth + 1) return false;
    if (depth === 1 && ctx.depth > 1) return false;
  } else if (depth > 1) {
    // Top level: only depth 1 allowed
    return false;
  }

  if (silent) return true;

  const indent = state.sCount[startLine];
  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max, isSpace);
  const nextLine = findMatchingEnd(state, startLine + 1, endLine, depth, indent);

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldBlkIndent = state.blkIndent;
  const oldLayout = state.env[layoutKey];

  state.parentType = "layout_container";
  state.lineMax = nextLine;
  state.blkIndent = indent;

  const openToken = state.push("layout_container_open", "div", 1);

  openToken.block = true;
  openToken.map = [startLine, nextLine < endLine ? nextLine + 1 : nextLine];
  openToken.meta = {
    type: directive.type,
    classes: parsedAttrs.classes,
    id: parsedAttrs.id,
    utilities: parsedAttrs.utilities,
  } satisfies LayoutMeta;

  state.env[layoutKey] = { type: directive.type, level: state.level, depth };

  state.md.block.tokenize(state, startLine + 1, nextLine);

  state.env[layoutKey] = oldLayout;

  const closeToken = state.push("layout_container_close", "div", -1);

  closeToken.block = true;

  state.parentType = oldParent;
  state.lineMax = oldLineMax;
  state.blkIndent = oldBlkIndent;
  state.line = nextLine < endLine ? nextLine + 1 : nextLine;

  return true;
};

export const layout: PluginWithOptions<MarkdownItLayoutOptions> = (md, options) => {
  const { inlineStyles = true } = options ?? {};

  md.block.ruler.before("fence", "layout_container", getContainerRule(), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.block.ruler.before("paragraph", "layout_item", getItemRule(), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  // Container open renderer
  md.renderer.rules.layout_container_open = (tokens, index): string => {
    const token = tokens[index];
    const meta = token.meta as LayoutMeta;
    const attrs: string[] = [];
    const baseDisplay = CONTAINER_DISPLAY[meta.type] ?? "";

    if (inlineStyles) {
      const style = buildStyleString(meta.utilities, baseDisplay);

      if (style) attrs.push(`style="${style}"`);
      if (meta.classes.length > 0) attrs.push(`class="${escapeHtml(meta.classes.join(" "))}"`);
    } else {
      if (baseDisplay) attrs.push(`style="${baseDisplay}"`);

      const classNames = [...meta.classes, ...meta.utilities];

      if (classNames.length > 0) attrs.push(`class="${escapeHtml(classNames.join(" "))}"`);
    }

    if (meta.id) attrs.push(`id="${escapeHtml(meta.id)}"`);

    return `<div${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>\n`;
  };

  // Container close renderer
  md.renderer.rules.layout_container_close = (): string => "</div>\n";

  // Item open renderer
  md.renderer.rules.layout_item_open = (tokens, index): string => {
    const token = tokens[index];
    const meta = token.meta as LayoutMeta;
    const attrs: string[] = [];

    if (inlineStyles) {
      const styleParts: string[] = [];

      if (meta.type === LAYOUT_COLUMN && meta.classes.includes("span-all"))
        styleParts.push("column-span:all");

      for (let idx = 0; idx < meta.utilities.length; idx++) {
        const style = resolveUtility(meta.utilities[idx]);

        if (style) styleParts.push(style);
      }

      if (styleParts.length > 0) attrs.push(`style="${styleParts.join(";")}"`);
      if (meta.classes.length > 0) attrs.push(`class="${escapeHtml(meta.classes.join(" "))}"`);
    } else {
      const classNames = [...meta.classes, ...meta.utilities];

      if (classNames.length > 0) attrs.push(`class="${escapeHtml(classNames.join(" "))}"`);
    }

    if (meta.id) attrs.push(`id="${escapeHtml(meta.id)}"`);

    return `<div${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>\n`;
  };

  // Item close renderer
  md.renderer.rules.layout_item_close = (): string => "</div>\n";
};
