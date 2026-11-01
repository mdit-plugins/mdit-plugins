import { escapeHtml, hasRule, scanFence } from "@mdit/helper";
import type { BlockRule, PluginWithOptions } from "@mdit/helper";

import { AT, CONTAINER_DISPLAY, LAYOUT_COLUMN, layoutKey } from "./constant.js";
import { detectDirective, parseAttributes } from "./directive.js";
import type { MarkdownItLayoutOptions } from "./options.js";
import type { LayoutMeta, LayoutStateBlock } from "./types.js";
import { buildStyleString, resolveUtility } from "./utilities.js";

// `scanFence` is provided by @mdit/helper (forked and modified from
// markdown-it/lib/rules_block/fence.mjs).
//
// Known limitations: this scan runs at the container/item level, before
// markdown-it's block rules re-tokenize nested content with a deeper
// blkIndent. Lines indented 4+ spaces relative to the current block context
// are skipped (they become indented code blocks or lazy paragraph
// continuations), so directives on such lines are not recognized here. The
// same limitation exists in @mdit/plugin-include's code block scan.

/**
 * Find the first `@end` with exactly the same number of leading `@` as the container. Nested
 * containers use fewer `@` characters, so their `@end` markers never match and no nesting counter
 * is needed.
 *
 * 找到第一个与容器具有完全相同 `@` 数量的 `@end`。嵌套容器使用更少的 `@`，因此它们的 `@end` 不会被匹配，无需嵌套计数。
 *
 * @param state - Parser state / 解析器状态
 * @param startLine - First line after the container open / 容器开始后的第一行
 * @param endLine - Search boundary / 搜索边界
 * @param depth - Number of leading `@` characters of the container / 容器的前导 `@` 数量
 * @param blkIndent - Block indent of the enclosing context / 外层上下文的块级缩进
 * @returns The matching `@end` line and whether it is explicit, or the boundary line and `false` /
 *   匹配 `@end` 的行号及是否为显式闭合，或边界行及 `false`
 */
const findMatchingEnd = (
  state: LayoutStateBlock,
  startLine: number,
  endLine: number,
  depth: number,
  blkIndent: number,
): { line: number; hasEnd: boolean } => {
  const isSpace = state.md.utils.isSpace;

  for (let line = startLine; line < endLine; line++) {
    const lineStart = state.bMarks[line] + state.tShift[line];
    const lineMax = state.eMarks[line];

    if (lineStart >= lineMax) continue;

    const lineIndent = state.sCount[line];

    // Blockquote lazy continuation lines use `sCount === -1`; they are content, not outdents
    if (lineIndent < 0) continue;

    // Outdented past the enclosing block (e.g. list item): stop before this line, which still
    // belongs to the parent parser (e.g. a top-level `@end` followed by a paragraph)
    if (lineIndent < blkIndent) return { line, hasEnd: false };

    // 4+ spaces relative to blkIndent is an indented code block or lazy continuation
    if (lineIndent - blkIndent >= 4) continue;

    // directives inside fenced code blocks are literal text, skip them
    const fenceEnd = scanFence(state, line, endLine, blkIndent);

    if (fenceEnd != null && fenceEnd > line) {
      line = fenceEnd - 1;
      continue;
    }

    if (state.src.charCodeAt(lineStart) !== AT) continue;

    const dir = detectDirective(state.src, lineStart, lineMax, isSpace);

    if (dir && dir.kind === "end" && dir.depth === depth) return { line, hasEnd: true };
  }

  return { line: endLine, hasEnd: false };
};

const getItemRule = (): BlockRule => (state: LayoutStateBlock, startLine, endLine, silent) => {
  const ctx = state.env[layoutKey];

  if (!ctx || state.level !== ctx.level || state.sCount[startLine] - state.blkIndent >= 4)
    return false;

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

  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max, isSpace);
  const blkIndent = state.blkIndent;

  // The item body ends at the next sibling item with the same `@` count and type.
  // The container's `@end` line is already excluded from `endLine` by the container rule.
  let nextLine = startLine + 1;

  for (; nextLine < endLine; nextLine++) {
    const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
    const nextLineMax = state.eMarks[nextLine];

    // Blank lines never end the item, tokenize skips them as well
    if (nextLineStart >= nextLineMax) continue;

    const lineIndent = state.sCount[nextLine];

    // Blockquote lazy continuation lines use `sCount === -1`; they are content, not outdents
    if (lineIndent < 0) continue;

    // 4+ spaces relative to blkIndent is an indented code block or lazy continuation
    if (lineIndent - blkIndent >= 4) continue;

    // directives inside fenced code blocks are literal text, skip them
    const fenceEnd = scanFence(state, nextLine, endLine, blkIndent);

    if (fenceEnd != null && fenceEnd > nextLine) {
      nextLine = fenceEnd - 1;
      continue;
    }

    if (state.src.charCodeAt(nextLineStart) !== AT) continue;

    const nextDirective = detectDirective(state.src, nextLineStart, nextLineMax, isSpace);

    if (
      nextDirective != null &&
      nextDirective.kind === "item" &&
      nextDirective.type === ctx.type &&
      nextDirective.depth === ctx.depth
    )
      break;
  }

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;

  state.parentType = "layout_item";
  state.lineMax = nextLine;

  const openToken = state.push("layout_item_open", "div", 1);

  openToken.block = true;
  openToken.meta = {
    type: directive.type,
    classes: parsedAttrs.classes,
    id: parsedAttrs.id,
    utilities: parsedAttrs.utilities,
  } satisfies LayoutMeta;

  state.md.block.tokenize(state, startLine + 1, nextLine);

  // Leave lines the tokenizer did not consume (e.g. blockquote lazy lines) to the parent parser.
  // An empty body leaves `state.line` at the opening line, so always advance at least one line.
  const consumedLine = Math.min(Math.max(state.line, startLine + 1), nextLine);

  const closeToken = state.push("layout_item_close", "div", -1);

  closeToken.block = true;

  state.parentType = oldParent;
  state.lineMax = oldLineMax;
  state.line = consumedLine;
  openToken.map = [startLine, consumedLine];

  return true;
};

const getContainerRule = (): BlockRule => (state: LayoutStateBlock, startLine, endLine, silent) => {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;

  const isSpace = state.md.utils.isSpace;
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max, isSpace);

  if (!directive || directive.kind !== "container") return false;

  const depth = directive.depth;
  const ctx = state.env[layoutKey];

  // Golden rule: containers nest from more leading `@` to fewer leading `@`.
  // e.g. `@@flexs` may contain `@grids`, but `@flexs` may not contain `@grids` or `@@grids`.
  if (ctx && depth >= ctx.depth) return false;

  if (silent) return true;

  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max, isSpace);
  const result = findMatchingEnd(state, startLine + 1, endLine, depth, state.blkIndent);
  const { line: nextLine, hasEnd } = result;

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldLayout = state.env[layoutKey];

  state.parentType = "layout_container";
  state.lineMax = nextLine;

  const openToken = state.push("layout_container_open", "div", 1);

  openToken.block = true;
  openToken.meta = {
    type: directive.type,
    classes: parsedAttrs.classes,
    id: parsedAttrs.id,
    utilities: parsedAttrs.utilities,
  } satisfies LayoutMeta;

  state.env[layoutKey] = { type: directive.type, level: state.level, depth };

  state.md.block.tokenize(state, startLine + 1, nextLine);

  // The tokenizer can stop before `nextLine` (e.g. on a blockquote lazy line). In that case the
  // remaining lines belong to the parent parser, so do not advance past what was consumed — even
  // when a matching `@end` was found later in the scanned range. An empty body leaves `state.line`
  // at the opening line, so always advance at least one line.
  const consumedLine = Math.min(Math.max(state.line, startLine + 1), nextLine);
  const containerEndLine = hasEnd && consumedLine === nextLine ? nextLine + 1 : consumedLine;

  state.env[layoutKey] = oldLayout;

  const closeToken = state.push("layout_container_close", "div", -1);

  closeToken.block = true;

  state.parentType = oldParent;
  state.lineMax = oldLineMax;
  state.line = containerEndLine;
  openToken.map = [startLine, containerEndLine];

  return true;
};

export const layout: PluginWithOptions<MarkdownItLayoutOptions> = (md, options) => {
  const { inlineStyles = true } = options ?? {};

  // Repeated installation is a full no-op: both block rules and the renderers are
  // registered together, so the first installation's options always win.
  if (hasRule(md, "layout_container", "block")) return;

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
