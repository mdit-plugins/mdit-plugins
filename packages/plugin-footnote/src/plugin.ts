/** Forked from https://github.com/markdown-it/markdown-it-footnote/blob/master/index.mjs */

import { hasRule } from "@mdit/helper";
import type { BlockRule, CoreRule, InlineRule, PluginWithOptions } from "@mdit/helper";
import type { StateBlock, StateCore, StateInline, Token } from "markdown-it";

import type { FootnoteOptions } from "./options.js";
import {
  applyAttrs,
  cloneTokenWithChildren,
  createBackReferenceTokens,
  createBlockToken,
  createToken,
  getFootnoteAnchorName,
  getFootnoteSuffix,
  normalizeTokenLevels,
  replaceFootnoteRefs,
} from "./tokens.js";
import type { FootNoteEnv } from "./types.js";

interface FootNoteStateBlock extends StateBlock {
  env: FootNoteEnv;
}

interface FootNoteStateInline extends StateInline {
  env: FootNoteEnv;
}

interface FootNoteStateCore extends StateCore {
  env: FootNoteEnv;
}

// Process footnote block definition
const footnoteDef: BlockRule = (state: FootNoteStateBlock, startLine, endLine, silent) => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  let charCode: number;

  if (
    // line should be at least 5 chars - "[^x]:"
    start + 4 > max ||
    state.src.charCodeAt(start) !== 91 /* [ */ ||
    state.src.charCodeAt(start + 1) !== 94 /* ^ */
  )
    return false;

  let pos = start + 2;

  while (pos < max) {
    charCode = state.src.charCodeAt(pos);
    if (charCode === 32 /* space */) return false;

    if (charCode === 93 /* ] */) break;

    pos++;
  }

  if (
    // empty footnote label
    pos === start + 2 ||
    pos + 1 >= max ||
    state.src.charCodeAt(++pos) !== 58 /* : */
  )
    return false;

  if (silent) return true;

  pos++;

  (state.env.footnotes ??= {}).refs ??= {};

  const label = state.src.slice(start + 2, pos - 2);

  state.env.footnotes.refs[`:${label}`] = -1;

  const referenceOpenToken = state.push("footnote_reference_open", "", 1);

  referenceOpenToken.meta = { label };
  referenceOpenToken.level = state.level++;

  const oldBMark = state.bMarks[startLine];
  const oldTShift = state.tShift[startLine];
  const oldSCount = state.sCount[startLine];
  const oldParentType = state.parentType;
  const posAfterColon = pos;
  const initial =
    state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

  let offset = initial;

  while (pos < max) {
    charCode = state.src.charCodeAt(pos);

    if (charCode === 9 /* \t */) offset += 4 - (offset % 4);
    else if (charCode === 32 /* space */) offset++;
    else break;

    pos++;
  }

  state.tShift[startLine] = pos - posAfterColon;
  state.sCount[startLine] = offset - initial;
  state.bMarks[startLine] = posAfterColon;
  state.blkIndent += 4;
  state.parentType = "footnote";

  if (state.sCount[startLine] < state.blkIndent) state.sCount[startLine] += state.blkIndent;

  state.md.block.tokenize(state, startLine, endLine);

  state.parentType = oldParentType;
  state.blkIndent -= 4;
  state.tShift[startLine] = oldTShift;
  state.sCount[startLine] = oldSCount;
  state.bMarks[startLine] = oldBMark;

  const referenceCloseToken = state.push("footnote_reference_close", "", -1);

  referenceCloseToken.level = --state.level;

  return true;
};

// Process inline footnotes (^[...])
const footnoteInline: InlineRule = (state: FootNoteStateInline, silent) => {
  const max = state.posMax;
  const start = state.pos;

  if (
    start + 2 >= max ||
    state.src.charCodeAt(start) !== 94 /* ^ */ ||
    state.src.charCodeAt(start + 1) !== 91 /* [ */
  )
    return false;

  const labelEnd = state.md.helpers.parseLinkLabel(state, start + 1);

  // parser failed to find ']', so it’s not a valid note
  if (labelEnd < 0) return false;

  const labelStart = start + 2;

  /*
   * We found the end of the link, and know for a fact it’s a valid link;
   * so all that’s left to do is to call tokenizer.
   *
   */
  // silent mode is hard to trigger with standard syntax
  // this is more like a guard to prevent run tokenizer in silent mode
  if (!silent) {
    const list = ((state.env.footnotes ??= {}).list ??= []);
    const footnoteId = list.length;
    const tokens: Token[] = [];

    state.md.inline.parse(state.src.slice(labelStart, labelEnd), state.md, state.env, tokens);

    const refToken = state.push("footnote_ref", "", 0);

    refToken.meta = { id: footnoteId };

    state.env.footnotes.list[footnoteId] = {
      content: state.src.slice(labelStart, labelEnd),
      tokens,
    };
  }

  state.pos = labelEnd + 1;
  state.posMax = max;

  return true;
};

// Process footnote references ([^...])
const footnoteRef: InlineRule = (state: FootNoteStateInline, silent) => {
  const start = state.pos;
  const max = state.posMax;

  if (
    // should be at least 4 chars - "[^x]"
    start + 3 > max ||
    !state.env.footnotes?.refs ||
    state.src.charCodeAt(start) !== 91 /* [ */ ||
    state.src.charCodeAt(start + 1) !== 94 /* ^ */
  )
    return false;

  let pos = start + 2;
  let charCode: number;

  while (pos < max) {
    charCode = state.src.charCodeAt(pos);
    if (charCode === 32 /* space */ || charCode === 10 /* \n */) return false;

    if (charCode === 93 /* ] */) break;

    pos++;
  }

  // empty footnote labels
  if (pos === start + 2 || pos >= max) return false;

  pos++;

  const label = state.src.slice(start + 2, pos - 1);

  if (typeof state.env.footnotes.refs[`:${label}`] !== "number") return false;

  // silent mode is hard to trigger with standard syntax
  // this is more like a guard to prevent run tokenizer in silent mode
  if (!silent) {
    const list = (state.env.footnotes.list ??= []);
    const { refs } = state.env.footnotes;
    let footnoteId: number;

    if (refs[`:${label}`] < 0) {
      footnoteId = list.length;
      list[footnoteId] = { label, count: 0 };
      refs[`:${label}`] = footnoteId;
    } else {
      footnoteId = refs[`:${label}`];
    }

    // oxlint-disable-next-line typescript/no-non-null-assertion
    const subId = list[footnoteId].count!;

    // oxlint-disable-next-line typescript/no-non-null-assertion
    list[footnoteId].count! += 1;

    const refToken = state.push("footnote_ref", "", 0);

    refToken.meta = { id: footnoteId, subId, label };
  }

  state.pos = pos;
  state.posMax = max;

  return true;
};

/**
 * Create the footnote tail core rule / 创建脚注收尾的 core 规则
 *
 * @param options - Plugin options / 插件选项
 * @returns The core rule / core 规则
 */
const createFootnoteTail =
  (options: FootnoteOptions): CoreRule =>
  (state: FootNoteStateCore) => {
    const refTokens: Record<string, Token[]> = {};

    let current: Token[], currentLabel: string;
    let isInsideRef = false;

    if (!state.env.footnotes?.list) {
      // If no footnotes list, remove all footnote reference tokens
      state.tokens = state.tokens.filter((stateToken) => {
        if (stateToken.type === "footnote_reference_open") {
          isInsideRef = true;

          return false;
        }

        if (stateToken.type === "footnote_reference_close") {
          isInsideRef = false;

          return false;
        }

        return !isInsideRef;
      });

      return;
    }

    const { list } = state.env.footnotes;

    state.tokens = state.tokens.filter((stateToken) => {
      if (stateToken.type === "footnote_reference_open") {
        isInsideRef = true;
        current = [];
        currentLabel = (stateToken.meta as { label: string }).label;

        return false;
      }

      if (stateToken.type === "footnote_reference_close") {
        isInsideRef = false;
        // prepend ':' to avoid conflict with Object.prototype members
        refTokens[`:${currentLabel}`] = current;

        return false;
      }
      if (isInsideRef) current.push(stateToken);

      return !isInsideRef;
    });

    const { Token } = state;
    const blockStart = state.tokens.length;

    state.tokens.push(
      createBlockToken(Token, "hr", "hr", 0, [["class", "footnotes-sep"]]),
      createBlockToken(Token, "section_open", "section", 1, [["class", "footnotes"]]),
      createBlockToken(Token, "ordered_list_open", "ol", 1, [["class", "footnotes-list"]]),
    );

    applyAttrs(state.tokens[blockStart + 1], options.containerAttrs);

    const listLength = list.length;

    for (let index = 0; index < listLength; index++) {
      const name = getFootnoteAnchorName(state.env, index);
      // `block` stays false on purpose: the default renderer inserts a newline after a block
      // opening token unless the next token is hidden or inline, which would change the
      // historical `<li><p>` layout. The matching closing token stays a block token.
      const listItemOpenToken = createToken(Token, "list_item_open", "li", 1, [
        ["id", `footnote${name}`],
        ["class", "footnote-item"],
      ]);

      applyAttrs(listItemOpenToken, options.itemAttrs);
      state.tokens.push(listItemOpenToken);

      const inlineTokens = list[index].tokens;

      if (inlineTokens) {
        const inlineToken = createBlockToken(Token, "inline", "", 0);

        inlineToken.children = [...inlineTokens];

        // oxlint-disable-next-line typescript/no-non-null-assertion
        inlineToken.content = list[index].content!;

        state.tokens.push(
          createBlockToken(Token, "paragraph_open", "p", 1),
          inlineToken,
          createBlockToken(Token, "paragraph_close", "p", -1),
        );
      } else {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const tokens = refTokens[`:${list[index].label!}`];

        // oxlint-disable-next-line typescript/strict-boolean-expressions
        if (tokens) state.tokens.push(...tokens);
      }

      const backReferences: Token[] = [];

      // oxlint-disable-next-line typescript/no-non-null-assertion
      const referenceCount = Number(list[index].count) > 0 ? list[index].count! : 1;

      for (let subId = 0; subId < referenceCount; subId++) {
        backReferences.push(
          ...createBackReferenceTokens(Token, name, getFootnoteSuffix(subId), options),
        );
      }

      const lastToken = state.tokens[state.tokens.length - 1];
      let lastInlineToken: Token | undefined;

      if (lastToken?.type === "paragraph_close")
        lastInlineToken = state.tokens[state.tokens.length - 2];

      if (lastInlineToken?.type === "inline") {
        // Clone the inline token instead of mutating it: definition note tokens are stored in
        // `env.footnotes.list` and reused when the same environment is rendered again.
        state.tokens[state.tokens.length - 2] = cloneTokenWithChildren(Token, lastInlineToken, [
          // oxlint-disable-next-line typescript/no-non-null-assertion
          ...lastInlineToken.children!,
          ...backReferences,
        ]);
      } else {
        // Keep block-level back-references inside a standard inline token instead of emitting
        // bare inline-level tokens at the top level. The default renderer renders the children
        // in order, so the HTML stays the same.
        const backReferenceContainer = createBlockToken(Token, "inline", "", 0);

        backReferenceContainer.children = backReferences;
        state.tokens.push(backReferenceContainer);
      }

      state.tokens.push(createBlockToken(Token, "list_item_close", "li", -1));
    }

    state.tokens.push(
      createBlockToken(Token, "ordered_list_close", "ol", -1),
      createBlockToken(Token, "section_close", "section", -1),
    );

    replaceFootnoteRefs(Token, state.tokens, state.env, options);
    normalizeTokenLevels(state.tokens.slice(blockStart));
  };

export const footnote: PluginWithOptions<FootnoteOptions> = (md, options) => {
  // A second installation would append the footnote section twice.
  if (hasRule(md, "footnoteTail", "core")) return;

  md.block.ruler.before("reference", "footnoteDef", footnoteDef, {
    alt: ["paragraph", "reference"],
  });
  md.inline.ruler.after("image", "footnoteInline", footnoteInline);
  md.inline.ruler.after("footnoteInline", "footnote_ref", footnoteRef);
  md.core.ruler.after("inline", "footnoteTail", createFootnoteTail(options ?? {}));
};
