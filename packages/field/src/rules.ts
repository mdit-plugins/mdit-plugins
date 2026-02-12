import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { AllowedAttributes } from "./utils.js";
import { parseAttributes } from "./utils.js";

export interface FieldContext {
  /** Container name (e.g., "fields", "props") */
  name: string;
  /** Stack tracking the depth of nested field items for proper closing */
  depthStack: number[];
}

interface FieldStateEnv extends Record<string, unknown> {
  fieldContext?: FieldContext | undefined;
}

interface FieldStateBlock extends StateBlock {
  env: FieldStateEnv;
}

const MIN_MARKER_NUM = 3;
// Indentation from 0-3 spaces is cosmetic (visual only, does not affect nesting depth).
// 4+ spaces triggers standard Markdown code block behavior.
const MAX_COSMETIC_INDENT = 3;
const ESCAPED_AT = String.raw`\@`;
const ESCAPED_BACKSLASH = String.raw`\\`;

// Attribute key sanitization: only alphanumeric and hyphens allowed
const INVALID_KEY_CHAR_RE = /[^a-zA-Z0-9-]/;

/**
 * Check if an attribute key contains only valid characters for CSS class names.
 *
 * 检查属性键是否只包含 CSS 类名的有效字符。
 *
 * @param key - attribute key / 属性键
 * @returns whether the key is valid / 键是否有效
 */
export const isValidAttrKey = (key: string): boolean =>
  key.length > 0 && !INVALID_KEY_CHAR_RE.test(key);

export const checkFieldMarker = (
  state: StateBlock,
  start: number,
  max: number,
): false | { end: number; name: string; depth: number } => {
  if (state.src.charCodeAt(start) !== 64 /* @ */) return false;

  // Count leading @ chars for depth (depth = count, starting from 1)
  let atCount = 0;
  let pos = start;

  while (pos < max && state.src.charCodeAt(pos) === 64 /* @ */) {
    atCount++;
    pos++;
  }

  // Need at least one non-@ character before the closing @
  if (pos >= max) return false;

  const nameStart = pos;

  while (pos < max) {
    const code = state.src.charCodeAt(pos);

    if (code === 92 /* \ */) {
      pos += 2;
      continue;
    }

    if (code === 64 /* @ */) {
      // Found closing @
      const nameRaw = state.src.slice(nameStart, pos);
      const name = nameRaw.replaceAll(ESCAPED_AT, "@").replaceAll(ESCAPED_BACKSLASH, "\\");
      return { end: pos, name, depth: atCount };
    }

    pos++;
  }

  return false;
};

export const getFieldsRule =
  (name: string, classPrefix: string): RuleBlock =>
  (state: FieldStateBlock, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const indent = state.sCount[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    if (state.src.charCodeAt(start) !== 58 /* : */) return false;

    let pos = start + 1;

    // Check out the rest of the marker string
    while (pos <= max) {
      if (state.src.charCodeAt(pos) !== 58 /* : */) break;

      pos++;
    }

    const markerCount = pos - start;

    if (markerCount < MIN_MARKER_NUM) return false;

    pos = state.skipSpaces(pos);

    // check name is matched
    for (let ii = 0; ii < name.length; ii++) {
      if (state.src.charCodeAt(pos) !== name.charCodeAt(ii)) return false;

      pos++;
    }

    // Check what follows the name
    if (pos < max) {
      const charCode = state.src.charCodeAt(pos);

      if (!state.md.utils.isSpace(charCode) && charCode !== 35 /* # */) return false;
    }

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

    let id = "";
    let idStart = -1;

    for (let ii = pos; ii < max; ii++)
      if (state.src.charCodeAt(ii) === 35 /* # */) {
        idStart = ii + 1;
        break;
      }

    if (idStart !== -1) {
      let idEnd = idStart;

      while (idEnd < max && !state.md.utils.isSpace(state.src.charCodeAt(idEnd))) idEnd++;

      id = state.src.slice(idStart, idEnd);
    }

    // Search for closing fence
    let nextLine = startLine + 1;
    let autoClosed = false;

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

      if (nextLineStart < nextLineMax && state.sCount[nextLine] < indent) {
        // non-empty line with negative indent should stop the list:
        // - :::
        //  test
        break;
      }

      if (
        // closing fence should be indented same as opening one
        state.sCount[nextLine] === indent &&
        // match start
        state.src.charCodeAt(nextLineStart) === 58 /* : */
      ) {
        // check rest of marker
        for (pos = nextLineStart + 1; pos <= nextLineMax; pos++)
          if (state.src.charCodeAt(pos) !== 58 /* : */) break;

        // closing code fence must be at least as long as the opening one
        if (pos - nextLineStart >= markerCount) {
          // make sure tail has spaces only
          pos = state.skipSpaces(pos);

          if (pos >= nextLineMax) {
            // found!
            autoClosed = true;
            break;
          }
        }
      }
    }

    const oldParentType = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;
    const oldContext = state.env.fieldContext;

    // @ts-expect-error: We are setting state.parentType to a dynamic value like `${name}_field` that is not covered by the StateBlock type definition
    state.parentType = `${name}_field`;
    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;
    // this will update the block indent
    state.blkIndent = indent;

    const openToken = state.push(`${name}_fields_open`, "dl", 1);
    const markup = ":".repeat(markerCount);

    openToken.markup = markup;
    openToken.block = true;
    openToken.info = name;
    openToken.map = [startLine, nextLine + (autoClosed ? 1 : 0)];
    openToken.attrs = [
      ["class", `${classPrefix}wrapper ${name}-fields`],
      ["data-kind", name],
    ];
    if (id) openToken.attrSet("id", id);

    state.env.fieldContext = { name, depthStack: [] };

    state.md.block.tokenize(state, startLine + 1, nextLine);

    // Close any remaining open field items from the depth stack
    const depthStack = state.env.fieldContext.depthStack;

    for (let ii = depthStack.length - 1; ii >= 0; ii--) {
      // Close inner <dl> wrapper before closing parent when backtracking
      if (ii < depthStack.length - 1 && depthStack[ii + 1] > depthStack[ii]) {
        state.push(`${name}_fields_inner_close`, "dl", -1);
      }
      state.push(`${name}_field_close`, "", -1);
    }

    state.env.fieldContext = oldContext;

    const closeToken = state.push(`${name}_fields_close`, "dl", -1);

    closeToken.block = true;
    closeToken.markup = "";

    state.parentType = oldParentType;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;
    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

export const getFieldItemRule =
  (
    name: string,
    allowedAttributes: AllowedAttributes | null,
    shouldParseAttributes: boolean,
  ): RuleBlock =>
  (state: FieldStateBlock, startLine, endLine, silent) => {
    const ctx = state.env.fieldContext;

    if (!ctx || ctx.name !== name) return false;

    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    const indent = state.sCount[startLine] - state.blkIndent;

    // 0-3 spaces of indent are cosmetic; 4+ means code block, not a field item.
    // This guard protects against other plugins that increase blkIndent;
    // markdown-it's code_block rule normally consumes 4+-space lines first.
    /* istanbul ignore next -- guard for plugins that raise blkIndent above 3 */
    if (indent > MAX_COSMETIC_INDENT) return false;

    // Must match @name@ (with prefix depth)
    const marker = checkFieldMarker(state, start, max);

    if (marker === false) return false;

    if (silent) return true;

    // Parse attributes (if enabled), filtering out invalid keys
    const afterName = state.src.slice(marker.end + 1, max);
    const attributes = shouldParseAttributes
      ? parseAttributes(afterName, allowedAttributes).filter((attr) => isValidAttrKey(attr.attr))
      : [];

    const currentDepth = marker.depth;

    // Manage depth stack: close items as needed
    const depthStack = ctx.depthStack;

    // Close items that are at the same or deeper depth (sibling or backtrack)
    let lastClosedDepth = -1;

    while (depthStack.length > 0 && depthStack[depthStack.length - 1] >= currentDepth) {
      const closingDepth = depthStack[depthStack.length - 1];

      depthStack.pop();

      // Close inner <dl> wrapper before closing parent when backtracking
      if (lastClosedDepth > closingDepth) {
        state.push(`${name}_fields_inner_close`, "dl", -1);
      }

      state.push(`${name}_field_close`, "", -1);
      lastClosedDepth = closingDepth;
    }

    // Close outermost inner <dl> wrapper only when backtracking to parent level
    if (lastClosedDepth > currentDepth && depthStack.length > 0) {
      state.push(`${name}_fields_inner_close`, "dl", -1);
    }

    // Open inner <dl> wrapper only on first descent to a deeper level
    if (
      depthStack.length > 0 &&
      currentDepth > depthStack[depthStack.length - 1] &&
      lastClosedDepth < currentDepth
    ) {
      state.push(`${name}_fields_inner_open`, "dl", 1);
    }

    // Push current depth onto stack
    depthStack.push(currentDepth);

    // Search for the end of the item block content
    let nextLine = startLine + 1;

    for (; nextLine < endLine; nextLine++) {
      if (state.isEmpty(nextLine)) continue;

      const nextStart = state.bMarks[nextLine] + state.tShift[nextLine];
      const nextMax = state.eMarks[nextLine];
      const nextIndent = state.sCount[nextLine] - state.blkIndent;

      // A container marker at the container level ends the item
      if (nextIndent <= MAX_COSMETIC_INDENT && state.src.charCodeAt(nextStart) === 58 /* : */) {
        break;
      }

      // Check if it's a field marker within the cosmetic indent range
      if (nextIndent <= MAX_COSMETIC_INDENT) {
        const nextMarker = checkFieldMarker(state, nextStart, nextMax);

        // oxlint-disable-next-line typescript/strict-boolean-expressions
        if (nextMarker) {
          break;
        }
      }
    }

    const tokenOpen = state.push(`${name}_field_open`, "", 1);

    tokenOpen.attrSet("data-level", String(currentDepth));
    tokenOpen.meta = { name: marker.name, level: currentDepth, attributes };
    tokenOpen.map = [startLine, nextLine];

    const oldParentType = state.parentType;
    const oldLineMax = state.lineMax;

    // @ts-expect-error: We are creating a new type called "${name}_field_item"
    state.parentType = `${name}_field_item`;
    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    state.md.block.tokenize(state, startLine + 1, nextLine);

    state.parentType = oldParentType;
    state.lineMax = oldLineMax;

    // Note: field_close tokens are NOT pushed here. Closing is handled by:
    // (1) depth stack cleanup in getFieldsRule when exiting the container, or
    // (2) sibling/backtrack logic when encountering a field at equal or lower depth.

    state.line = nextLine;
    return true;
  };

export const getFieldsScanner =
  (name: string): ((tokens: Token[]) => void) =>
  (tokens: Token[]) => {
    for (let ii = 0; ii < tokens.length; ii++) {
      const token = tokens[ii];

      if (token.type !== `${name}_fields_open`) continue;

      const { level } = token;
      let isFieldStart = false;
      let nestingDepth = 0;

      for (let jj = ii + 1; jj < tokens.length; jj++) {
        const innerToken = tokens[jj];
        const type = innerToken.type;

        // record the nesting depth of fields
        if (type === `${name}_fields_open`) {
          nestingDepth++;
          continue;
        }

        if (type === `${name}_fields_close`) {
          if (innerToken.level === level) break;

          nestingDepth--;
          continue;
        }

        // skip processing tokens deep inside other blocks
        if (innerToken.level > level + 1 || nestingDepth > 0) {
          // hide contents before first field
          if (!isFieldStart) {
            innerToken.type = `${name}_fields_empty`;
            innerToken.hidden = true;
          }

          continue;
        }

        if (type === `${name}_field_open`) {
          isFieldStart = true;
          continue;
        }

        if (
          type === `${name}_field_close` ||
          type === `${name}_fields_inner_open` ||
          type === `${name}_fields_inner_close`
        )
          continue;

        // hide contents before first field
        innerToken.type = `${name}_fields_empty`;
        innerToken.hidden = true;
      }
    }
  };
