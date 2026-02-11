import type { PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";

import type { MarkdownItLayoutOptions } from "./options.js";

// Layout type constants
const LAYOUT_FLEX = 1;
const LAYOUT_GRID = 2;
const LAYOUT_COLUMN = 3;

// Character codes
const AT = 64; /* @ */
const DOT = 46; /* . */
const HASH = 35; /* # */
const SPACE = 32; /*   */
const DASH = 45; /* - */

// Directive strings
const FLEX = "flex";
const GRID = "grid";
const COLUMN = "column";
const END = "end";

// Base display styles for containers
const CONTAINER_DISPLAY: Record<number, string> = {
  [LAYOUT_FLEX]: "display:flex",
  [LAYOUT_GRID]: "display:grid",
};

// Static utility-to-style mappings
const STATIC_UTILITIES: Record<string, string> = {
  // Flex direction
  "flex-row": "flex-direction:row",
  "flex-col": "flex-direction:column",
  "flex-row-reverse": "flex-direction:row-reverse",
  "flex-col-reverse": "flex-direction:column-reverse",

  // Flex wrap
  "flex-wrap": "flex-wrap:wrap",
  "flex-nowrap": "flex-wrap:nowrap",
  "flex-wrap-reverse": "flex-wrap:wrap-reverse",

  // Flex shorthand
  "flex-1": "flex:1 1 0%",
  "flex-auto": "flex:1 1 auto",
  "flex-initial": "flex:0 1 auto",
  "flex-none": "flex:none",

  // Flex grow/shrink
  grow: "flex-grow:1",
  "grow-0": "flex-grow:0",
  shrink: "flex-shrink:1",
  "shrink-0": "flex-shrink:0",

  // Order
  "order-first": "order:-9999",
  "order-last": "order:9999",
  "order-none": "order:0",

  // Grid auto flow
  "grid-flow-row": "grid-auto-flow:row",
  "grid-flow-col": "grid-auto-flow:column",
  "grid-flow-dense": "grid-auto-flow:dense",
  "grid-flow-row-dense": "grid-auto-flow:row dense",
  "grid-flow-col-dense": "grid-auto-flow:column dense",

  // Grid auto columns
  "auto-cols-auto": "grid-auto-columns:auto",
  "auto-cols-min": "grid-auto-columns:min-content",
  "auto-cols-max": "grid-auto-columns:max-content",
  "auto-cols-fr": "grid-auto-columns:minmax(0,1fr)",

  // Grid auto rows
  "auto-rows-auto": "grid-auto-rows:auto",
  "auto-rows-min": "grid-auto-rows:min-content",
  "auto-rows-max": "grid-auto-rows:max-content",
  "auto-rows-fr": "grid-auto-rows:minmax(0,1fr)",

  // Grid template special values
  "grid-cols-none": "grid-template-columns:none",
  "grid-rows-none": "grid-template-rows:none",

  // Col/row span special values
  "col-span-full": "grid-column:1 / -1",
  "row-span-full": "grid-row:1 / -1",

  // Justify content
  "justify-start": "justify-content:flex-start",
  "justify-end": "justify-content:flex-end",
  "justify-center": "justify-content:center",
  "justify-between": "justify-content:space-between",
  "justify-around": "justify-content:space-around",
  "justify-evenly": "justify-content:space-evenly",
  "justify-stretch": "justify-content:stretch",

  // Justify items
  "justify-items-start": "justify-items:start",
  "justify-items-end": "justify-items:end",
  "justify-items-center": "justify-items:center",
  "justify-items-stretch": "justify-items:stretch",

  // Justify self
  "justify-self-auto": "justify-self:auto",
  "justify-self-start": "justify-self:start",
  "justify-self-end": "justify-self:end",
  "justify-self-center": "justify-self:center",
  "justify-self-stretch": "justify-self:stretch",

  // Align content
  "content-start": "align-content:flex-start",
  "content-end": "align-content:flex-end",
  "content-center": "align-content:center",
  "content-between": "align-content:space-between",
  "content-around": "align-content:space-around",
  "content-evenly": "align-content:space-evenly",
  "content-stretch": "align-content:stretch",

  // Align items
  "items-start": "align-items:flex-start",
  "items-end": "align-items:flex-end",
  "items-center": "align-items:center",
  "items-baseline": "align-items:baseline",
  "items-stretch": "align-items:stretch",

  // Align self
  "self-auto": "align-self:auto",
  "self-start": "align-self:flex-start",
  "self-end": "align-self:flex-end",
  "self-center": "align-self:center",
  "self-baseline": "align-self:baseline",
  "self-stretch": "align-self:stretch",

  // Place content
  "place-content-start": "place-content:start",
  "place-content-end": "place-content:end",
  "place-content-center": "place-content:center",
  "place-content-between": "place-content:space-between",
  "place-content-around": "place-content:space-around",
  "place-content-evenly": "place-content:space-evenly",
  "place-content-stretch": "place-content:stretch",

  // Place items
  "place-items-start": "place-items:start",
  "place-items-end": "place-items:end",
  "place-items-center": "place-items:center",
  "place-items-stretch": "place-items:stretch",

  // Place self
  "place-self-auto": "place-self:auto",
  "place-self-start": "place-self:start",
  "place-self-end": "place-self:end",
  "place-self-center": "place-self:center",
  "place-self-stretch": "place-self:stretch",

  // Aspect ratio
  "aspect-auto": "aspect-ratio:auto",
  "aspect-square": "aspect-ratio:1 / 1",
  "aspect-video": "aspect-ratio:16 / 9",

  // Break after
  "break-after-auto": "break-after:auto",
  "break-after-avoid": "break-after:avoid",
  "break-after-all": "break-after:all",
  "break-after-avoid-page": "break-after:avoid-page",
  "break-after-page": "break-after:page",
  "break-after-left": "break-after:left",
  "break-after-right": "break-after:right",
  "break-after-column": "break-after:column",

  // Break before
  "break-before-auto": "break-before:auto",
  "break-before-avoid": "break-before:avoid",
  "break-before-all": "break-before:all",
  "break-before-avoid-page": "break-before:avoid-page",
  "break-before-page": "break-before:page",
  "break-before-left": "break-before:left",
  "break-before-right": "break-before:right",
  "break-before-column": "break-before:column",

  // Break inside
  "break-inside-auto": "break-inside:auto",
  "break-inside-avoid": "break-inside:avoid",
  "break-inside-avoid-page": "break-inside:avoid-page",
  "break-inside-avoid-column": "break-inside:avoid-column",

  // Gap special values
  "gap-px": "gap:1px",
  "gap-x-px": "column-gap:1px",
  "gap-y-px": "row-gap:1px",
};

interface LayoutMeta {
  type: number;
  classes: string[];
  id: string;
  utilities: string[];
}

interface LayoutEnv extends Record<string, unknown> {
  layoutType: number;
  layoutLevel: number;
}

interface LayoutStateBlock extends StateBlock {
  env: LayoutEnv;
}

/**
 * Parse a number from a string starting at the given position.
 *
 * @param str - source string / 源字符串
 * @param start - start position / 起始位置
 * @param end - end position / 结束位置
 * @returns parsed number or -1 if invalid / 解析的数字，无效时返回 -1
 */
const parseNumber = (str: string, start: number, end: number): number => {
  if (start >= end) return -1;

  let result = 0;

  for (let i = start; i < end; i++) {
    const code = str.charCodeAt(i);

    if (code < 48 /* 0 */ || code > 57 /* 9 */) return -1;
    result = result * 10 + (code - 48);
  }

  return result;
};

/**
 * Check if a string matches a target starting at the given position.
 *
 * @param src - source string / 源字符串
 * @param pos - current position / 当前位置
 * @param target - target string to match / 要匹配的目标字符串
 * @returns whether the string matches / 是否匹配
 */
const matchString = (src: string, pos: number, target: string): boolean => {
  for (let i = 0; i < target.length; i++)
    if (src.charCodeAt(pos + i) !== target.charCodeAt(i)) return false;

  return true;
};

/**
 * Check if a character code indicates the end of a directive name.
 *
 * @param code - character code / 字符编码
 * @returns whether it's a valid boundary / 是否是有效的边界
 */
const isDirectiveBoundary = (code: number): boolean =>
  Number.isNaN(code) || code === DOT || code === HASH || code === SPACE;

/**
 * Resolve a parameterized utility class to an inline style.
 *
 * @param utility - utility class name / 工具类名
 * @returns CSS style string or empty string / CSS 样式字符串或空字符串
 */
const resolveParameterizedUtility = (utility: string): string => {
  const len = utility.length;

  // gap-{n}, gap-x-{n}, gap-y-{n}
  if (utility.charCodeAt(0) === 103 /* g */ && matchString(utility, 0, "gap-")) {
    if (utility.charCodeAt(4) === 120 /* x */ && utility.charCodeAt(5) === DASH) {
      const num = parseNumber(utility, 6, len);

      if (num >= 0) return `column-gap:${num * 0.25}rem`;
    } else if (utility.charCodeAt(4) === 121 /* y */ && utility.charCodeAt(5) === DASH) {
      const num = parseNumber(utility, 6, len);

      if (num >= 0) return `row-gap:${num * 0.25}rem`;
    } else {
      const num = parseNumber(utility, 4, len);

      if (num >= 0) return `gap:${num * 0.25}rem`;
    }
  }

  // order-{n}
  if (utility.charCodeAt(0) === 111 /* o */ && matchString(utility, 0, "order-")) {
    const num = parseNumber(utility, 6, len);

    if (num >= 0) return `order:${num}`;
  }

  // grid-cols-{n}
  if (matchString(utility, 0, "grid-cols-")) {
    const num = parseNumber(utility, 10, len);

    if (num >= 0) return `grid-template-columns:repeat(${num},minmax(0,1fr))`;
  }

  // grid-rows-{n}
  if (matchString(utility, 0, "grid-rows-")) {
    const num = parseNumber(utility, 10, len);

    if (num >= 0) return `grid-template-rows:repeat(${num},minmax(0,1fr))`;
  }

  // col-span-{n}
  if (matchString(utility, 0, "col-span-")) {
    const num = parseNumber(utility, 9, len);

    if (num >= 0) return `grid-column:span ${num} / span ${num}`;
  }

  // col-start-{n}
  if (matchString(utility, 0, "col-start-")) {
    const num = parseNumber(utility, 10, len);

    if (num >= 0) return `grid-column-start:${num}`;
  }

  // col-end-{n}
  if (matchString(utility, 0, "col-end-")) {
    const num = parseNumber(utility, 8, len);

    if (num >= 0) return `grid-column-end:${num}`;
  }

  // row-span-{n}
  if (matchString(utility, 0, "row-span-")) {
    const num = parseNumber(utility, 9, len);

    if (num >= 0) return `grid-row:span ${num} / span ${num}`;
  }

  // row-start-{n}
  if (matchString(utility, 0, "row-start-")) {
    const num = parseNumber(utility, 10, len);

    if (num >= 0) return `grid-row-start:${num}`;
  }

  // row-end-{n}
  if (matchString(utility, 0, "row-end-")) {
    const num = parseNumber(utility, 8, len);

    if (num >= 0) return `grid-row-end:${num}`;
  }

  // columns-{n}
  if (matchString(utility, 0, "columns-")) {
    const num = parseNumber(utility, 8, len);

    if (num >= 0) return `columns:${num}`;
  }

  return "";
};

/**
 * Resolve a utility class to an inline style.
 *
 * @param utility - utility class name / 工具类名
 * @returns CSS style string or empty string / CSS 样式字符串或空字符串
 */
const resolveUtility = (utility: string): string =>
  STATIC_UTILITIES[utility] ?? resolveParameterizedUtility(utility);

/**
 * Parse selectors and utilities from the directive line after the directive name.
 *
 * @param src - source string / 源字符串
 * @param startPos - position after the directive name / 指令名称后的位置
 * @param max - end of line / 行尾位置
 * @returns parsed metadata / 解析后的元数据
 */
const parseAttributes = (
  src: string,
  startPos: number,
  max: number,
): { classes: string[]; id: string; utilities: string[] } => {
  const classes: string[] = [];
  let id = "";
  const utilities: string[] = [];
  let pos = startPos;

  // Parse . and # selectors (attached directly to directive)
  while (pos < max) {
    const code = src.charCodeAt(pos);

    if (code === DOT) {
      // Parse class name
      const start = pos + 1;
      let end = start;

      while (end < max) {
        const ch = src.charCodeAt(end);

        if (ch === DOT || ch === HASH || ch === SPACE) break;
        end++;
      }

      if (end > start) classes.push(src.slice(start, end));
      pos = end;
    } else if (code === HASH) {
      // Parse id
      const start = pos + 1;
      let end = start;

      while (end < max) {
        const ch = src.charCodeAt(end);

        if (ch === DOT || ch === HASH || ch === SPACE) break;
        end++;
      }

      if (end > start) id = src.slice(start, end);
      pos = end;
    } else if (code === SPACE) {
      // Skip space then parse utilities
      pos++;

      while (pos < max) {
        // Skip spaces between utilities
        while (pos < max && src.charCodeAt(pos) === SPACE) pos++;
        if (pos >= max) break;

        const start = pos;

        while (pos < max && src.charCodeAt(pos) !== SPACE) pos++;
        utilities.push(src.slice(start, pos));
      }

      break;
    } else {
      break;
    }
  }

  return { classes, id, utilities };
};

/**
 * Build inline style string from utilities and optional base display.
 *
 * @param utilities - utility class names / 工具类名列表
 * @param baseDisplay - base display style / 基础显示样式
 * @returns CSS style string / CSS 样式字符串
 */
const buildStyleString = (utilities: string[], baseDisplay: string): string => {
  const parts: string[] = [];

  if (baseDisplay) parts.push(baseDisplay);

  for (let i = 0; i < utilities.length; i++) {
    const style = resolveUtility(utilities[i]);

    if (style) parts.push(style);
  }

  return parts.length > 0 ? parts.join(";") : "";
};

/**
 * Detect the type of layout directive at the given position.
 *
 * @param src - source string / 源字符串
 * @param pos - position (should point to '@') / 位置（应指向 '@'）
 * @param max - end of line / 行尾位置
 * @returns detection result or null / 检测结果或 null
 */
const detectDirective = (
  src: string,
  pos: number,
  max: number,
): { kind: "container" | "item" | "end"; type: number; nameEnd: number } | null => {
  if (src.charCodeAt(pos) !== AT) return null;

  const afterAt = pos + 1;

  // Check for "end"
  if (matchString(src, afterAt, END) && afterAt + END.length <= max) {
    const endPos = afterAt + END.length;

    if (endPos >= max || src.charCodeAt(endPos) === SPACE)
      return { kind: "end", type: 0, nameEnd: endPos };
  }

  // Check for "flex" / "flexs"
  if (matchString(src, afterAt, FLEX)) {
    const afterFlex = afterAt + FLEX.length;

    // Check for "flexs" (container)
    if (
      afterFlex < max &&
      src.charCodeAt(afterFlex) === 115 /* s */ &&
      (afterFlex + 1 >= max || isDirectiveBoundary(src.charCodeAt(afterFlex + 1)))
    )
      return { kind: "container", type: LAYOUT_FLEX, nameEnd: afterFlex + 1 };

    // "flex" (item)
    if (afterFlex >= max || isDirectiveBoundary(src.charCodeAt(afterFlex)))
      return { kind: "item", type: LAYOUT_FLEX, nameEnd: afterFlex };
  }

  // Check for "grid" / "grids"
  if (matchString(src, afterAt, GRID)) {
    const afterGrid = afterAt + GRID.length;

    // Check for "grids" (container)
    if (
      afterGrid < max &&
      src.charCodeAt(afterGrid) === 115 /* s */ &&
      (afterGrid + 1 >= max || isDirectiveBoundary(src.charCodeAt(afterGrid + 1)))
    )
      return { kind: "container", type: LAYOUT_GRID, nameEnd: afterGrid + 1 };

    // "grid" (item)
    if (afterGrid >= max || isDirectiveBoundary(src.charCodeAt(afterGrid)))
      return { kind: "item", type: LAYOUT_GRID, nameEnd: afterGrid };
  }

  // Check for "column" / "columns"
  if (matchString(src, afterAt, COLUMN)) {
    const afterColumn = afterAt + COLUMN.length;

    // Check for "columns" (container)
    if (
      afterColumn < max &&
      src.charCodeAt(afterColumn) === 115 /* s */ &&
      (afterColumn + 1 >= max || isDirectiveBoundary(src.charCodeAt(afterColumn + 1)))
    )
      return { kind: "container", type: LAYOUT_COLUMN, nameEnd: afterColumn + 1 };

    // "column" (item)
    if (afterColumn >= max || isDirectiveBoundary(src.charCodeAt(afterColumn)))
      return { kind: "item", type: LAYOUT_COLUMN, nameEnd: afterColumn };
  }

  return null;
};

const getItemRule =
  (inlineStyles: boolean): RuleBlock =>
  (state: LayoutStateBlock, startLine, endLine, silent) => {
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
    if (
      inlineStyles &&
      directive.type === LAYOUT_COLUMN &&
      parsedAttrs.classes.includes("span-all")
    ) {
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

export const layout: PluginWithOptions<MarkdownItLayoutOptions> = (md, options = {}) => {
  const { inlineStyles = true } = options;

  md.block.ruler.before("fence", "layout_container", getContainerRule(), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.block.ruler.before("paragraph", "layout_item", getItemRule(inlineStyles), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  // Container open renderer
  md.renderer.rules["layout_container_open"] = (tokens, index): string => {
    const token = tokens[index];
    const meta = token.meta as LayoutMeta;
    const attrs: string[] = [];

    // Build style
    const baseDisplay = CONTAINER_DISPLAY[meta.type] ?? "";
    const style = inlineStyles ? buildStyleString(meta.utilities, baseDisplay) : baseDisplay;

    if (style) attrs.push(`style="${style}"`);

    // Add classes
    const classNames = inlineStyles ? meta.classes : [...meta.classes, ...meta.utilities];

    if (classNames.length > 0) attrs.push(`class="${classNames.join(" ")}"`);

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

    if (inlineStyles) {
      // Handle .span-all for column items
      if (meta.type === LAYOUT_COLUMN && meta.classes.includes("span-all"))
        styleParts.push("column-span:all");

      for (let i = 0; i < meta.utilities.length; i++) {
        const style = resolveUtility(meta.utilities[i]);

        if (style) styleParts.push(style);
      }
    }

    if (styleParts.length > 0) attrs.push(`style="${styleParts.join(";")}"`);

    // Add classes
    const classNames = inlineStyles ? meta.classes : [...meta.classes, ...meta.utilities];

    if (classNames.length > 0) attrs.push(`class="${classNames.join(" ")}"`);

    // Add id
    if (meta.id) attrs.push(`id="${meta.id}"`);

    return `<div${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>\n`;
  };

  // Item close renderer
  md.renderer.rules["layout_item_close"] = (): string => "</div>\n";
};
