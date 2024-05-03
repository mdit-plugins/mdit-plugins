/**
 * Forked from https://github.com/markdown-it/markdown-it-footnote/blob/master/index.mjs
 */

import type { PluginSimple } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";
import type { ParentType } from "markdown-it/lib/rules_block/state_block.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";
import type StateCore from "markdown-it/lib/rules_core/state_core.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { FootNoteEnv, FootNoteToken } from "./types.js";

interface FootNoteStateBlock extends StateBlock {
  tokens: FootNoteToken[];
  env: FootNoteEnv;
}

interface FootNoteStateInline extends StateInline {
  tokens: FootNoteToken[];
  env: FootNoteEnv;
}

interface FootNoteStateCore extends StateCore {
  tokens: FootNoteToken[];
  env: FootNoteEnv;
}

const getIDSuffix = (tokens: FootNoteToken[], index: number): string =>
  // add suffix when multiple id was found
  tokens[index].meta.subId > 0 ? `:${tokens[index].meta.subId}` : "";

const renderFootnoteAnchorName: RenderRule = (
  tokens: FootNoteToken[],
  index,
  _options,
  env: FootNoteEnv,
): string =>
  `${
    // prefix
    typeof env.docId === "string" ? `-${env.docId}-` : ""
  }${
    // increasing id
    (tokens[index].meta.id + 1).toString()
  }`;

const renderFootnoteCaption: RenderRule = (
  tokens: FootNoteToken[],
  index,
): string =>
  `[${
    // number
    (tokens[index].meta.id + 1).toString()
  }${getIDSuffix(tokens, index)}]`;

const renderFootnoteRef: RenderRule = (
  tokens: FootNoteToken[],
  index,
  options,
  env: FootNoteEnv,
  self,
): string => {
  const id = self.rules["footnote_anchorName"]!(
    tokens,
    index,
    options,
    env,
    self,
  );
  const caption = self.rules["footnote_caption"]!(
    tokens,
    index,
    options,
    env,
    self,
  );

  return `<sup class="footnote-ref"><a href="#footnote${id}">${caption}</a><a class="footnote-anchor" id="footnote-ref${id}${getIDSuffix(
    tokens,
    index,
  )}" /></sup>`;
};

const renderFootnoteBlockOpen: RenderRule = (
  _tokens: FootNoteToken[],
  _index,
  options,
): string =>
  `\
<hr class="footnotes-sep"${options.xhtmlOut ? " /" : ""}>
<section class="footnotes">
<ol class="footnotes-list">
`;

const renderFootnoteBlockClose = (): string => `\
</ol>
</section>
`;

const renderFootnoteOpen: RenderRule = (
  tokens: FootNoteToken[],
  index,
  options,
  env: FootNoteEnv,
  self,
): string =>
  `<li id="footnote${self.rules["footnote_anchorName"]!(
    tokens,
    index,
    options,
    env,
    self,
  )}${getIDSuffix(tokens, index)}" class="footnote-item">`;

const renderFootnoteClose = (): string => "</li>\n";

const renderFootnoteAnchor: RenderRule = (
  tokens: FootNoteToken[],
  index,
  options,
  env: FootNoteEnv,
  self,
): string =>
  ` <a href="#footnote-ref${self.rules["footnote_anchorName"]!(
    tokens,
    index,
    options,
    env,
    self,
  )}${
    getIDSuffix(tokens, index)
    /* ↩ with escape code to prevent display as Apple Emoji on iOS */
  }" class="footnote-backref">\u21a9\uFE0E</a>`;

// Process footnote block definition
const footnoteDef: RuleBlock = (
  state: FootNoteStateBlock,
  startLine,
  endLine,
  silent,
) => {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  if (
    // line should be at least 5 chars - "[^x]:"
    start + 4 > max ||
    state.src.charAt(start) !== "[" ||
    state.src.charAt(start + 1) !== "^"
  )
    return false;

  let pos = start + 2;

  while (pos < max) {
    if (state.src.charAt(pos) === " ") return false;
    if (state.src.charAt(pos) === "]") break;
    pos++;
  }

  if (
    // empty footnote label
    pos === start + 2 ||
    pos + 1 >= max ||
    state.src.charAt(++pos) !== ":"
  )
    return false;

  if (silent) return true;
  pos += 1;

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
    state.sCount[startLine] +
    pos -
    (state.bMarks[startLine] + state.tShift[startLine]);

  let offset =
    state.sCount[startLine] +
    pos -
    (state.bMarks[startLine] + state.tShift[startLine]);

  while (pos < max) {
    const char = state.src.charAt(pos);

    if (char === "\t") offset += 4 - (offset % 4);
    else if (char === " ") offset += 1;
    else break;

    pos += 1;
  }

  state.tShift[startLine] = pos - posAfterColon;
  state.sCount[startLine] = offset - initial;

  state.bMarks[startLine] = posAfterColon;
  state.blkIndent += 4;
  state.parentType = "footnote" as unknown as ParentType;

  if (state.sCount[startLine] < state.blkIndent)
    state.sCount[startLine] += state.blkIndent;

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
const footnoteInline: RuleInline = (state: FootNoteStateInline, silent) => {
  const max = state.posMax;
  const start = state.pos;

  if (
    start + 2 >= max ||
    state.src.charAt(start) !== "^" ||
    state.src.charAt(start + 1) !== "["
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
  if (!silent) {
    const list = ((state.env.footnotes ??= {}).list ??= []);
    const footnoteId = list.length;
    const tokens: Token[] = [];

    state.md.inline.parse(
      state.src.slice(labelStart, labelEnd),
      state.md,
      state.env,
      tokens,
    );

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
const footnoteRef: RuleInline = (state: FootNoteStateInline, silent) => {
  const start = state.pos;
  const max = state.posMax;

  if (
    // should be at least 4 chars - "[^x]"
    start + 3 > max ||
    !state.env.footnotes?.refs ||
    state.src.charAt(start) !== "[" ||
    state.src.charAt(start + 1) !== "^"
  )
    return false;

  let pos = start + 2;

  while (pos < max) {
    if (state.src.charAt(pos) === " ") return false;
    if (state.src.charAt(pos) === "\n") return false;
    if (state.src.charAt(pos) === "]") break;
    pos++;
  }

  if (
    //  empty footnote labels
    pos === start + 2 ||
    pos >= max
  )
    return false;

  pos += 1;

  const label = state.src.slice(start + 2, pos - 1);

  if (typeof state.env.footnotes.refs[`:${label}`] === "undefined")
    return false;

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

    const subId = list[footnoteId].count!;

    list[footnoteId].count = list[footnoteId].count! + 1;

    const refToken = state.push("footnote_ref", "", 0);

    refToken.meta = { id: footnoteId, subId, label };
  }

  state.pos = pos;
  state.posMax = max;

  return true;
};

// Glue footnote tokens to end of token stream
const footnoteTail: RuleCore = (state: FootNoteStateCore): boolean => {
  const refTokens: Record<string, Token[]> = {};

  let current: Token[];
  let currentLabel: string;
  let insideRef = false;

  if (!state.env.footnotes) return false;

  state.tokens = state.tokens.filter((stateToken) => {
    if (stateToken.type === "footnote_reference_open") {
      insideRef = true;
      current = [];
      currentLabel = stateToken.meta.label;

      return false;
    }
    if (stateToken.type === "footnote_reference_close") {
      insideRef = false;
      // prepend ':' to avoid conflict with Object.prototype members
      refTokens[`:${currentLabel}`] = current;

      return false;
    }
    if (insideRef) current.push(stateToken);

    return !insideRef;
  });

  const { list } = state.env.footnotes;

  if (!list) return false;

  const footnoteBlockOpenToken = new state.Token("footnote_block_open", "", 1);

  state.tokens.push(footnoteBlockOpenToken);

  for (let i = 0, { length } = list; i < length; i++) {
    const footnoteOpenToken = new state.Token("footnote_open", "", 1);

    footnoteOpenToken.meta = { id: i, label: list[i].label };
    state.tokens.push(footnoteOpenToken);

    let lastParagraph: FootNoteToken | null;

    if (list[i].tokens) {
      const paragraphOpenToken = new state.Token("paragraph_open", "p", 1);

      paragraphOpenToken.block = true;

      const inlineToken = new state.Token("inline", "", 0);

      inlineToken.children = list[i].tokens!;
      inlineToken.content = list[i].content!;

      const paragraphCloseToken = new state.Token("paragraph_close", "p", -1);

      paragraphCloseToken.block = true;

      state.tokens.push(paragraphOpenToken, inlineToken, paragraphCloseToken);
    } else if (list[i].label) {
      const tokens = refTokens[`:${list[i].label!}`];

      if (tokens) state.tokens.push(...tokens);
    }

    if (state.tokens[state.tokens.length - 1].type === "paragraph_close")
      lastParagraph = state.tokens.pop() ?? null;
    else lastParagraph = null;

    for (let j = 0; j < (Number(list[i].count) > 0 ? list[i].count! : 1); j++) {
      const footnoteAnchorToken = new state.Token("footnote_anchor", "", 0);

      footnoteAnchorToken.meta = { id: i, subId: j, label: list[i].label };
      state.tokens.push(footnoteAnchorToken);
    }

    if (lastParagraph) state.tokens.push(lastParagraph);

    state.tokens.push(new state.Token("footnote_close", "", -1));
  }

  state.tokens.push(new state.Token("footnote_block_close", "", -1));

  return true;
};

export const footnote: PluginSimple = (md) => {
  md.renderer.rules["footnote_ref"] = renderFootnoteRef;
  md.renderer.rules["footnote_block_open"] = renderFootnoteBlockOpen;
  md.renderer.rules["footnote_block_close"] = renderFootnoteBlockClose;
  md.renderer.rules["footnote_open"] = renderFootnoteOpen;
  md.renderer.rules["footnote_close"] = renderFootnoteClose;
  md.renderer.rules["footnote_anchor"] = renderFootnoteAnchor;

  // helpers (only used in other rules, no tokens are attached to those)
  // helpers (only used in other rules, no tokens are attached to those)
  md.renderer.rules["footnote_caption"] = renderFootnoteCaption;
  md.renderer.rules["footnote_anchorName"] = renderFootnoteAnchorName;

  md.block.ruler.before("reference", "footnoteDef", footnoteDef, {
    alt: ["paragraph", "reference"],
  });
  md.inline.ruler.after("image", "footnoteInline", footnoteInline);
  md.inline.ruler.after("footnoteInline", "footnote_ref", footnoteRef);
  md.core.ruler.after("inline", "footnoteTail", footnoteTail);
};
