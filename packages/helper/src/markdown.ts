/**
 * Forked and modified from
 * https://github.com/markdown-it/markdown-it/blob/master/lib/rules_block/fence.mjs
 */

import type { StateBlock } from "markdown-it";

/**
 * Scan the end line of a code fence block.
 *
 * 扫描代码围栏块的结束行。
 *
 * @param state - Block parser state / 块级解析器状态
 * @param startLine - Start line of the fence / 围栏开始行
 * @param endLine - Search boundary / 搜索边界
 * @param blkIndent - Block indent of the current scope / 当前作用域的块级缩进
 * @returns The line after the fence end, or `null` if the start line is not a fence /
 *   围栏结束后的下一行；若起始行不是围栏则返回 `null`
 */
export const scanFence = (
  state: StateBlock,
  startLine: number,
  endLine: number,
  blkIndent: number,
): number | null => {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - blkIndent >= 4) return null;

  if (pos + 3 > max) return null;

  const marker = state.src.charCodeAt(pos);

  if (marker !== 0x7e /* ~ */ && marker !== 0x60 /* ` */) return null;

  // scan marker length
  let mem = pos;
  pos = state.skipChars(pos, marker);
  const len = pos - mem;

  if (len < 3) return null;

  const params = state.src.slice(pos, max);

  if (marker === 0x60 /* ` */ && params.includes("`")) return null;

  // search end of block
  let nextLine = startLine;
  let haveEndMarker = false;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) break; // unclosed => autoclose at end

    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos < max && state.sCount[nextLine] < blkIndent) break;

    if (state.src.charCodeAt(pos) !== marker) continue;
    if (state.sCount[nextLine] - blkIndent >= 4) continue;

    pos = state.skipChars(pos, marker);
    if (pos - mem < len) continue;

    pos = state.skipSpaces(pos);
    if (pos < max) continue;

    haveEndMarker = true;
    break;
  }

  return nextLine + (haveEndMarker ? 1 : 0);
};
