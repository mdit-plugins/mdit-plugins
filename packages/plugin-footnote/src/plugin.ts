/** Forked from https://github.com/markdown-it/markdown-it-footnote/blob/master/index.mjs */

import type { BlockRule, CoreRule, InlineRule, PluginSimple } from "@mdit/helper";
import type { RendererRule, StateBlock, StateCore, StateInline, Token } from "markdown-it";

import type { FootNoteEnv, FootNoteToken } from "./types.js";

interface FootNoteStateBlock extends StateBlock {
  env: FootNoteEnv;
}

interface FootNoteStateInline extends StateInline {
  env: FootNoteEnv;
}

interface FootNoteStateCore extends StateCore {
  env: FootNoteEnv;
}

type FootNoteMeta = FootNoteToken["meta"];

const getIDSuffix = (tokens: Token[], index: number): string => {
  // add suffix when multiple id was found
  const { subId } = tokens[index].meta as FootNoteMeta;

  return subId > 0 ? `:${subId}` : "";
};

const renderFootnoteAnchorName: RendererRule = (tokens, index, _options, env) => {
  // prefix
  const docId = env?.docId;
  // increasing id
  const id = (tokens[index].meta as FootNoteMeta).id;

  return `${typeof docId === "string" ? `-${docId}-` : ""}${(id + 1).toString()}`;
};

const renderFootnoteCaption: RendererRule = (tokens: Token[], index) =>
  `[${
    // number
    ((tokens[index].meta as FootNoteMeta).id + 1).toString()
  }${getIDSuffix(tokens, index)}]`;

const renderFootnoteRef: RendererRule = (tokens, index, options, env, self) => {
  const id = self.rules.footnote_anchor_name(tokens, index, options, env, self);
  const caption = self.rules.footnote_caption(tokens, index, options, env, self);

  // A separate anchor element allows scroll offset control via CSS
  // (e.g. `.footnote-anchor { scroll-margin-top: 80px; }` to leave
  // space for a fixed navbar), which isn't possible when id and href
  // share the same <a> element.
  return `<sup class="footnote-ref"><a href="#footnote${id}">${caption}</a><a class="footnote-anchor" id="footnote-ref${id}${getIDSuffix(
    tokens,
    index,
  )}"></a></sup>`;
};

const renderFootnoteBlockOpen: RendererRule = (_tokens, _index, options) =>
  `\
<hr class="footnotes-sep"${options.xhtmlOut ? " /" : ""}>
<section class="footnotes">
<ol class="footnotes-list">
`;

const renderFootnoteBlockClose = (): string => `\
</ol>
</section>
`;

const renderFootnoteOpen: RendererRule = (tokens, index, options, env, self) =>
  `<li id="footnote${self.rules.footnote_anchor_name(
    tokens,
    index,
    options,
    env,
    self,
  )}${getIDSuffix(tokens, index)}" class="footnote-item">`;

const renderFootnoteClose: RendererRule = () => "</li>\n";

const renderFootnoteAnchor: RendererRule = (tokens, index, options, env, self) =>
  ` <a href="#footnote-ref${self.rules.footnote_anchor_name(tokens, index, options, env, self)}${
    getIDSuffix(tokens, index)
    /* ↩ with escape code to prevent display as Apple Emoji on iOS */
  }" class="footnote-backref">\u21A9\uFE0E</a>`;

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

// Glue footnote tokens to end of token stream
const footnoteTail: CoreRule = (state: FootNoteStateCore) => {
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

  const footnoteBlockOpenToken = new state.Token("footnote_block_open", "", 1);

  state.tokens.push(footnoteBlockOpenToken);

  const listLength = list.length;

  for (let index = 0; index < listLength; index++) {
    const footnoteOpenToken = new state.Token("footnote_open", "", 1);

    footnoteOpenToken.meta = { id: index, label: list[index].label };
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

      // oxlint-disable-next-line typescript/strict-boolean-expressions
      if (tokens) state.tokens.push(...tokens);
    }

    const lastParagraph =
      // oxlint-disable-next-line typescript/no-non-null-assertion
      state.tokens[state.tokens.length - 1].type === "paragraph_close" ? state.tokens.pop()! : null;

    // oxlint-disable-next-line typescript/no-non-null-assertion
    for (let j = 0; j < (Number(list[index].count) > 0 ? list[index].count! : 1); j++) {
      const footnoteAnchorToken = new state.Token("footnote_anchor", "", 0);

      footnoteAnchorToken.meta = {
        id: index,
        subId: j,
        label: list[index].label,
      };
      state.tokens.push(footnoteAnchorToken);
    }

    if (lastParagraph) state.tokens.push(lastParagraph);

    state.tokens.push(new state.Token("footnote_close", "", -1));
  }

  state.tokens.push(new state.Token("footnote_block_close", "", -1));
};

export const footnote: PluginSimple = (md) => {
  md.renderer.rules.footnote_ref = renderFootnoteRef;
  md.renderer.rules.footnote_block_open = renderFootnoteBlockOpen;
  md.renderer.rules.footnote_block_close = renderFootnoteBlockClose;
  md.renderer.rules.footnote_open = renderFootnoteOpen;
  md.renderer.rules.footnote_close = renderFootnoteClose;
  md.renderer.rules.footnote_anchor = renderFootnoteAnchor;

  // helpers (only used in other rules, no tokens are attached to those)
  // helpers (only used in other rules, no tokens are attached to those)
  md.renderer.rules.footnote_caption = renderFootnoteCaption;
  md.renderer.rules.footnote_anchor_name = renderFootnoteAnchorName;

  md.block.ruler.before("reference", "footnoteDef", footnoteDef, {
    alt: ["paragraph", "reference"],
  });
  md.inline.ruler.after("image", "footnoteInline", footnoteInline);
  md.inline.ruler.after("footnoteInline", "footnote_ref", footnoteRef);
  md.core.ruler.after("inline", "footnoteTail", footnoteTail);
};
