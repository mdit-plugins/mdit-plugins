import { escapeHtml } from "@mdit/helper";
import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";

import { detectDirective, parseAttributes } from "./directive.js";
import type { MarkdownItLayoutOptions } from "./options.js";
import type { LayoutMeta, LayoutStateBlock } from "./types.js";
import { AT, CONTAINER_DISPLAY, LAYOUT_COLUMN } from "./types.js";
import { buildStyleString, resolveUtility } from "./utilities.js";

/**
 * Count matching container opens/ends to find the `@end` that closes the
 * container opened at startLine. Works at the same `@` depth.
 *
 * 通过计数匹配的容器开/闭来找到关闭 startLine 处容器的 `@end`。
 *
 * @param state - parser state / 解析器状态
 * @param startLine - first line after the container open / 容器开始后的第一行
 * @param endLine - search boundary / 搜索边界
 * @param depth - `@` depth of the container / 容器的 `@` 深度
 * @returns line number of matching `@end`, or endLine if not found / 匹配 `@end` 的行号，未找到则返回 endLine
 */
const findMatchingEnd = (
  state: LayoutStateBlock,
  startLine: number,
  endLine: number,
  depth: number,
): number => {
  let nesting = 1;

  for (let line = startLine; line < endLine; line++) {
    const lineStart = state.bMarks[line] + state.tShift[line];
    const lineMax = state.eMarks[line];

    if (lineStart >= lineMax) continue;
    if (state.src.charCodeAt(lineStart) !== AT) continue;

    const dir = detectDirective(state.src, lineStart, lineMax);

    if (!dir || dir.depth !== depth) continue;

    if (dir.kind === "container") nesting++;
    else if (dir.kind === "end") {
      nesting--;
      if (nesting === 0) return line;
    }
  }

  return endLine;
};

const getItemRule = (): RuleBlock => (state: LayoutStateBlock, startLine, endLine, silent) => {
  const ctx = state.env.layout;

  if (!ctx || state.level !== ctx.level) return false;

  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max);

  if (
    !directive ||
    directive.kind !== "item" ||
    directive.type !== ctx.type ||
    directive.depth !== ctx.depth
  )
    return false;

  if (silent) return true;

  const indent = state.sCount[startLine];
  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max);

  let nextLine = startLine + 1;
  let nesting = 0;

  // Search for the next item marker or end of container, counting nested containers
  for (; nextLine < endLine; nextLine++) {
    const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
    const nextLineMax = state.eMarks[nextLine];

    if (nextLineStart >= nextLineMax) continue;
    if (state.src.charCodeAt(nextLineStart) !== AT) continue;

    const nextDir = detectDirective(state.src, nextLineStart, nextLineMax);

    if (!nextDir || nextDir.depth !== ctx.depth) continue;

    if (nextDir.kind === "container") {
      nesting++;
    } else if (nextDir.kind === "end" && nesting > 0) {
      nesting--;
    } else if (nextDir.kind === "item" && nextDir.type === ctx.type && nesting === 0) {
      break;
    }
  }

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldBlkIndent = state.blkIndent;

  // @ts-expect-error: custom parent type
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

const getContainerRule = (): RuleBlock => (state: LayoutStateBlock, startLine, endLine, silent) => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max);

  if (!directive || directive.kind !== "container") return false;

  const depth = directive.depth;
  const ctx = state.env.layout;

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
  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max);
  const nextLine = findMatchingEnd(state, startLine + 1, endLine, depth);

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldBlkIndent = state.blkIndent;
  const oldLayout = state.env.layout;

  // @ts-expect-error: custom parent type
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

  state.env.layout = { type: directive.type, level: state.level, depth };

  state.md.block.tokenize(state, startLine + 1, nextLine);

  state.env.layout = oldLayout;

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
  md.renderer.rules["layout_item_close"] = (): string => "</div>\n";
};
