import { scanFence } from "@mdit/helper";
import type { StateBlock } from "markdown-it";

/*
 * Lazy, per-parse scan index for tab containers and items.
 *
 * Both the container rule and the item rule used to walk every line of their body to find the
 * closing fence / the next `@tab` marker, so nested containers re-walked their ancestors' bodies.
 * This module classifies every line of a scan range once and answers both boundaries with binary
 * searches over the recorded stop / marker / closing-fence lines.
 *
 * The index is scoped to one indentation level: only lines whose `sCount` equals the opening line's
 * indentation can close a container or start a sibling item, while shallower non-blank lines stop
 * the scan. Ranges always start at the current opening line and stop as soon as the boundary is
 * known, so building an index costs the same lines the former linear scan visited. Nested queries
 * are contained in the enclosing range, so outer indexes answer nested queries at the same
 * indentation, and the snapshot check rebuilds the index when markdown-it temporarily rewrites line
 * data (e.g. inside blockquotes).
 */

export const MIN_MARKER_NUM = 3;
export const TAB_MARKER = "@tab";

const ACTIVE_TAB_MARKER = `${TAB_MARKER}:active`;
const TAB_MARKER_LENGTH = TAB_MARKER.length;
const ACTIVE_TAB_MARKER_LENGTH = ACTIVE_TAB_MARKER.length;
const COLON = 58; /* : */
const AT = 64; /* @ */

/**
 * Check for a `@tab` or `@tab:active` marker at the given position.
 *
 * 检查给定位置是否为 `@tab` 或 `@tab:active` 标记。
 *
 * @param state - Parser state / 解析器状态
 * @param start - Marker start position / 标记起始位置
 * @param max - End of line / 行尾位置
 * @returns The marker state and title start, or `false` / 标记状态与标题起始位置，或 `false`
 */
export const checkTabMarker = (
  state: StateBlock,
  start: number,
  max: number,
): false | { isActive: boolean; pos: number } => {
  /*
   * Check out the first character quickly,
   * this should filter out most of non-uml blocks
   */
  if (state.src.charCodeAt(start) !== AT) return false;

  let pos = 1;

  // Check out the rest of the marker string
  for (; pos < ACTIVE_TAB_MARKER_LENGTH; pos++)
    if (ACTIVE_TAB_MARKER.charCodeAt(pos) !== state.src.charCodeAt(start + pos)) break;

  const isActive = pos === ACTIVE_TAB_MARKER_LENGTH;

  if (!isActive && pos !== TAB_MARKER_LENGTH) return false;

  const markerEnd = start + pos;
  const infoStart = state.skipSpaces(markerEnd);

  if (infoStart > markerEnd && infoStart < max) return { isActive, pos: infoStart };

  return false;
};

/** Cached scan result for one range of lines at one indentation. */
export interface TabScanIndex {
  /** Indentation the index was built for / 构建索引时使用的缩进 */
  indent: number;
  /** First indexed line / 索引起始行 */
  from: number;
  /** One past the last indexed line / 索引结束行（不含） */
  to: number;
  /** Snapshotted `bMarks + tShift` per line / 每行起始偏移快照 */
  lineStarts: number[];
  /** Snapshotted `sCount` per line / 每行缩进快照 */
  lineIndents: number[];
  /** End line of the fenced block covering a line, `0` when the line is not covered / 覆盖该行的围栏块结束行 */
  coveredUntil: number[];
  /** Shallower non-blank lines that stop the scan / 会使扫描终止的减少缩进行 */
  stops: number[];
  /** Lines starting a sibling `@tab` marker / 同级 `@tab` 标记行 */
  markers: number[];
  /** Lines that may close the container / 可能闭合容器的行 */
  closers: number[];
  /** Number of leading `:` characters for each closer / 每个闭合行的前导 `:` 数量 */
  closerRuns: number[];
}

const indexes = new WeakMap<StateBlock, Map<number, TabScanIndex>>();

/**
 * Build the index for `[from, to)`.
 *
 * @param state - Parser state / 解析器状态
 * @param from - First line (the opening fence or marker) / 起始行（开始围栏或标记）
 * @param to - Search boundary / 搜索边界
 * @param indent - Indentation of the opening line / 起始行的缩进
 * @param closerTarget - Required closing fence length, `-1` for item scans / 所需的闭合围栏长度，条目扫描为 `-1`
 * @returns The built index / 构建好的索引
 */
const buildIndex = (
  state: StateBlock,
  from: number,
  to: number,
  indent: number,
  closerTarget: number,
): TabScanIndex => {
  const lineStarts: number[] = [];
  const lineIndents: number[] = [];
  const coveredUntil: number[] = [];
  const stops: number[] = [];
  const markers: number[] = [];
  const closers: number[] = [];
  const closerRuns: number[] = [];
  const { src } = state;
  let coverUntil = from;
  let line = from;

  // The opening line only provides the snapshot used to detect a changed scan context; its own
  // marker/closing fence never terminates the scan, which starts on the next line.
  lineStarts.push(state.bMarks[from] + state.tShift[from]);
  lineIndents.push(state.sCount[from]);
  coveredUntil.push(0);

  for (line = from + 1; line < to; line++) {
    const lineStart = state.bMarks[line] + state.tShift[line];
    const lineMax = state.eMarks[line];
    const lineIndent = state.sCount[line];

    lineStarts.push(lineStart);
    lineIndents.push(lineIndent);
    coveredUntil.push(line < coverUntil ? coverUntil : 0);

    // markers and closing fences inside a fenced block are literal content
    if (line < coverUntil) continue;

    // blank lines never stop the scan and never hold a marker
    if (lineStart >= lineMax) continue;

    // outdented content ends the block (checked before fences, as in both block rules)
    if (lineIndent < indent) {
      stops.push(line);
      line++;
      break;
    }

    const fenceEnd = scanFence(state, line, to, indent);

    if (fenceEnd != null && fenceEnd > line) {
      coverUntil = fenceEnd;
      continue;
    }

    if (lineIndent !== indent) continue;

    const firstCode = src.charCodeAt(lineStart);

    if (firstCode === COLON) {
      let pos = lineStart + 1;

      while (src.charCodeAt(pos) === COLON) pos++;

      const run = pos - lineStart;

      // the closing fence must be at least as long as an opening fence and end the line
      if (run >= MIN_MARKER_NUM && state.skipSpaces(pos) >= lineMax) {
        closers.push(line);
        closerRuns.push(run);

        if (closerTarget >= 0 && run >= closerTarget) {
          line++;
          break;
        }
      }

      continue;
    }

    if (firstCode === AT && checkTabMarker(state, lineStart, lineMax) !== false) {
      markers.push(line);

      if (closerTarget === -1) {
        line++;
        break;
      }
    }
  }

  return {
    indent,
    from,
    to: Math.min(line, to),
    lineStarts,
    lineIndents,
    coveredUntil,
    stops,
    markers,
    closers,
    closerRuns,
  };
};

// Check that the snapshotted line data still matches the current parser state.
const isSameContext = (index: TabScanIndex, state: StateBlock, line: number): boolean => {
  const slot = line - index.from;

  return (
    index.lineStarts[slot] === state.bMarks[line] + state.tShift[line] &&
    index.lineIndents[slot] === state.sCount[line]
  );
};

// Get the index covering `[from, to)` at `indent`, building it when needed.
const getIndex = (
  state: StateBlock,
  from: number,
  to: number,
  indent: number,
  closerTarget: number,
): TabScanIndex => {
  let stateIndexes = indexes.get(state);

  if (stateIndexes == null) {
    stateIndexes = new Map();
    indexes.set(state, stateIndexes);
  }

  const cached = stateIndexes.get(indent);

  if (
    cached != null &&
    cached.from <= from &&
    cached.to >= to &&
    (cached.stops.length === 0 || cached.stops[0] > from) &&
    cached.coveredUntil[from - cached.from] <= from &&
    isSameContext(cached, state, from)
  )
    return cached;

  const index = buildIndex(state, from, to, indent, closerTarget);

  stateIndexes.set(indent, index);

  return index;
};

// Find the position of the first element strictly greater than `line` (or `-1`).
const firstAfter = (lines: number[], line: number): number => {
  let low = 0;
  let high = lines.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    if (lines[middle] <= line) low = middle + 1;
    else high = middle;
  }

  return low < lines.length ? low : -1;
};

/**
 * Find the end of a tab container body. Equivalent to the former linear scan: the first shallower
 * non-blank line stops the block, a closing fence of sufficient length closes it.
 *
 * 查找标签容器正文的结束位置。等价于原先的线性扫描：第一个缩进更浅的非空行会终止块，足够长的闭合围栏会关闭它。
 *
 * @param state - Parser state / 解析器状态
 * @param openerLine - Line of the container opening fence / 容器开始围栏所在行
 * @param endLine - Search boundary / 搜索边界
 * @param indent - Indentation of the opening fence / 开始围栏的缩进
 * @param markerCount - Length of the opening fence / 开始围栏的长度
 * @returns The body end line and whether the closing fence was found / 正文结束行及是否找到闭合围栏
 */
export const findContainerEnd = (
  state: StateBlock,
  openerLine: number,
  endLine: number,
  indent: number,
  markerCount: number,
): { line: number; hasEnd: boolean } => {
  const index = getIndex(state, openerLine, endLine, indent, markerCount);
  const stop = index.stops.length > 0 ? Math.min(index.stops[0], endLine) : endLine;
  const { closers, closerRuns } = index;

  let position = firstAfter(closers, openerLine);

  while (position !== -1 && closers[position] < stop) {
    if (closerRuns[position] >= markerCount) return { line: closers[position], hasEnd: true };

    position = firstAfter(closers, closers[position]);
  }

  return { line: stop, hasEnd: false };
};

/**
 * Find the end of a tab item body. Equivalent to the former linear scan: the first shallower
 * non-blank line or the next sibling `@tab` marker ends the item.
 *
 * 查找标签条目正文的结束位置。等价于原先的线性扫描：第一个缩进更浅的非空行或下一个同级 `@tab` 标记会结束条目。
 *
 * @param state - Parser state / 解析器状态
 * @param openerLine - Line of the item marker / 条目标记所在行
 * @param endLine - Search boundary / 搜索边界
 * @param indent - Indentation of the item marker / 条目标记的缩进
 * @returns The end line of the item body / 条目正文的结束行
 */
export const findItemEnd = (
  state: StateBlock,
  openerLine: number,
  endLine: number,
  indent: number,
): number => {
  const index = getIndex(state, openerLine, endLine, indent, -1);
  const stop = index.stops.length > 0 ? Math.min(index.stops[0], endLine) : endLine;
  const markerPosition = firstAfter(index.markers, openerLine);

  if (markerPosition === -1) return stop;

  return Math.min(index.markers[markerPosition], stop);
};
