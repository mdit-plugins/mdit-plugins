import { escapeHtml, hasRule } from "@mdit/helper";
import type { BlockRule, PluginWithOptions } from "@mdit/helper";

import { CONTAINER_DISPLAY, LAYOUT_COLUMN, layoutKey } from "./constant.js";
import { detectDirective, parseAttributes } from "./directive.js";
import type { MarkdownItLayoutOptions } from "./options.js";
import { findItemEnd, findMatchingEnd } from "./scan.js";
import type { LayoutMeta, LayoutStateBlock } from "./types.js";
import type { UtilityCache } from "./utilities.js";
import { buildStyleString, resolveUtility } from "./utilities.js";

/**
 * Escape an attribute value, skipping the five replacements when the value cannot contain HTML
 * special characters.
 *
 * 转义属性值；当值中不含 HTML 特殊字符时跳过替换。
 *
 * @param value - Attribute value / 属性值
 * @returns Escaped attribute value / 转义后的属性值
 */
const escapeAttribute = (value: string): string => {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);

    if (
      code === 38 /* & */ ||
      code === 60 /* < */ ||
      code === 62 /* > */ ||
      code === 34 /* " */ ||
      code === 39 /* ' */
    )
      return escapeHtml(value);
  }

  return value;
};

/**
 * Join class names without allocating an intermediate combined array.
 *
 * 在不分配中间合并数组的情况下拼接类名。
 *
 * @param classes - Class names / 类名列表
 * @param utilities - Utility names / 工具类列表
 * @returns Space separated class names / 以空格分隔的类名
 */
const joinClassNames = (classes: string[], utilities: string[]): string => {
  if (classes.length === 0) return utilities.join(" ");
  if (utilities.length === 0) return classes.join(" ");

  return `${classes.join(" ")} ${utilities.join(" ")}`;
};

// `scanFence` (used by the scan index) is provided by @mdit/helper (forked and
// modified from markdown-it/lib/rules_block/fence.mjs).
//
// Known limitations: the scan index runs at the container/item level, before
// markdown-it's block rules re-tokenize nested content with a deeper
// blkIndent. Lines indented 4+ spaces relative to the current block context
// are skipped (they become indented code blocks or lazy paragraph
// continuations), so directives on such lines are not recognized here. The
// same limitation exists in @mdit/plugin-include's code block scan.

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
  const nextLine = findItemEnd(state, startLine, endLine, blkIndent);

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
  const { line: nextLine, hasEnd } = findMatchingEnd(state, startLine, endLine, state.blkIndent);

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

  // Resolved utilities and warned names are cached for this installation
  const utilityCache: UtilityCache = { styles: new Map(), warned: new Set() };

  // Container open renderer
  md.renderer.rules.layout_container_open = (tokens, index): string => {
    const token = tokens[index];
    const meta = token.meta as LayoutMeta;
    const attrs: string[] = [];
    const baseDisplay = CONTAINER_DISPLAY[meta.type] ?? "";

    if (inlineStyles) {
      const style = buildStyleString(meta.utilities, baseDisplay, utilityCache);

      if (style) attrs.push(`style="${style}"`);
      if (meta.classes.length > 0) attrs.push(`class="${escapeAttribute(meta.classes.join(" "))}"`);
    } else {
      if (baseDisplay) attrs.push(`style="${baseDisplay}"`);

      if (meta.classes.length > 0 || meta.utilities.length > 0)
        attrs.push(`class="${escapeAttribute(joinClassNames(meta.classes, meta.utilities))}"`);
    }

    if (meta.id) attrs.push(`id="${escapeAttribute(meta.id)}"`);

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
        const style = resolveUtility(meta.utilities[idx], utilityCache);

        if (style) styleParts.push(style);
      }

      if (styleParts.length > 0) attrs.push(`style="${styleParts.join(";")}"`);
      if (meta.classes.length > 0) attrs.push(`class="${escapeAttribute(meta.classes.join(" "))}"`);
    } else if (meta.classes.length > 0 || meta.utilities.length > 0) {
      attrs.push(`class="${escapeAttribute(joinClassNames(meta.classes, meta.utilities))}"`);
    }

    if (meta.id) attrs.push(`id="${escapeAttribute(meta.id)}"`);

    return `<div${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>\n`;
  };

  // Item close renderer
  md.renderer.rules.layout_item_close = (): string => "</div>\n";
};
