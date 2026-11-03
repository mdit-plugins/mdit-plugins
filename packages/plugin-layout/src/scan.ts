import { scanFence } from "@mdit/helper";

import { AT } from "./constant.js";
import { detectDirective } from "./directive.js";
import type { LayoutStateBlock } from "./types.js";

/*
 * Lazy, per-parse scan index.
 *
 * `findMatchingEnd` and the item boundary scan used to walk every line of every container body.
 * Nested containers therefore re-walked their ancestors' bodies, making rendering cost
 * Θ(lines × depth). This module classifies every line of a scan range once and resolves the nearest
 * matching `@end` / sibling item while walking forward with pending-opener buckets.
 *
 * A range always starts at the current opener line and stops as soon as the opener's boundary is
 * known, so building an index costs the same lines the former linear scan visited. Nested queries
 * are contained in the parent's range, so the parent's index also answers the containers and items
 * inside it. The index snapshots the per-line data it used; when markdown-it's block rules
 * temporarily rewrite line data (for example inside a blockquote) the snapshot no longer matches and
 * the index is rebuilt for the current view. Queries are issued from left to right, so a rebuilt
 * index never has to answer a query starting before its first line.
 */

/** Cached scan result for one range of lines at one block indent. */
export interface LayoutScanIndex {
  /** Block indent the index was built for / 构建索引时使用的块级缩进 */
  blkIndent: number;
  /** First indexed line / 索引起始行 */
  from: number;
  /** One past the last indexed line / 索引结束行（不含） */
  to: number;
  /** Snapshotted `bMarks + tShift` per line / 每行起始偏移快照 */
  lineStarts: number[];
  /** Snapshotted `sCount` per line / 每行缩进快照 */
  lineIndents: number[];
  /** Matching closer line for a directive line, `-1` when there is none / 指令行对应的结束行 */
  matches: number[];
  /** End line of the fenced block covering a line, `0` when the line is not covered / 覆盖该行的围栏块结束行 */
  coveredUntil: number[];
  /** Outdented non-blank lines that stop a container scan / 会终止容器扫描的减少缩进行 */
  stops: number[];
}

const indexes = new WeakMap<LayoutStateBlock, Map<number, LayoutScanIndex>>();

type LayoutDirective = NonNullable<ReturnType<typeof detectDirective>>;

interface LayoutScanContext {
  from: number;
  matches: number[];
  endOpeners: Map<number, number[]>;
  itemOpeners: Map<number, number[]>;
}

// Resolve pending openers with the closing line and reset the bucket
const resolveOpeners = (
  openers: number[] | undefined,
  line: number,
  context: LayoutScanContext,
): number[] => {
  if (openers == null) return [];

  const { from, matches } = context;

  for (let i = 0; i < openers.length; i++) matches[openers[i] - from] = line;

  openers.length = 0;

  return openers;
};

// Track a directive line and resolve the opener buckets it closes
const recordDirective = (
  directive: LayoutDirective,
  line: number,
  context: LayoutScanContext,
): void => {
  const { endOpeners, itemOpeners } = context;

  if (directive.kind === "end") {
    resolveOpeners(endOpeners.get(directive.depth), line, context);
    return;
  }

  if (directive.kind === "item") {
    // `depth * 4 + type` is unique for `type` in 1..3
    const key = directive.depth * 4 + directive.type;
    let openers = itemOpeners.get(key);

    if (openers == null) {
      openers = [];
      itemOpeners.set(key, openers);
    } else {
      resolveOpeners(openers, line, context);
    }

    openers.push(line);
    return;
  }

  const openers = endOpeners.get(directive.depth);

  if (openers == null) endOpeners.set(directive.depth, [line]);
  else openers.push(line);
};

/**
 * Build the index for `[from, to)`.
 *
 * @param state - Parser state / 解析器状态
 * @param from - First line (the opening directive) / 起始行（开始指令）
 * @param to - Search boundary / 搜索边界
 * @param blkIndent - Block indent of the enclosing context / 外层上下文的块级缩进
 * @param stopAtOutdent - Whether outdented lines terminate the scan (container scans only) /
 *   减少缩进行是否终止扫描（仅容器扫描）
 * @returns The built index / 构建好的索引
 */
const buildIndex = (
  state: LayoutStateBlock,
  from: number,
  to: number,
  blkIndent: number,
  stopAtOutdent: boolean,
): LayoutScanIndex => {
  const lineStarts: number[] = [];
  const lineIndents: number[] = [];
  const matches: number[] = [];
  const coveredUntil: number[] = [];
  const stops: number[] = [];
  const context: LayoutScanContext = {
    from,
    matches,
    endOpeners: new Map(),
    itemOpeners: new Map(),
  };
  const { src } = state;
  const { isSpace } = state.md.utils;
  let coverUntil = from;
  let line = from;

  for (; line < to; line++) {
    const lineStart = state.bMarks[line] + state.tShift[line];
    const lineMax = state.eMarks[line];
    const lineIndent = state.sCount[line];

    lineStarts.push(lineStart);
    lineIndents.push(lineIndent);
    matches.push(-1);
    coveredUntil.push(line < coverUntil ? coverUntil : 0);

    // lines inside a fenced block are literal text
    if (line < coverUntil) continue;

    // blank lines never contain a directive
    if (lineStart >= lineMax) continue;

    // blockquote lazy continuation lines use `sCount === -1`; they are content, not outdents
    if (lineIndent < 0) continue;

    // 4+ spaces relative to blkIndent is an indented code block or lazy continuation
    if (lineIndent - blkIndent >= 4) continue;

    // Outdented lines stop a container scan before fences are considered. Item scans never reach
    // an outdented line inside a container body, so they keep looking for sibling items instead.
    if (stopAtOutdent && lineIndent < blkIndent) {
      stops.push(line);
      break;
    }

    const fenceEnd = scanFence(state, line, to, blkIndent);

    if (fenceEnd != null && fenceEnd > line) {
      coverUntil = fenceEnd;
      continue;
    }

    if (src.charCodeAt(lineStart) === AT) {
      const directive = detectDirective(src, lineStart, lineMax, isSpace);

      if (directive != null) recordDirective(directive, line, context);
    }

    // The opening line's boundary is known, stop scanning the rest of the parent range
    if (matches[0] !== -1) break;
  }

  return {
    blkIndent,
    from,
    to: Math.min(line + 1, to),
    lineStarts,
    lineIndents,
    matches,
    coveredUntil,
    stops,
  };
};

// Check that the snapshotted line data still matches the current parser state.
const isSameContext = (index: LayoutScanIndex, state: LayoutStateBlock, line: number): boolean => {
  const slot = line - index.from;

  return (
    index.lineStarts[slot] === state.bMarks[line] + state.tShift[line] &&
    index.lineIndents[slot] === state.sCount[line]
  );
};

// Get the index covering `[from, to)` at `blkIndent`, building it when needed.
const getIndex = (
  state: LayoutStateBlock,
  from: number,
  to: number,
  blkIndent: number,
  stopAtOutdent: boolean,
): LayoutScanIndex => {
  let stateIndexes = indexes.get(state);

  if (stateIndexes == null) {
    stateIndexes = new Map();
    indexes.set(state, stateIndexes);
  }

  const cached = stateIndexes.get(blkIndent);

  if (
    cached != null &&
    cached.from <= from &&
    cached.to >= to &&
    (cached.stops.length === 0 || cached.stops[0] > from) &&
    cached.coveredUntil[from - cached.from] <= from &&
    isSameContext(cached, state, from)
  )
    return cached;

  const index = buildIndex(state, from, to, blkIndent, stopAtOutdent);

  stateIndexes.set(blkIndent, index);

  return index;
};

/**
 * Find the end of a container body. Equivalent to the former linear `findMatchingEnd` scan: the
 * first outdented line or the first `@end` with the same number of leading `@` terminates the
 * body.
 *
 * 查找容器正文的结束位置。等价于原先的线性 `findMatchingEnd` 扫描：第一个减少缩进的行或第一个具有相同前导 `@` 数量的 `@end` 会终止正文。
 *
 * @param state - Parser state / 解析器状态
 * @param openerLine - Line of the container opening directive / 容器开始指令所在行
 * @param endLine - Search boundary / 搜索边界
 * @param blkIndent - Block indent of the enclosing context / 外层上下文的块级缩进
 * @returns The body end line and whether an explicit `@end` was found / 正文结束行及是否找到显式 `@end`
 */
export const findMatchingEnd = (
  state: LayoutStateBlock,
  openerLine: number,
  endLine: number,
  blkIndent: number,
): { line: number; hasEnd: boolean } => {
  const index = getIndex(state, openerLine, endLine, blkIndent, true);
  const match = index.matches[openerLine - index.from];
  const stop = index.stops.length > 0 ? index.stops[0] : -1;
  const limit = stop !== -1 && stop < endLine ? stop : endLine;

  return match !== -1 && match < limit
    ? { line: match, hasEnd: true }
    : { line: limit, hasEnd: false };
};

/**
 * Find the line after the last line of an item body. Equivalent to the former linear sibling scan:
 * the first sibling item directive with the same type and number of leading `@`.
 *
 * 查找条目正文的结束位置。等价于原先的线性同级扫描：第一个类型相同且前导 `@` 数量相同的同级条目的行。
 *
 * @param state - Parser state / 解析器状态
 * @param openerLine - Line of the item opening directive / 条目开始指令所在行
 * @param endLine - Search boundary / 搜索边界
 * @param blkIndent - Block indent of the enclosing context / 外层上下文的块级缩进
 * @returns The end line of the item body / 条目正文的结束行
 */
export const findItemEnd = (
  state: LayoutStateBlock,
  openerLine: number,
  endLine: number,
  blkIndent: number,
): number => {
  const index = getIndex(state, openerLine, endLine, blkIndent, false);
  const match = index.matches[openerLine - index.from];

  return match !== -1 && match < endLine ? match : endLine;
};
