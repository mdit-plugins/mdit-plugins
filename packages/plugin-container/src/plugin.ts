/**
 * Forked and modified from
 * https://github.com/markdown-it/markdown-it-container/blob/master/index.mjs
 */

import type { Options, PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { MarkdownItContainerOptions } from "./options.js";

const MIN_MARKER_NUM = 3;

export const container: PluginWithOptions<MarkdownItContainerOptions> = (md, options) => {
  if (typeof options !== "object" || !options.name)
    throw new Error("[@mdit/plugin-container]: 'name' option is required.");

  const {
    name,
    marker = ":",
    validate = (params: string): boolean => params.trim().split(" ", 2)[0] === name,
    openRender = (
      tokens: Token[],
      index: number,
      mdItOptions: Options,
      _env: unknown,
      slf: Renderer,
    ): string => {
      // add a class to the opening tag
      tokens[index].attrJoin("class", name);

      return slf.renderToken(tokens, index, mdItOptions);
    },
    closeRender = (
      tokens: Token[],
      index: number,
      mdItOptions: Options,
      _env: unknown,
      slf: Renderer,
    ): string => slf.renderToken(tokens, index, mdItOptions),
  } = options;

  const markerStart = marker[0];
  const markerLength = marker.length;

  const containerRule: RuleBlock = (state, startLine, endLine, silent) => {
    const currentLineStart = state.bMarks[startLine] + state.tShift[startLine];
    const currentLineMax = state.eMarks[startLine];
    const currentLineIndent = state.sCount[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    //
    if (markerStart !== state.src[currentLineStart]) return false;

    let pos = currentLineStart + 1;

    // Check out the rest of the marker string
    for (; pos <= currentLineMax; pos++)
      if (marker[(pos - currentLineStart) % markerLength] !== state.src[pos]) break;

    const markerCount = Math.floor((pos - currentLineStart) / markerLength);

    if (markerCount < MIN_MARKER_NUM) return false;

    pos -= (pos - currentLineStart) % markerLength;

    const markup = marker.repeat(markerCount);
    const params = state.src.slice(pos, currentLineMax);

    if (!validate(params, markup)) return false;

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

    let nextLine = startLine + 1;
    let autoClosed = false;
    let nestedCount = 0;

    // Search for the end of the block
    for (
      ;
      // nextLine should be accessible outside the loop,
      // unclosed block should be auto closed by end of document.
      // also block seems to be auto closed by end of parent
      nextLine < endLine;
      nextLine++
    ) {
      const nextLineStart = state.bMarks[nextLine] + state.tShift[nextLine];
      const nextLineMax = state.eMarks[nextLine];

      if (nextLineStart < nextLineMax && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - :::
        //  test
        break;
      }

      if (markerStart !== state.src[nextLineStart]) continue;

      // closing fence should be indented less than 4 spaces
      if (state.sCount[nextLine] - state.blkIndent >= 4) continue;

      // check rest of marker
      for (pos = nextLineStart + 1; pos <= nextLineMax; pos++)
        if (marker[(pos - nextLineStart) % markerLength] !== state.src[pos]) break;

      const nextMarkerCount = Math.floor((pos - nextLineStart) / markerLength);
      if (nextMarkerCount < MIN_MARKER_NUM) continue;

      pos -= (pos - nextLineStart) % markerLength;

      if (state.skipSpaces(pos) < nextLineMax) {
        // marker with params opens a nested container instead of closing this one
        if (validate(state.src.slice(pos, nextLineMax), marker.repeat(nextMarkerCount)))
          nestedCount++;
        continue;
      }

      if (
        // closing code fence must be at least as long as the opening one
        nextMarkerCount >= markerCount &&
        // a closer with a different indent can only close this container when no nested one claims it
        (state.sCount[nextLine] === currentLineIndent || !nestedCount)
      ) {
        // found!
        autoClosed = true;
        break;
      }

      if (nestedCount) nestedCount--;
    }

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;

    // @ts-expect-error: We are creating a new type called "container"
    state.parentType = "container";

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    const openToken = state.push(`container_${name}_open`, "div", 1);

    openToken.markup = markup;
    openToken.block = true;
    openToken.info = params;
    openToken.map = [startLine, nextLine];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    const closeToken = state.push(`container_${name}_close`, "div", -1);

    closeToken.markup = markup;
    closeToken.block = true;

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

  md.block.ruler.before("fence", `container_${name}`, containerRule, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
  md.renderer.rules[`container_${name}_open`] = openRender;
  md.renderer.rules[`container_${name}_close`] = closeRender;
};
