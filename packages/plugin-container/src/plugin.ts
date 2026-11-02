/**
 * Forked and modified from
 * https://github.com/markdown-it/markdown-it-container/blob/master/index.mjs
 */

import { hasRule } from "@mdit/helper";
import type { BlockRule, PluginWithOptions } from "@mdit/helper";
import type { MarkdownItOptions, Renderer, RendererRule, StateBlock, Token } from "markdown-it";

import type { MarkdownItContainerOptions } from "./options.js";

const MIN_MARKER_NUM = 3;

/**
 * Result of the closing-marker scan of one container level
 *
 * A container nested inside the scanned one reuses it instead of scanning the same lines again.
 */
interface CloseScan {
  /** Line the scan stopped at, i.e. the closing marker line or the line that stopped the scan */
  closeLine: number;

  /** Marker count the scan looked for */
  markerCount: number;

  /** Scan context the scan was performed in */
  context: number;
}

/**
 * Scan context of the current parse
 *
 * Blockquotes and list items temporarily rewrite `bMarks`, `tShift` and `sCount` of the lines they
 * contain, so a scan cached for an enclosing container is not valid inside them. Every installed
 * container rule shares the context of the parse, which changes whenever a container opens outside
 * another container, i.e. at the top level or inside a blockquote or list item.
 */
const scanContexts = new WeakMap<StateBlock, number>();

/**
 * Start a new scan context for the current parse
 *
 * @param state - Block state of the current parse
 * @returns The new context
 */
const startScanContext = (state: StateBlock): number => {
  const context = (scanContexts.get(state) ?? 0) + 1;

  scanContexts.set(state, context);

  return context;
};

const defaultCloseRenderer: RendererRule = (
  tokens: Token[],
  index: number,
  mdItOptions: Required<MarkdownItOptions>,
  _env: unknown,
  self: Renderer,
): string => self.renderToken(tokens, index, mdItOptions);

// oxlint-disable-next-line max-lines-per-function
export const container: PluginWithOptions<MarkdownItContainerOptions> = (md, options) => {
  if (typeof options !== "object" || options == null || !options.name)
    throw new Error("[@mdit/plugin-container]: 'name' option is required.");

  const {
    name,
    marker = ":",
    validate = (params: string): boolean => params.trim().split(" ", 2)[0] === name,
    openRenderer,
    closeRenderer,
  } = options;

  // Render an opening tag, adding the container class to the token.
  // The class is only appended when it is not present yet, so that rendering
  // the same token stream again stays idempotent.
  const defaultOpenRenderer: RendererRule = (
    tokens: Token[],
    index: number,
    mdItOptions: Required<MarkdownItOptions>,
    _env: unknown,
    self: Renderer,
  ): string => {
    const token = tokens[index];
    const classValue = token.attrGet("class");

    if (classValue == null || !String(classValue).split(" ").includes(name))
      token.attrJoin("class", name);

    return self.renderToken(tokens, index, mdItOptions);
  };

  const markerLength = marker.length;
  // Precompute the character codes once per installation so the hot loop
  // compares numbers instead of allocating one-character strings.
  const markerCodes = Array.from({ length: markerLength }, (_, index) => marker.charCodeAt(index));
  // Closing-marker scans of the current parse, keyed by container indent.
  const closeScans = new WeakMap<StateBlock, Map<number, CloseScan>>();

  const containerRule: BlockRule = (state, startLine, endLine, silent) => {
    const currentLineStart = state.bMarks[startLine] + state.tShift[startLine];
    const currentLineMax = state.eMarks[startLine];
    const currentLineIndent = state.sCount[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    //
    if (markerCodes[0] !== state.src.charCodeAt(currentLineStart)) return false;

    let pos = currentLineStart + 1;

    // Check out the rest of the marker string
    while (pos <= currentLineMax) {
      if (markerCodes[(pos - currentLineStart) % markerLength] !== state.src.charCodeAt(pos)) break;

      pos++;
    }

    const markerCount = Math.floor((pos - currentLineStart) / markerLength);

    if (markerCount < MIN_MARKER_NUM) return false;

    pos -= (pos - currentLineStart) % markerLength;

    const markup = marker.repeat(markerCount);
    const params = state.src.slice(pos, currentLineMax);

    if (!validate(params, markup)) return false;

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

    let context = scanContexts.get(state) ?? 0;

    // Blockquotes and list items may have rewritten the line arrays, so scans cached for an
    // enclosing container cannot be reused inside them.
    if (state.parentType !== "container") context = startScanContext(state);

    let scans = closeScans.get(state);

    if (scans == null) {
      scans = new Map();
      closeScans.set(state, scans);
    }

    const enclosingScan = scans.get(currentLineIndent);

    let nextLine = startLine + 1;
    let autoClosed = false;

    if (
      // An enclosing scan with the same indent already proved that none of the lines up to the end
      // of the current range stops or closes a container with a marker at least this long, so the
      // block is auto closed at the end of the range.
      enclosingScan != null &&
      enclosingScan.context === context &&
      enclosingScan.markerCount <= markerCount &&
      enclosingScan.closeLine >= endLine
    ) {
      nextLine = endLine;
    } else {
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

        if (nextLineStart < nextLineMax && state.sCount[nextLine] < currentLineIndent) {
          // non-empty line with negative indent should stop the list:
          // - :::
          //  test
          break;
        }

        if (
          // closing fence should be indented same as opening one
          state.sCount[nextLine] === currentLineIndent &&
          // match start
          markerCodes[0] === state.src.charCodeAt(nextLineStart)
        ) {
          // check rest of marker
          for (pos = nextLineStart + 1; pos <= nextLineMax; pos++) {
            if (markerCodes[(pos - nextLineStart) % markerLength] !== state.src.charCodeAt(pos))
              break;
          }

          // closing code fence must be at least as long as the opening one
          if (Math.floor((pos - nextLineStart) / markerLength) >= markerCount) {
            // make sure tail has spaces only
            pos -= (pos - nextLineStart) % markerLength;
            pos = state.skipSpaces(pos);

            if (pos >= nextLineMax) {
              // found!
              autoClosed = true;
              break;
            }
          }
        }
      }

      scans.set(currentLineIndent, {
        closeLine: nextLine,
        markerCount,
        context,
      });
    }

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;

    state.parentType = "container";

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    // this will update the block indent
    state.blkIndent = currentLineIndent;

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
    state.blkIndent = oldBlkIndent;
    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

  const ruleName = `container_${name}`;

  // Repeated installation must not register the rule twice; a differing configuration keeps
  // the first installation's parse rule (renderers are still refreshed).
  if (!hasRule(md, ruleName, "block")) {
    md.block.ruler.before("fence", ruleName, containerRule, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });
  }

  md.renderer.rules[`${ruleName}_open`] = openRenderer ?? defaultOpenRenderer;
  md.renderer.rules[`${ruleName}_close`] = closeRenderer ?? defaultCloseRenderer;
};
