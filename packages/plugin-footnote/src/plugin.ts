/**
 * Forked and modified from
 * https://github.com/markdown-it/markdown-it-footnote/blob/master/index.mjs
 */

import { escapeHtml, hasRule } from "@mdit/helper";
import type { BlockRule, CoreRule, InlineRule, PluginWithOptions } from "@mdit/helper";
import type { RendererRule, StateBlock, StateCore, StateInline, Token } from "markdown-it";

import type { FootnoteOptions } from "./options.js";
import type {
  FootnoteAnchorMeta,
  FootnoteBlockOpenMeta,
  FootnoteRefMeta,
  FootNoteEnv,
  FootNoteMeta,
} from "./types.js";
import {
  applyAttrs,
  escapeAttribute,
  getFootnoteAnchorName,
  getFootnoteCaption,
  getFootnoteSuffix,
} from "./utils.js";

interface FootNoteStateBlock extends StateBlock {
  env: FootNoteEnv;
}

interface FootNoteStateInline extends StateInline {
  env: FootNoteEnv;
}

interface FootNoteStateCore extends StateCore {
  env: FootNoteEnv;
}

const REF_CLASS = "footnote-ref";
const ANCHOR_CLASS = "footnote-anchor";
const ITEM_CLASS = "footnote-item";
const BACK_REFERENCE_CLASS = "footnote-backref";
const SEPARATOR_CLASS = "footnotes-sep";
const CONTAINER_CLASS = "footnotes";
const LIST_CLASS = "footnotes-list";

// `↩` with escape code to prevent display as Apple Emoji on iOS
const BACK_REFERENCE_TEXT = "\u21A9\uFE0E";

const renderFootnoteCaption: RendererRule = (tokens, index) => {
  const { id, subId } = tokens[index].meta as unknown as FootNoteMeta;

  return getFootnoteCaption(id, subId);
};

const renderFootnoteRef: RendererRule = (tokens, index, options, env, self) => {
  const { href, anchorId, anchorClass } = tokens[index].meta as unknown as FootnoteRefMeta;
  // The caption goes through the `footnote_caption` rule so overriding it keeps working like in
  // previous versions. Renderer rules return HTML, so the caption is embedded as-is.
  const caption = self.rules.footnote_caption(tokens, index, options, env, self);

  // A separate anchor element allows scroll offset control via CSS
  // (e.g. `.footnote-anchor { scroll-margin-top: 80px; }` to leave
  // space for a fixed navbar), which isn't possible when id and href
  // share the same <a> element.
  return `<sup${self.renderAttrs(tokens[index])}><a href="${escapeAttribute(href)}">${caption}</a><a class="${escapeAttribute(anchorClass)}" id="${escapeAttribute(anchorId)}"></a></sup>`;
};

const renderFootnoteBlockOpen: RendererRule = (tokens, index, options, _env, self) => {
  const { separatorClass, listClass } = tokens[index].meta as unknown as FootnoteBlockOpenMeta;

  return `<hr class="${escapeAttribute(separatorClass)}"${options.xhtmlOut ? " /" : ""}>
<section${self.renderAttrs(tokens[index])}>
<ol class="${escapeAttribute(listClass)}">
`;
};

const renderFootnoteBlockClose = (): string => `\
</ol>
</section>
`;

const renderFootnoteOpen: RendererRule = (tokens, index, _options, _env, self) =>
  `<li${self.renderAttrs(tokens[index])}>`;

const renderFootnoteClose = (): string => "</li>\n";

const renderFootnoteAnchor: RendererRule = (tokens, index, _options, _env, self) => {
  const { text } = tokens[index].meta as unknown as FootnoteAnchorMeta;

  return ` <a${self.renderAttrs(tokens[index])}>${escapeHtml(text)}</a>`;
};

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

// Create the footnote reference token from parsed data, resolved at parse time so renderers are
// pure serializers.
const createFootnoteRefToken = (
  state: FootNoteStateInline,
  options: FootnoteOptions,
  id: number,
  subId?: number,
  label?: string,
): void => {
  const refToken = state.push("footnote_ref", "", 0);
  const anchorName = getFootnoteAnchorName(state.env.docId, id);
  const suffix = getFootnoteSuffix(subId);

  refToken.meta = {
    id,
    subId,
    label,
    href: `#footnote${anchorName}`,
    anchorId: `footnote-ref${anchorName}${suffix}`,
    anchorClass: ANCHOR_CLASS,
  } satisfies FootNoteMeta;

  refToken.attrJoin("class", REF_CLASS);
  applyAttrs(refToken, options.refAttrs);
};

// Process inline footnotes (^[...])
const createFootnoteInline =
  (options: FootnoteOptions): InlineRule =>
  (state: FootNoteStateInline, silent) => {
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

      state.env.footnotes.list[footnoteId] = {
        content: state.src.slice(labelStart, labelEnd),
        tokens,
      };

      createFootnoteRefToken(state, options, footnoteId);
    }

    state.pos = labelEnd + 1;
    state.posMax = max;

    return true;
  };

// Process footnote references ([^...])
const createFootnoteRef =
  (options: FootnoteOptions): InlineRule =>
  (state: FootNoteStateInline, silent) => {
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

      createFootnoteRefToken(state, options, footnoteId, subId, label);
    }

    state.pos = pos;
    state.posMax = max;

    return true;
  };

// Glue footnote tokens to end of token stream
const createFootnoteTail =
  (options: FootnoteOptions): CoreRule =>
  (state: FootNoteStateCore) => {
    const refTokens: Record<string, Token[]> = {};
    const refStack: { label: string; tokens: Token[] }[] = [];

    if (!state.env.footnotes?.list) {
      let refDepth = 0;

      // If no footnotes list, remove all footnote reference tokens
      state.tokens = state.tokens.filter((stateToken) => {
        if (stateToken.type === "footnote_reference_open") {
          refDepth++;

          return false;
        }

        if (stateToken.type === "footnote_reference_close") {
          refDepth--;

          return false;
        }

        return refDepth === 0;
      });

      return;
    }

    const { list } = state.env.footnotes;

    state.tokens = state.tokens.filter((stateToken) => {
      if (stateToken.type === "footnote_reference_open") {
        refStack.push({
          label: (stateToken.meta as { label: string }).label,
          tokens: [],
        });

        return false;
      }

      if (stateToken.type === "footnote_reference_close") {
        // `footnoteDef` always pushes a balanced pair, so the stack has a matching entry here.
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const { label, tokens } = refStack.pop()!;

        // prepend ':' to avoid conflict with Object.prototype members
        refTokens[`:${label}`] = tokens;

        return false;
      }

      // Tokens outside any definition stay in the document.
      if (refStack.length === 0) return true;

      // Only the innermost definition collects the token, so a nested definition keeps its
      // content out of the outer note.
      refStack[refStack.length - 1].tokens.push(stateToken);

      return false;
    });

    const footnoteBlockOpenToken = new state.Token("footnote_block_open", "", 1);

    footnoteBlockOpenToken.meta = {
      separatorClass: SEPARATOR_CLASS,
      listClass: LIST_CLASS,
    } satisfies FootnoteBlockOpenMeta;
    footnoteBlockOpenToken.attrJoin("class", CONTAINER_CLASS);
    applyAttrs(footnoteBlockOpenToken, options.containerAttrs);

    state.tokens.push(footnoteBlockOpenToken);

    const listLength = list.length;

    for (let index = 0; index < listLength; index++) {
      const footnoteOpenToken = new state.Token("footnote_open", "", 1);
      const anchorName = getFootnoteAnchorName(state.env.docId, index);

      footnoteOpenToken.meta = { id: index, label: list[index].label };
      footnoteOpenToken.attrSet("id", `footnote${anchorName}`);
      footnoteOpenToken.attrJoin("class", ITEM_CLASS);
      applyAttrs(footnoteOpenToken, options.itemAttrs);

      state.tokens.push(footnoteOpenToken);

      if (list[index].tokens) {
        const paragraphOpenToken = new state.Token("paragraph_open", "p", 1);

        paragraphOpenToken.block = true;

        const inlineToken = new state.Token("inline", "", 0);

        // oxlint-disable-next-line typescript/no-non-null-assertion
        inlineToken.children = list[index].tokens!;
        // oxlint-disable-next-line typescript/no-non-null-assertion
        inlineToken.content = list[index].content!;

        const paragraphCloseToken = new state.Token("paragraph_close", "p", -1);

        paragraphCloseToken.block = true;

        state.tokens.push(paragraphOpenToken, inlineToken, paragraphCloseToken);
      } else {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const tokens = refTokens[`:${list[index].label!}`];

        // A list entry may exist when the definition is not in this token stream, e.g. the
        // footnote reference sits in content rendered separately via `renderInline` (tab title).
        // oxlint-disable-next-line typescript/strict-boolean-expressions
        if (tokens) state.tokens.push(...tokens);
      }

      const lastParagraph =
        state.tokens[state.tokens.length - 1].type === "paragraph_close"
          ? // oxlint-disable-next-line typescript/no-non-null-assertion
            state.tokens.pop()!
          : null;

      // oxlint-disable-next-line typescript/no-non-null-assertion
      for (let j = 0; j < (Number(list[index].count) > 0 ? list[index].count! : 1); j++) {
        const footnoteAnchorToken = new state.Token("footnote_anchor", "", 0);

        footnoteAnchorToken.meta = {
          id: index,
          subId: j,
          label: list[index].label,
          text: BACK_REFERENCE_TEXT,
        } satisfies FootNoteMeta;

        footnoteAnchorToken.attrSet("href", `#footnote-ref${anchorName}${getFootnoteSuffix(j)}`);
        footnoteAnchorToken.attrJoin("class", BACK_REFERENCE_CLASS);
        applyAttrs(footnoteAnchorToken, options.backrefAttrs);

        state.tokens.push(footnoteAnchorToken);
      }

      if (lastParagraph) state.tokens.push(lastParagraph);

      state.tokens.push(new state.Token("footnote_close", "", -1));
    }

    state.tokens.push(new state.Token("footnote_block_close", "", -1));
  };

export const footnote: PluginWithOptions<FootnoteOptions> = (md, options) => {
  // A second installation would append the footnote section twice.
  if (hasRule(md, "footnoteTail", "core")) return;

  md.renderer.rules.footnote_ref = renderFootnoteRef;
  md.renderer.rules.footnote_block_open = renderFootnoteBlockOpen;
  md.renderer.rules.footnote_block_close = renderFootnoteBlockClose;
  md.renderer.rules.footnote_open = renderFootnoteOpen;
  md.renderer.rules.footnote_close = renderFootnoteClose;
  md.renderer.rules.footnote_anchor = renderFootnoteAnchor;

  // The caption helper is still routed through `renderFootnoteRef`, so overriding it works.
  // `footnote_anchor_name` was an internal helper and is gone: anchor names are resolved while
  // parsing, so update the generated ids / hrefs on the tokens instead.
  md.renderer.rules.footnote_caption = renderFootnoteCaption;

  md.block.ruler.before("reference", "footnoteDef", footnoteDef, {
    alt: ["paragraph", "reference"],
  });
  md.inline.ruler.after("image", "footnoteInline", createFootnoteInline(options ?? {}));
  md.inline.ruler.after("footnoteInline", "footnote_ref", createFootnoteRef(options ?? {}));
  md.core.ruler.after("inline", "footnoteTail", createFootnoteTail(options ?? {}));
};
