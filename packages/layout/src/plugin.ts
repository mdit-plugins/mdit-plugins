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

  if (!directive || directive.kind !== "item") return false;
  if (directive.type !== state.env.layoutType) return false;

  if (silent) return true;

  const indent = state.sCount[startLine];
  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max);

  let nextLine = startLine + 1;

  // Search for the next item marker or end of container
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

  // @ts-expect-error: We are creating a new parent type called "layout_item"
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
  state.line = nextLine;

  return true;
};

const getContainerRule = (): RuleBlock => (state: LayoutStateBlock, startLine, endLine, silent) => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  const directive = detectDirective(state.src, start, max);

  if (!directive || directive.kind !== "container") return false;

  if (silent) return true;

  const indent = state.sCount[startLine];
  const parsedAttrs = parseAttributes(state.src, directive.nameEnd, max);

  let nextLine = startLine + 1;
  let nestingDepth = 1;

  // Search for the matching @end
  for (; nextLine < endLine; nextLine++) {
    const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
    const nextLineMax = state.eMarks[nextLine];

    if (nextLineStart >= nextLineMax) continue;
    if (state.src.charCodeAt(nextLineStart) !== AT) continue;

    const nextDirective = detectDirective(state.src, nextLineStart, nextLineMax);

    if (!nextDirective) continue;

    if (nextDirective.kind === "container") {
      nestingDepth++;
    } else if (nextDirective.kind === "end") {
      nestingDepth--;
      if (nestingDepth === 0) break;
    }
  }

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldBlkIndent = state.blkIndent;
  const oldLayoutType = state.env.layoutType;
  const oldLayoutLevel = state.env.layoutLevel;

  // @ts-expect-error: We are creating a new parent type called "layout_container"
  state.parentType = "layout_container";
  state.lineMax = nextLine;
  state.blkIndent = indent;

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

export const layout: PluginWithOptions<MarkdownItLayoutOptions> = (md) => {
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

    // Build style
    const baseDisplay = CONTAINER_DISPLAY[meta.type] ?? "";
    const style = buildStyleString(meta.utilities, baseDisplay);

    if (style) attrs.push(`style="${style}"`);

    // Add classes
    if (meta.classes.length > 0) attrs.push(`class="${meta.classes.join(" ")}"`);

    // Add id
    if (meta.id) attrs.push(`id="${meta.id}"`);

    return `<div${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>\n`;
  };

  // Container close renderer
  md.renderer.rules["layout_container_close"] = (): string => "</div>\n";

  // Item open renderer
  md.renderer.rules["layout_item_open"] = (tokens, index): string => {
    const token = tokens[index];
    const meta = token.meta as LayoutMeta;
    const attrs: string[] = [];

    // Build style
    const styleParts: string[] = [];

    // Handle .span-all for column items
    if (meta.type === LAYOUT_COLUMN && meta.classes.includes("span-all"))
      styleParts.push("column-span:all");

    for (let i = 0; i < meta.utilities.length; i++) {
      const style = resolveUtility(meta.utilities[i]);

      if (style) styleParts.push(style);
    }

    if (styleParts.length > 0) attrs.push(`style="${styleParts.join(";")}"`);

    // Add classes
    if (meta.classes.length > 0) attrs.push(`class="${meta.classes.join(" ")}"`);

    // Add id
    if (meta.id) attrs.push(`id="${meta.id}"`);

    return `<div${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>\n`;
  };

  // Item close renderer
  md.renderer.rules["layout_item_close"] = (): string => "</div>\n";
};
