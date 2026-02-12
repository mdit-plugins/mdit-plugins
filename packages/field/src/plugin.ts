import type { PluginWithOptions } from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";

import type { MarkdownItFieldOptions } from "./options.js";
import {
  defaultFieldCloseRender,
  defaultFieldOpenRender,
  defaultFieldsCloseRender,
  defaultFieldsOpenRender,
} from "./render.js";
import type { AllowedAttributes } from "./utils.js";
import { normalizeAttributes, parseAttributes } from "./utils.js";

interface FieldStateEnv extends Record<string, unknown> {
  fieldName: string;
  fieldIndent: number;
}

interface FieldStateBlock extends StateBlock {
  env: FieldStateEnv;
}

const MIN_MARKER_NUM = 3;
const ESCAPED_AT = String.raw`\@`;
const ESCAPED_BACKSLASH = String.raw`\\`;

const checkFieldMarker = (
  state: StateBlock,
  start: number,
  max: number,
): false | { end: number; name: string } => {
  if (state.src.charCodeAt(start) !== 64 /* @ */) return false;

  let pos = start + 1;
  while (pos < max) {
    const code = state.src.charCodeAt(pos);

    if (code === 92 /* \ */) {
      pos += 2;
      continue;
    }

    if (code === 64 /* @ */) {
      // Found closing @
      const nameRaw = state.src.slice(start + 1, pos);
      const name = nameRaw.replaceAll(ESCAPED_AT, "@").replaceAll(ESCAPED_BACKSLASH, "\\");
      return { end: pos, name };
    }

    pos++;
  }

  return false;
};

const getFieldsRule =
  (name: string): RuleBlock =>
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
    for (let i = 0; i < name.length; i++) {
      if (state.src.charCodeAt(pos) !== name.charCodeAt(i)) return false;

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

    for (let i = pos; i < max; i++)
      if (state.src.charCodeAt(i) === 35 /* # */) {
        idStart = i + 1;
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
    const oldIndent = state.env.fieldIndent;

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
      ["class", `field-wrapper ${name}-fields`],
      ["data-kind", name],
    ];
    if (id) openToken.attrSet("id", id);

    state.env.fieldName = name;
    state.env.fieldIndent = state.blkIndent;

    state.md.block.tokenize(state, startLine + 1, nextLine);

    state.env.fieldName = oldName;
    state.env.fieldIndent = oldIndent;

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
  (name: string, allowedAttributes: AllowedAttributes | null): RuleBlock =>
  (state: FieldStateBlock, startLine, endLine, silent) => {
    if (state.env.fieldName !== name) return false;

    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    const indent = state.sCount[startLine] - state.blkIndent;

    // Must match @name@
    const marker = checkFieldMarker(state, start, max);

    if (marker === false) return false;

    if (silent) return true;

    // Parse attributes
    const afterName = state.src.slice(marker.end + 1, max);
    const attributes = parseAttributes(afterName, allowedAttributes);

    // Search for the end of the item block
    let nextLine = startLine + 1;

    for (; nextLine < endLine; nextLine++) {
      // Skip empty lines? Markdown blocks usually include empty lines.
      if (state.isEmpty(nextLine)) continue;

      const nextStart = state.bMarks[nextLine] + state.tShift[nextLine];
      const nextMax = state.eMarks[nextLine];
      const nextIndent = state.sCount[nextLine] - state.blkIndent;

      // Check indentation to determine if it's a sibling or parent
      // If indentation is equal or less than current item, it's a new item or end of current item
      if (nextIndent < indent) break;

      // We should stop if we hit a container marker at the same level (or parent level) as the current container
      if (nextIndent <= 0 && state.src.charCodeAt(nextStart) === 58 /* : */) {
        break;
      }

      // Check if it's a field marker
      const nextMarker = checkFieldMarker(state, nextStart, nextMax);

      // oxlint-disable-next-line typescript/strict-boolean-expressions
      if (nextMarker && nextIndent <= indent) {
        break;
      }
    }

    const tokenOpen = state.push(`${name}_field_open`, "div", 1);
    tokenOpen.attrSet("class", "field-item");

    const level = Math.floor((state.sCount[startLine] - state.env.fieldIndent) / 2);

    tokenOpen.attrSet("data-level", String(level));
    tokenOpen.meta = { name: marker.name, level, attributes };
    tokenOpen.map = [startLine, nextLine];

    const oldParentType = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;

    // @ts-expect-error: We are creating a new type called "${name}_field_item"
    state.parentType = `${name}_field_item`;
    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    // Shift block indent specifically for the content of this item.
    state.blkIndent += indent;

    state.md.block.tokenize(state, startLine + 1, nextLine);

    state.parentType = oldParentType;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;

    state.push(`${name}_field_close`, "div", -1);

    state.line = nextLine;
    return true;
  };

const getFieldsScanner =
  (name: string): ((tokens: Token[], index: number) => void) =>
  (tokens: Token[], index: number) => {
    let isFieldStart = false;
    let nestingDepth = 0;
    const { level } = tokens[index];

    for (
      // skip the current fields_open token
      let i = index + 1;
      i < tokens.length;
      i++
    ) {
      const token = tokens[i];
      const type = token.type;

      // record the nesting depth of fields
      if (type === `${name}_fields_open`) {
        nestingDepth++;
        continue;
      }

      if (type === `${name}_fields_close`) {
        if (token.level === level) break;

        nestingDepth--;
        continue;
      }

      // skip processing tokens deep inside other blocks
      if (token.level > level + 1 || nestingDepth > 0) {
        // hide contents before first field
        if (!isFieldStart) {
          token.type = `${name}_fields_empty`;
          token.hidden = true;
        }

        continue;
      }

      if (type === `${name}_field_open`) {
        isFieldStart = true;
        continue;
      }

      if (type === `${name}_field_close`) continue;

      // hide contents before first field
      token.type = `${name}_fields_empty`;
      token.hidden = true;
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
    allowedAttributes,
    fieldsOpenRender = defaultFieldsOpenRender,
    fieldsCloseRender = defaultFieldsCloseRender,
    fieldOpenRender = defaultFieldOpenRender,
    fieldCloseRender = defaultFieldCloseRender,
  } = {},
) => {
  const normalizedAttributes = normalizeAttributes(allowedAttributes);
  const fieldsScanner = getFieldsScanner(name);

  md.block.ruler.before("fence", name, getFieldsRule(name), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  // Insert field_item before paragraph (and maybe other block things that could swallow it)
  // Inside fields container, paragraphs starting with @ should be field items.
  md.block.ruler.before("paragraph", `${name}_item`, getFieldItemRule(name, normalizedAttributes), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  // oxlint-disable-next-line jsdoc/require-param, jsdoc/require-returns
  md.renderer.rules[`${name}_fields_open`] = (tokens, index, options, env, self): string => {
    fieldsScanner(tokens, index);

    return fieldsOpenRender(tokens, index, options, env, self);
  };

  md.renderer.rules[`${name}_fields_close`] = fieldsCloseRender;

  md.renderer.rules[`${name}_field_open`] = fieldOpenRender;
  md.renderer.rules[`${name}_field_close`] = fieldCloseRender;
};
