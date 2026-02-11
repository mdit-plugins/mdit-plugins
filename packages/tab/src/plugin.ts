import { escapeHtml } from "@mdit/helper";
import type { Options, PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type StateBlock from "markdown-it/lib/rules_block/state_block.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { MarkdownItTabData, MarkdownItTabInfo, MarkdownItTabOptions } from "./options.js";

const MIN_MARKER_NUM = 3;
const TAB_MARKER = "@tab";
const ACTIVE_TAB_MARKER = `${TAB_MARKER}:active`;
const TAB_MARKER_LENGTH = TAB_MARKER.length;
const ACTIVE_TAB_MARKER_LENGTH = ACTIVE_TAB_MARKER.length;

interface TabMeta {
  index: number;
  active: boolean;
  id?: string;
}

interface TabEnv extends Record<string, unknown> {
  tabName: string;
  tabLevel: number;
}

interface TabStateBlock extends StateBlock {
  env: TabEnv;
}

const checkTabMarker = (
  state: StateBlock,
  start: number,
  max: number,
): false | { isActive: boolean; pos: number } => {
  /*
   * Check out the first character quickly,
   * this should filter out most of non-uml blocks
   */
  if (state.src.charCodeAt(start) !== 64 /* @ */) return false;

  let pos = 1;

  // Check out the rest of the marker string
  for (; pos < ACTIVE_TAB_MARKER_LENGTH; pos++)
    if (ACTIVE_TAB_MARKER.charCodeAt(pos) !== state.src.charCodeAt(start + pos)) break;

  const isActive = pos === ACTIVE_TAB_MARKER_LENGTH;

  if (!isActive && pos !== TAB_MARKER_LENGTH) return false;

  const markerEnd = start + pos;
  const infoStart = state.skipSpaces(markerEnd);

  if (infoStart > markerEnd && infoStart < max) return { isActive, pos: infoStart };

  return false;
};

const createTabItemRule =
  (name: string): RuleBlock =>
  (state: TabStateBlock, startLine, endLine, silent) => {
    if (state.env.tabName !== name || state.level !== state.env.tabLevel) return false;

    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    const tabMatch = checkTabMarker(state, start, max);

    if (tabMatch === false) return false;

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

    const indent = state.sCount[startLine];
    let nextLine = startLine + 1;

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

      if (
        // marker should be indented same as opening one
        state.sCount[nextLine] === indent &&
        // match start
        state.src[nextLineStart] === "@" &&
        // check rest of marker
        // oxlint-disable-next-line typescript/strict-boolean-expressions
        checkTabMarker(state, nextLineStart, state.eMarks[nextLine])
      ) {
        // found!
        break;
      }
    }

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;

    // @ts-expect-error: We are creating a new type called "tab"
    state.parentType = `tab`;

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    // this will update the block indent
    state.blkIndent = indent;

    const openToken = state.push(`${name}_tab_open`, "", 1);

    const infoStart = tabMatch.pos;
    const infoEnd = state.skipSpacesBack(max, infoStart);

    let pos = infoEnd;
    let escapePos: number;

    while (pos > infoStart) {
      /*
       * Found potential #, look for escapes, pos will point to
       * first non escape when complete
       */
      if (state.src.charCodeAt(pos) === 35 /* # */) {
        escapePos = pos - 1;

        while (state.src.charCodeAt(escapePos) === 92 /* \ */) escapePos--;

        // Even number of escapes, potential closing delimiter found
        if ((pos - escapePos) % 2 === 1) break;
      }

      pos--;
    }

    let title;
    let id = "";

    // no id
    if (pos === infoStart) {
      title = state.src.slice(infoStart, infoEnd);
    }
    // id found
    else {
      id = state.src.slice(state.skipSpaces(pos + 1), infoEnd);
      title = state.src.slice(infoStart, state.skipSpacesBack(pos, infoStart));
    }

    openToken.block = true;
    openToken.markup = TAB_MARKER;
    openToken.info = title;
    openToken.meta = {
      active: tabMatch.isActive,
    };
    // oxlint-disable-next-line typescript/no-unsafe-member-access
    if (id) openToken.meta.id = id;

    openToken.map = [startLine, nextLine];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    const closeToken = state.push(`${name}_tab_close`, "", -1);

    closeToken.block = true;
    closeToken.markup = "";

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;
    state.line = nextLine;

    return true;
  };

const createTabContainerRule =
  (name: string): RuleBlock =>
  (state: TabStateBlock, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    if (state.src.charCodeAt(start) !== 58 /* : */) return false;

    const max = state.eMarks[startLine];
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

    let idStart = 0;
    let charCode: number;

    while (pos !== max) {
      charCode = state.src.charCodeAt(pos++);
      if (charCode === 35 /* # */) {
        idStart = pos;
        break;
      }
      if (!state.md.utils.isSpace(charCode)) return false;
    }

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

    const indent = state.sCount[startLine];
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

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;
    const oldName = state.env.tabName;
    const oldLevel = state.env.tabLevel;

    // @ts-expect-error: We are creating a new type called "${name}_tabs"
    state.parentType = `${name}_tabs`;

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    // this will update the block indent
    state.blkIndent = indent;

    const markup = ":".repeat(markerCount);
    let id = "";

    if (idStart) {
      idStart = state.skipSpaces(idStart);
      const idEnd = state.skipSpacesBack(max, idStart);

      if (idStart < idEnd) id = state.src.slice(idStart, idEnd);
    }

    const openToken = state.push(`${name}_tabs_open`, "", 1);

    openToken.markup = markup;
    openToken.block = true;
    openToken.info = name;
    openToken.meta = { id };
    openToken.map = [startLine, nextLine + (autoClosed ? 1 : 0)];

    state.env.tabName = name;
    state.env.tabLevel = state.level;

    state.md.block.tokenize(state, startLine + 1, nextLine);

    state.env.tabName = oldName;
    state.env.tabLevel = oldLevel;

    const closeToken = state.push(`${name}_tabs_close`, "", -1);

    closeToken.markup = markup;
    closeToken.block = true;

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;
    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

const createTabsDataGetter =
  (name: string): ((tokens: Token[], index: number) => MarkdownItTabInfo) =>
  (tokens: Token[], index: number) => {
    const data: MarkdownItTabData[] = [];
    let activeIndex = -1;
    let isTabStart = false;
    let nestingDepth = 0;
    const { level } = tokens[index];

    for (
      // skip the current tabs_open token
      let i = index + 1;
      i < tokens.length;
      i++
    ) {
      const token = tokens[i];
      const meta = token.meta as TabMeta;
      const type = token.type;

      // record the nesting depth of tabs
      if (type === `${name}_tabs_open`) {
        nestingDepth++;
        continue;
      }

      if (type === `${name}_tabs_close`) {
        if (token.level === level) break;

        nestingDepth--;
        continue;
      }

      // skip processing tokens deep inside other blocks
      if (token.level > level + 1 || nestingDepth > 0) {
        // hide contents before first tab
        if (!isTabStart) {
          token.type = `${name}_tabs_empty`;
          token.hidden = true;
        }

        continue;
      }

      if (type === `${name}_tab_open`) {
        isTabStart = true;

        meta.index = data.length;
        // tab is active
        if (meta.active) {
          if (activeIndex === -1) activeIndex = data.length;
          else meta.active = false;
        }

        data.push({
          title: token.info,
          index: data.length,
          id: meta.id,
          isActive: meta.active,
        });

        continue;
      }

      if (type === `${name}_tab_close`) continue;

      // hide contents before first tab
      token.type = `${name}_tabs_empty`;
      token.hidden = true;
    }

    return {
      active: activeIndex,
      data: data,
    };
  };

const tabDataGetter = (tokens: Token[], index: number): MarkdownItTabData => {
  const token = tokens[index];
  const meta = token.meta as TabMeta;

  return {
    title: token.info,
    index: meta.index,
    id: meta.id,
    isActive: meta.active,
  };
};

export const tab: PluginWithOptions<MarkdownItTabOptions> = (md, options) => {
  const {
    name = "tabs",

    // oxlint-disable-next-line max-params
    openRender = (
      info: MarkdownItTabInfo,
      tokens: Token[],
      index: number,
      _options: Options,
      _env: unknown,
      self: Renderer,
    ): string => {
      const { active, data } = info;
      const token = tokens[index];

      token.attrJoin("class", `${name}-tabs-wrapper`);
      // oxlint-disable-next-line typescript/no-unsafe-member-access, typescript/strict-boolean-expressions
      if (token.meta.id) token.attrJoin("data-id", token.meta.id as string);

      const tabs = data.map(
        ({ title, id }, index) =>
          `<button type="button" class="${name}-tab-button${
            active === index ? " active" : ""
          }" data-tab="${index}"${id ? ` data-id="${escapeHtml(id)}"` : ""}${
            active === index ? " data-active" : ""
          }>${escapeHtml(md.renderInline(title))}</button>`,
      );

      return `\
<div${self.renderAttrs(token)}>
  <div class="${name}-tabs-header">
    ${tabs.join("\n    ")}
  </div>
  <div class="${name}-tabs-container">
`;
    },

    closeRender = (): string => `\
  </div>
</div>
`,

    // oxlint-disable-next-line max-params
    tabOpenRender = (
      info: MarkdownItTabData,
      tokens: Token[],
      index: number,
      _options: Options,
      _env: unknown,
      self: Renderer,
    ): string => {
      const token = tokens[index];

      token.attrJoin("class", `${name}-tab-content${info.isActive ? " active" : ""}`);
      token.attrSet("data-index", info.index.toString());
      if (info.id) token.attrSet("data-id", info.id);

      if (info.isActive) token.attrJoin("data-active", "");

      return `\
<div${self.renderAttrs(tokens[index])}>
`;
    },

    tabCloseRender = (): string => `\
</div>
`,
  } = options ?? {};

  const tabsDataGetter = createTabsDataGetter(name);

  md.block.ruler.before("fence", `${name}_tabs`, createTabContainerRule(name), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.block.ruler.before("paragraph", `${name}_tab`, createTabItemRule(name), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.renderer.rules[`${name}_tabs_open`] = (tokens, index, options, env, self): string => {
    const info = tabsDataGetter(tokens, index);

    return openRender(info, tokens, index, options, env, self);
  };

  md.renderer.rules[`${name}_tabs_close`] = closeRender;

  md.renderer.rules[`${name}_tab_open`] = (tokens, index, options, env, self): string => {
    const data = tabDataGetter(tokens, index);

    return tabOpenRender(data, tokens, index, options, env, self);
  };

  md.renderer.rules[`${name}_tab_close`] = tabCloseRender;
};
