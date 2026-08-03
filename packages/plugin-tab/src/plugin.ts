import { escapeHtml } from "@mdit/helper";
import type { Options, PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
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

interface TabContainerMeta {
  id?: string;
  tabsData?: MarkdownItTabInfo;
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
        autoClosed = true;
        break;
      }
    }

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;

    // @ts-expect-error: We are creating a new type called "tab"
    state.parentType = `tab`;

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine - (autoClosed ? 1 : 0);

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

    openToken.map = [startLine, nextLine - (autoClosed ? 1 : 0)];

    state.md.block.tokenize(state, startLine + 1, nextLine + (autoClosed ? 0 : 1));

    const closeToken = state.push(`${name}_tab_close`, "", -1);

    closeToken.block = true;
    closeToken.markup = "";

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;
    state.line = nextLine + (autoClosed ? 0 : 1);

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
    state.lineMax = nextLine - (autoClosed ? 1 : 0);

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
    openToken.map = [startLine, nextLine - (autoClosed ? 1 : 0)];

    state.env.tabName = name;
    state.env.tabLevel = state.level;

    state.md.block.tokenize(state, startLine + 1, nextLine - (autoClosed ? 1 : 0));

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

const createTabsCoreRule =
  (name: string): RuleCore =>
  (state) => {
    const tokens = state.tokens;

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];

      if (token.type !== `${name}_tabs_open`) continue;

      const data: MarkdownItTabData[] = [];
      let activeIndex = -1;
      let isTabStart = false;
      let nestingDepth = 0;
      const { level } = token;

      for (let i = index + 1; i < tokens.length; i++) {
        const child = tokens[i];
        const meta = child.meta as TabMeta;
        const type = child.type;

        // record the nesting depth of tabs
        if (type === `${name}_tabs_open`) {
          nestingDepth++;
          continue;
        }

        if (type === `${name}_tabs_close`) {
          if (child.level === level) break;

          nestingDepth--;
          continue;
        }

        // skip processing tokens deep inside other blocks
        if (child.level > level + 1 || nestingDepth > 0) {
          // hide contents before first tab
          if (!isTabStart) {
            child.type = `${name}_tabs_empty`;
            child.hidden = true;
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
            title: child.info,
            index: data.length,
            id: meta.id,
            isActive: meta.active,
          });

          continue;
        }

        if (type === `${name}_tab_close`) continue;

        // hide contents before first tab
        child.type = `${name}_tabs_empty`;
        child.hidden = true;
      }

      // store the computed tab data for the renderer (rendering stays read-only)
      (token.meta as TabContainerMeta).tabsData = { active: activeIndex, data };
    }
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
      _self: Renderer,
    ): string => {
      const { active, data } = info;
      const containerId = (tokens[index].meta as TabContainerMeta).id;

      const tabs = data.map(
        ({ title, id }, dataIndex) =>
          `<button type="button" class="${name}-tab-button${
            active === dataIndex ? " active" : ""
          }" data-tab="${dataIndex}"${id ? ` data-id="${escapeHtml(id)}"` : ""}${
            active === dataIndex ? " data-active" : ""
          }>${md.renderInline(title)}</button>`,
      );

      return `\
<div class="${name}-tabs-wrapper"${
        containerId ? ` data-id="${md.utils.escapeHtml(containerId)}"` : ""
      }>
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
      _tokens: Token[],
      _index: number,
      _options: Options,
      _env: unknown,
      _self: Renderer,
    ): string => {
      const { index, id, isActive } = info;

      return `\
<div class="${name}-tab-content${isActive ? " active" : ""}" data-index="${index}"${
        id ? ` data-id="${md.utils.escapeHtml(id)}"` : ""
      }${isActive ? ' data-active=""' : ""}>
`;
    },

    tabCloseRender = (): string => `\
</div>
`,
  } = options ?? {};

  const tabsCoreRule = createTabsCoreRule(name);

  md.block.ruler.before("fence", `${name}_tabs`, createTabContainerRule(name), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.block.ruler.before("paragraph", `${name}_tab`, createTabItemRule(name), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.core.ruler.push(`${name}_tabs_core`, tabsCoreRule);

  md.renderer.rules[`${name}_tabs_open`] = (tokens, index, mdItOptions, env, self): string => {
    // Fall back to an empty tab list if the tokens were not processed by the core rule
    const info = (tokens[index].meta as TabContainerMeta).tabsData ?? { active: -1, data: [] };

    return openRender(info, tokens, index, mdItOptions, env, self);
  };

  md.renderer.rules[`${name}_tabs_close`] = closeRender;

  md.renderer.rules[`${name}_tab_open`] = (tokens, index, mdItOptions, env, self): string => {
    const data = tabDataGetter(tokens, index);

    return tabOpenRender(data, tokens, index, mdItOptions, env, self);
  };

  md.renderer.rules[`${name}_tab_close`] = tabCloseRender;
};
