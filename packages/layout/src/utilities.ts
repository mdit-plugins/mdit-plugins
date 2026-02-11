import { matchString } from "./directive.js";
import { DASH } from "./types.js";

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

/**
 * Parse a number from a string starting at the given position.
 *
 * @param str - source string / 源字符串
 * @param start - start position / 起始位置
 * @param end - end position / 结束位置
 * @returns parsed number or -1 if invalid / 解析的数字，无效时返回 -1
 */
export const parseNumber = (str: string, start: number, end: number): number => {
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
 * Resolve a parameterized utility class to an inline style.
 *
 * @param utility - utility class name / 工具类名
 * @returns CSS style string or empty string / CSS 样式字符串或空字符串
 */
export const resolveParameterizedUtility = (utility: string): string => {
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
export const resolveUtility = (utility: string): string =>
  STATIC_UTILITIES[utility] ?? resolveParameterizedUtility(utility);

/**
 * Build inline style string from utilities and optional base display.
 *
 * @param utilities - utility class names / 工具类名列表
 * @param baseDisplay - base display style / 基础显示样式
 * @returns CSS style string / CSS 样式字符串
 */
export const buildStyleString = (utilities: string[], baseDisplay?: string): string => {
  const parts: string[] = [];

  if (baseDisplay) parts.push(baseDisplay);

  for (let i = 0; i < utilities.length; i++) {
    const style = resolveUtility(utilities[i]);

    if (style) {
      parts.push(style);
    } else {
      // oxlint-disable-next-line no-console
      console.warn(`[layout] Unrecognized utility "${utilities[i]}" ignored.`);
    }
  }

  return parts.length > 0 ? parts.join(";") : "";
};
