import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";

import { detectDirective, parseAttributes } from "./directive.js";
import type { MarkdownItLayoutOptions } from "./options.js";
import type { LayoutMeta, LayoutStateBlock } from "./types.js";
import { AT, CONTAINER_DISPLAY } from "./types.js";

/**
 * Find the anchor indent for the First-Line Anchor Rule.
 *
 * @param state - parser state / 解析器状态
 * @param itemStart - start line of the parent item / 父子项的起始行
 * @param containerLine - line of the nested container / 嵌套容器所在行
 * @returns anchor indent, or 0 if no content found / 锚点缩进量，无内容时为 0
 */
const findAnchorIndent = (
  state: LayoutStateBlock,
  itemStart: number,
  containerLine: number,
): number => {
  for (let line = itemStart + 1; line < containerLine; line++) {
    const lineStart = state.bMarks[line] + state.tShift[line];
    const lineEnd = state.eMarks[line];

    if (lineStart >= lineEnd) continue;

    return state.sCount[line];
  }

  return 0;
};

const getItemRule = (): RuleBlock => (state: LayoutStateBlock, startLine, endLine, silent) => {
  if (!state.env.layoutType || state.level !== state.env.layoutLevel) return false;

  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max);

  if (!directive || directive.kind !== "item") return false;
  if (directive.type !== state.env.layoutType) return false;

  if (silent) return true;

  const indent = state.sCount[startLine];
  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max);

  let nextLine = startLine + 1;

  for (; nextLine < endLine; nextLine++) {
    const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
    const nextLineMax = state.eMarks[nextLine];

    if (
      state.sCount[nextLine] === indent &&
      nextLineStart < nextLineMax &&
      state.src.charCodeAt(nextLineStart) === AT
    ) {
      const nextDirective = detectDirective(state.src, nextLineStart, nextLineMax);

      if (
        nextDirective &&
        ((nextDirective.kind === "item" && nextDirective.type === state.env.layoutType) ||
          nextDirective.kind === "end")
      )
        break;
    }
  }

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldBlkIndent = state.blkIndent;
  const oldItemStart = state.env.layoutItemStart;

  // @ts-expect-error: We are creating a new parent type called "layout_item"
  state.parentType = "layout_item";
  state.lineMax = nextLine;
  state.blkIndent = indent;
  state.env.layoutItemStart = startLine;

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
  state.env.layoutItemStart = oldItemStart;
  state.line = nextLine;

  return true;
};

const getContainerRule = (): RuleBlock => (state: LayoutStateBlock, startLine, endLine, silent) => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max);

  if (!directive || directive.kind !== "container") return false;

  const indentNested = state.sCount[startLine];

  // First-Line Anchor Rule: validate nested containers
  if (state.env.layoutType) {
    if (indentNested < 2 || indentNested > 3) return false;

    const anchorIndent = findAnchorIndent(state, state.env.layoutItemStart, startLine);

    if (indentNested < anchorIndent) return false;
  }

  if (silent) return true;

  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max);

  let nextLine = startLine + 1;

  // Search for the matching @end at the same indent level
  for (; nextLine < endLine; nextLine++) {
    const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
    const nextLineMax = state.eMarks[nextLine];

    if (nextLineStart >= nextLineMax) continue;
    if (state.src.charCodeAt(nextLineStart) !== AT) continue;
    if (state.sCount[nextLine] !== indentNested) continue;

    const nextDirective = detectDirective(state.src, nextLineStart, nextLineMax);

    if (nextDirective && nextDirective.kind === "end") break;
  }

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldBlkIndent = state.blkIndent;
  const oldLayoutType = state.env.layoutType;
  const oldLayoutLevel = state.env.layoutLevel;

  // @ts-expect-error: We are creating a new parent type called "layout_container"
  state.parentType = "layout_container";
  state.lineMax = nextLine;
  state.blkIndent = indentNested;

  const openToken = state.push("layout_container_open", "div", 1);

  openToken.block = true;
  openToken.map = [startLine, nextLine + 1];
  openToken.meta = {
    type: directive.type,
    classes: parsedAttrs.classes,
    id: parsedAttrs.id,
    utilities: parsedAttrs.utilities,
  } satisfies LayoutMeta;

  state.env.layoutType = directive.type;
  state.env.layoutLevel = state.level;

  state.md.block.tokenize(state, startLine + 1, nextLine);

  state.env.layoutType = oldLayoutType;
  state.env.layoutLevel = oldLayoutLevel;

  const closeToken = state.push("layout_container_close", "div", -1);

  closeToken.block = true;

  state.parentType = oldParent;
  state.lineMax = oldLineMax;
  state.blkIndent = oldBlkIndent;
  state.line = nextLine < endLine ? nextLine + 1 : nextLine;

  return true;
};

export const layoutSlim: PluginWithOptions<MarkdownItLayoutOptions> = (md) => {
  md.block.ruler.before("fence", "layout_container", getContainerRule(), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.block.ruler.before("paragraph", "layout_item", getItemRule(), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  // Container open renderer - utilities as class names
  md.renderer.rules["layout_container_open"] = (tokens, index): string => {
    const token = tokens[index];
    const meta = token.meta as LayoutMeta;
    const attrs: string[] = [];

    const baseDisplay = CONTAINER_DISPLAY[meta.type] ?? "";

    if (baseDisplay) attrs.push(`style="${baseDisplay}"`);

    const classNames = [...meta.classes, ...meta.utilities];

    if (classNames.length > 0) attrs.push(`class="${classNames.join(" ")}"`);

    if (meta.id) attrs.push(`id="${meta.id}"`);

    return `<div${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>\n`;
  };

  md.renderer.rules["layout_container_close"] = (): string => "</div>\n";

  // Item open renderer - utilities as class names
  md.renderer.rules["layout_item_open"] = (tokens, index): string => {
    const token = tokens[index];
    const meta = token.meta as LayoutMeta;
    const attrs: string[] = [];

    const classNames = [...meta.classes, ...meta.utilities];

    if (classNames.length > 0) attrs.push(`class="${classNames.join(" ")}"`);

    if (meta.id) attrs.push(`id="${meta.id}"`);

    return `<div${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>\n`;
  };

  md.renderer.rules["layout_item_close"] = (): string => "</div>\n";
};
