import {
  AT,
  COLUMN,
  DOT,
  END,
  FLEX,
  GRID,
  HASH,
  LAYOUT_COLUMN,
  LAYOUT_FLEX,
  LAYOUT_GRID,
  SPACE,
} from "./types.js";

/**
 * Check if a string matches a target starting at the given position.
 *
 * @param src - source string / 源字符串
 * @param pos - current position / 当前位置
 * @param target - target string to match / 要匹配的目标字符串
 * @returns whether the string matches / 是否匹配
 */
export const matchString = (src: string, pos: number, target: string): boolean => {
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
export const isDirectiveBoundary = (code: number): boolean =>
  code === DOT || code === HASH || code === SPACE;

/**
 * Detect the type of layout directive at the given position.
 * Supports both single `@` (depth 1) and multiple `@@...`
 * (depth = number of `@`) modes.
 *
 * 检测给定位置的布局指令类型。
 * 支持单 `@`（depth 1）和多 `@@...`（depth = `@` 数量）。
 *
 * @param src - source string / 源字符串
 * @param pos - position (should point to '@') / 位置（应指向 '@'）
 * @param max - end of line / 行尾位置
 * @returns detection result or null / 检测结果或 null
 */
export const detectDirective = (
  src: string,
  pos: number,
  max: number,
): { kind: "container" | "item" | "end"; type: number; nameEnd: number; depth: number } | null => {
  if (src.charCodeAt(pos) !== AT) return null;

  // Count consecutive @ symbols for prefix-based nesting
  let atCount = 1;
  let afterAt = pos + 1;

  while (afterAt < max && src.charCodeAt(afterAt) === AT) {
    atCount++;
    afterAt++;
  }

  const depth = atCount;

  // Check for "end"
  if (matchString(src, afterAt, END) && afterAt + END.length <= max) {
    const endPos = afterAt + END.length;

    if (endPos >= max || src.charCodeAt(endPos) === SPACE)
      return { kind: "end", type: 0, nameEnd: endPos, depth };
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
      return { kind: "container", type: LAYOUT_FLEX, nameEnd: afterFlex + 1, depth };

    // "flex" (item)
    if (afterFlex >= max || isDirectiveBoundary(src.charCodeAt(afterFlex)))
      return { kind: "item", type: LAYOUT_FLEX, nameEnd: afterFlex, depth };
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
      return { kind: "container", type: LAYOUT_GRID, nameEnd: afterGrid + 1, depth };

    // "grid" (item)
    if (afterGrid >= max || isDirectiveBoundary(src.charCodeAt(afterGrid)))
      return { kind: "item", type: LAYOUT_GRID, nameEnd: afterGrid, depth };
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
      return { kind: "container", type: LAYOUT_COLUMN, nameEnd: afterColumn + 1, depth };

    // "column" (item)
    if (afterColumn >= max || isDirectiveBoundary(src.charCodeAt(afterColumn)))
      return { kind: "item", type: LAYOUT_COLUMN, nameEnd: afterColumn, depth };
  }

  return null;
};

/**
 * Parse selectors and utilities from the directive line after the directive name.
 *
 * @param src - source string / 源字符串
 * @param startPos - position after the directive name / 指令名称后的位置
 * @param max - end of line / 行尾位置
 * @returns parsed metadata / 解析后的元数据
 */
export const parseAttributes = (
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
