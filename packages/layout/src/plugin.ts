import { escapeHtml } from "@mdit/helper";
import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";

import { detectDirective, parseAttributes } from "./directive.js";
import type { MarkdownItLayoutOptions } from "./options.js";
import type { LayoutMeta, LayoutStateBlock } from "./types.js";
import { AT, CONTAINER_DISPLAY, LAYOUT_COLUMN } from "./types.js";
import { buildStyleString, resolveUtility } from "./utilities.js";

const getItemRule = (): RuleBlock => (state: LayoutStateBlock, startLine, endLine, silent) => {
  if (!state.env.layoutType || state.level !== state.env.layoutLevel) return false;

  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max);

  if (
    !directive ||
    directive.kind !== "item" ||
    directive.type !== state.env.layoutType ||
    directive.depth !== (state.env.layoutDepth ?? 0)
  )
    return false;

  if (silent) return true;

  const indent = state.sCount[startLine];
  const currentDepth = state.env.layoutDepth ?? 0;
  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max);

  let nextLine = startLine + 1;

  // Search for the next item marker or end of container
  for (; nextLine < endLine; nextLine++) {
    const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
    const nextLineMax = state.eMarks[nextLine];

    if (nextLineStart >= nextLineMax) continue;
    if (state.src.charCodeAt(nextLineStart) !== AT) continue;

    // For indent mode, check indent level
    if (currentDepth === 0 && state.sCount[nextLine] !== indent) continue;

    const nextDirective = detectDirective(state.src, nextLineStart, nextLineMax);

    if (!nextDirective || nextDirective.depth !== currentDepth) continue;

    if (
      (nextDirective.kind === "item" && nextDirective.type === state.env.layoutType) ||
      nextDirective.kind === "end"
    )
      break;
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

  // Handle .span-all for column items
  if (directive.type === LAYOUT_COLUMN && parsedAttrs.classes.includes("span-all")) {
    openToken.attrJoin("style", "column-span:all");
  }

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

/**
 * Find the anchor indent for the First-Line Anchor Rule.
 * Scans from itemStart+1 to containerLine (exclusive) to find
 * the first non-empty content line's indentation.
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

    // Skip empty lines
    if (lineStart >= lineEnd) continue;

    return state.sCount[line];
  }

  return 0;
};

const getContainerRule = (): RuleBlock => (state: LayoutStateBlock, startLine, endLine, silent) => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max);

  if (!directive || directive.kind !== "container") return false;

  const depth = directive.depth;
  const indentNested = state.sCount[startLine];

  if (state.env.layoutType) {
    // Inside an existing container
    if (depth > 0) {
      // Prefix mode: depth must be exactly parent + 1
      if (depth !== (state.env.layoutDepth ?? 0) + 1) return false;
    } else {
      // Indent mode: validate 2-3 relative indent + anchor rule
      const relativeIndent = indentNested - state.blkIndent;

      if (relativeIndent < 2 || relativeIndent > 3) {
        // Warn if indent is too small (likely stripped by formatter)
        if (relativeIndent < 2)
          // oxlint-disable-next-line no-console
          console.warn(
            `[layout] Nested container at line ${startLine + 1} has insufficient indent. ` +
              `Use prefix mode (@@) or add <!-- prettier-ignore --> around the block.`,
          );

        return false;
      }

      // Check anchor: indent must be >= first content line's indent
      const anchorIndent = findAnchorIndent(state, state.env.layoutItemStart, startLine);

      if (indentNested < anchorIndent) return false;
    }
  } else if (depth > 0) {
    // Top level: only depth 0 allowed
    return false;
  }

  if (silent) return true;

  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max);

  let nextLine = startLine + 1;

  // Search for the matching @end
  for (; nextLine < endLine; nextLine++) {
    const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
    const nextLineMax = state.eMarks[nextLine];

    if (nextLineStart >= nextLineMax) continue;
    if (state.src.charCodeAt(nextLineStart) !== AT) continue;

    const nextDirective = detectDirective(state.src, nextLineStart, nextLineMax);

    if (!nextDirective || nextDirective.kind !== "end") continue;

    if (depth > 0) {
      // Prefix mode: match by depth
      if (nextDirective.depth === depth) break;
    } else if (state.sCount[nextLine] === indentNested && nextDirective.depth === 0) {
      // Indent mode: match by indent and depth 0
      break;
    }
  }

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldBlkIndent = state.blkIndent;
  const oldLayoutType = state.env.layoutType;
  const oldLayoutLevel = state.env.layoutLevel;
  const oldLayoutDepth = state.env.layoutDepth;

  // @ts-expect-error: We are creating a new parent type called "layout_container"
  state.parentType = "layout_container";
  state.lineMax = nextLine;
  state.blkIndent = indentNested;

  const openToken = state.push("layout_container_open", "div", 1);

  openToken.block = true;
  openToken.map = [startLine, nextLine < endLine ? nextLine + 1 : nextLine];
  openToken.meta = {
    type: directive.type,
    classes: parsedAttrs.classes,
    id: parsedAttrs.id,
    utilities: parsedAttrs.utilities,
  } satisfies LayoutMeta;

  state.env.layoutType = directive.type;
  state.env.layoutLevel = state.level;
  state.env.layoutDepth = depth;

  state.md.block.tokenize(state, startLine + 1, nextLine);

  state.env.layoutType = oldLayoutType;
  state.env.layoutLevel = oldLayoutLevel;
  state.env.layoutDepth = oldLayoutDepth;

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
  md.renderer.rules["layout_container_open"] = (tokens, index): string => {
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
  md.renderer.rules["layout_container_close"] = (): string => "</div>\n";

  // Item open renderer
  md.renderer.rules["layout_item_open"] = (tokens, index): string => {
    const token = tokens[index];
    const meta = token.meta as LayoutMeta;
    const attrs: string[] = [];

    if (inlineStyles) {
      const styleParts: string[] = [];

      if (meta.type === LAYOUT_COLUMN && meta.classes.includes("span-all"))
        styleParts.push("column-span:all");

      for (let i = 0; i < meta.utilities.length; i++) {
        const style = resolveUtility(meta.utilities[i]);

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
  md.renderer.rules["layout_item_close"] = (): string => "</div>\n";
};
