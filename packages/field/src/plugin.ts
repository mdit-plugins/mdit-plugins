import type { PluginWithOptions } from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";

import type { MarkdownItFieldOptions } from "./options.js";
import {
  defaultFieldCloseRender,
  getDefaultFieldOpenRender,
  defaultFieldsCloseRender,
  defaultFieldsOpenRender,
} from "./render.js";
import type { AllowedAttributes } from "./utils.js";
import { normalizeAttributes, parseAttributes } from "./utils.js";

interface FieldStateEnv extends Record<string, unknown> {
  fieldName: string;
  fieldDepthStack: number[];
}

interface FieldStateBlock extends StateBlock {
  env: FieldStateEnv;
}

const MIN_MARKER_NUM = 3;
const MAX_COSMETIC_INDENT = 3;
const ESCAPED_AT = String.raw`\@`;
const ESCAPED_BACKSLASH = String.raw`\\`;

const checkFieldMarker = (
  state: StateBlock,
  start: number,
  max: number,
): false | { end: number; name: string; depth: number } => {
  if (state.src.charCodeAt(start) !== 64 /* @ */) return false;

  // Count leading @ chars for depth
  let depth = 0;
  let pos = start;

  while (pos < max && state.src.charCodeAt(pos) === 64 /* @ */) {
    depth++;
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
      return { end: pos, name, depth: depth - 1 };
    }

    pos++;
  }

  return false;
};

const getFieldsRule =
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
    const oldName = state.env.fieldName;
    const oldDepthStack = state.env.fieldDepthStack;

    // @ts-expect-error: We are setting state.parentType to a dynamic value like `${name}_field` that is not covered by the StateBlock type definition
    state.parentType = `${name}_field`;
    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;
    // this will update the block indent
    state.blkIndent = indent;

    const openToken = state.push(`${name}_fields_open`, "div", 1);
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

    state.env.fieldName = name;
    state.env.fieldDepthStack = [];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    // Close any remaining open field items from the depth stack
    const depthStack = state.env.fieldDepthStack;

    for (let ii = depthStack.length - 1; ii >= 0; ii--) {
      state.push(`${name}_field_close`, "div", -1);
    }

    state.env.fieldName = oldName;
    state.env.fieldDepthStack = oldDepthStack;

    const closeToken = state.push(`${name}_fields_close`, "div", -1);

    closeToken.block = true;
    closeToken.markup = "";

    state.parentType = oldParentType;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;
    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

const getFieldItemRule =
  (
    name: string,
    classPrefix: string,
    allowedAttributes: AllowedAttributes | null,
    shouldParseAttributes: boolean,
  ): RuleBlock =>
  (state: FieldStateBlock, startLine, endLine, silent) => {
    if (state.env.fieldName !== name) return false;

    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    const indent = state.sCount[startLine] - state.blkIndent;

    // 0-3 spaces of indent are cosmetic; 4+ means code block, not a field item
    if (indent > MAX_COSMETIC_INDENT) return false;

    // Must match @name@ (with prefix depth)
    const marker = checkFieldMarker(state, start, max);

    if (marker === false) return false;

    if (silent) return true;

    // Parse attributes (if enabled)
    const afterName = state.src.slice(marker.end + 1, max);
    const attributes = shouldParseAttributes ? parseAttributes(afterName, allowedAttributes) : [];

    const currentDepth = marker.depth;

    // Manage depth stack: close items as needed
    const depthStack = state.env.fieldDepthStack;

    // Close items that are at the same or deeper depth (sibling or backtrack)
    while (depthStack.length > 0 && depthStack[depthStack.length - 1] >= currentDepth) {
      depthStack.pop();
      state.push(`${name}_field_close`, "div", -1);
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

    const tokenOpen = state.push(`${name}_field_open`, "div", 1);

    tokenOpen.attrSet("class", `${classPrefix}item`);
    tokenOpen.attrSet("data-level", String(currentDepth));
    tokenOpen.meta = { name: marker.name, level: currentDepth, attributes };
    tokenOpen.map = [startLine, nextLine];

    const oldParentType = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;

    // @ts-expect-error: We are creating a new type called "${name}_field_item"
    state.parentType = `${name}_field_item`;
    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    // Adjust blkIndent for content within this item
    // Cosmetic indentation does not affect block indent

    state.md.block.tokenize(state, startLine + 1, nextLine);

    state.parentType = oldParentType;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;

    // Note: we do NOT push field_close here.
    // The close is handled by the depth stack in getFieldsRule or by sibling/backtrack logic above.

    state.line = nextLine;
    return true;
  };

const getFieldsScanner =
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

        if (type === `${name}_field_close`) continue;

        // hide contents before first field
        innerToken.type = `${name}_fields_empty`;
        innerToken.hidden = true;
      }
    }
  };

/**
 * Field plugin
 *
 * 字段插件
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param options - Field options / 字段选项
 */
export const field: PluginWithOptions<MarkdownItFieldOptions> = (
  md,
  {
    name = "fields",
    classPrefix = "field-",
    parseAttributes: shouldParseAttributes = true,
    allowedAttributes,
    fieldsOpenRender = defaultFieldsOpenRender,
    fieldsCloseRender = defaultFieldsCloseRender,
    fieldOpenRender,
    fieldCloseRender = defaultFieldCloseRender,
  } = {},
) => {
  const normalizedAttributes = normalizeAttributes(allowedAttributes);
  const fieldsScanner = getFieldsScanner(name);
  const resolvedFieldOpenRender = fieldOpenRender ?? getDefaultFieldOpenRender(classPrefix);

  md.block.ruler.before("fence", name, getFieldsRule(name, classPrefix), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  // Insert field_item before paragraph (and maybe other block things that could swallow it)
  // Inside fields container, paragraphs starting with @ should be field items.
  md.block.ruler.before(
    "paragraph",
    `${name}_item`,
    getFieldItemRule(name, classPrefix, normalizedAttributes, shouldParseAttributes),
    {
      alt: ["paragraph", "reference", "blockquote", "list"],
    },
  );

  md.renderer.rules[`${name}_fields_open`] = fieldsOpenRender;
  md.renderer.rules[`${name}_fields_close`] = fieldsCloseRender;

  md.renderer.rules[`${name}_field_open`] = resolvedFieldOpenRender;
  md.renderer.rules[`${name}_field_close`] = fieldCloseRender;

  // Run the scanner as a core rule to move pre-field content hiding to parse phase
  md.core.ruler.push(`${name}_fields_scanner`, (state) => {
    fieldsScanner(state.tokens);
  });
};
