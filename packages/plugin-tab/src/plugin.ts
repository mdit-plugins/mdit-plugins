import { escapeHtml, hasRule } from "@mdit/helper";
import type { BlockRule, CoreRule, PluginWithOptions, TokenMeta } from "@mdit/helper";
import type { Env, MarkdownItOptions, StateBlock, Token } from "markdown-it";

import type { MarkdownItTabData, MarkdownItTabInfo, MarkdownItTabOptions } from "./options.js";
import {
  checkTabMarker,
  findContainerEnd,
  findItemEnd,
  MIN_MARKER_NUM,
  TAB_MARKER,
} from "./scan.js";

// Characters that built-in inline syntax, linkify or typographer rules may transform. A title
// without any of them renders as a single escaped text token, so the inline parser can be skipped.
const INLINE_MARKUP = new Uint8Array(128);

for (const code of [
  33 /* ! */, 34 /* " */, 35 /* # */, 36 /* $ */, 38 /* & */, 39 /* ' */, 40 /* ( */, 41 /* ) */,
  42 /* * */, 43 /* + */, 45 /* - */, 46 /* . */, 58 /* : */, 60 /* < */, 61 /* = */, 62 /* > */,
  64 /* @ */, 91 /* [ */, 92 /* \ */, 93 /* ] */, 94 /* ^ */, 95 /* _ */, 96 /* ` */, 123 /* { */,
  124 /* | */, 125 /* } */, 126 /* ~ */,
])
  INLINE_MARKUP[code] = 1;

interface TabMeta extends TokenMeta {
  index: number;
  active: boolean;
  id?: string;
}

interface TabContainerMeta extends TokenMeta {
  id?: string;
  tabsData?: MarkdownItTabInfo;
}

const tabNameKey = Symbol("tab:name");
const tabLevelKey = Symbol("tab:level");

interface TabEnv extends Env {
  [tabNameKey]?: string;
  [tabLevelKey]?: number;
}

interface TabStateBlock extends StateBlock {
  env: TabEnv;
}

const createTabItemRule =
  (name: string): BlockRule =>
  (state: TabStateBlock, startLine, endLine, silent) => {
    if (state.env[tabNameKey] !== name || state.level !== state.env[tabLevelKey]) return false;

    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    const tabMatch = checkTabMarker(state, start, max);

    if (tabMatch === false) return false;

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

    const indent = state.sCount[startLine];
    // The item body ends at the next sibling marker or at the first shallower non-blank line
    const nextLine = findItemEnd(state, startLine, endLine, indent);

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;

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
  (name: string): BlockRule =>
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
    // The body ends at the first shallower non-blank line or at a long enough closing fence
    const { line: nextLine, hasEnd: autoClosed } = findContainerEnd(
      state,
      startLine,
      endLine,
      indent,
      markerCount,
    );

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    const oldBlkIndent = state.blkIndent;
    const oldName = state.env[tabNameKey];
    const oldLevel = state.env[tabLevelKey];

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
    openToken.meta = id ? { id } : {};
    openToken.map = [startLine, nextLine];

    state.env[tabNameKey] = name;
    state.env[tabLevelKey] = state.level;

    state.md.block.tokenize(state, startLine + 1, nextLine);

    state.env[tabNameKey] = oldName;
    state.env[tabLevelKey] = oldLevel;

    const closeToken = state.push(`${name}_tabs_close`, "", -1);

    closeToken.markup = markup;
    closeToken.block = true;

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;
    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

interface TabFrame {
  level: number;
  meta: TabContainerMeta;
  data: MarkdownItTabData[];
  activeIndex: number;
  inTabItem: boolean;
}

const createTabsCoreRule =
  (name: string): CoreRule =>
  (state) => {
    const tokens = state.tokens;
    const tabsOpenType = `${name}_tabs_open`;
    const tabsCloseType = `${name}_tabs_close`;
    const tabOpenType = `${name}_tab_open`;
    const tabCloseType = `${name}_tab_close`;
    const emptyType = `${name}_tabs_empty`;
    const frames: TabFrame[] = [];

    // Number of open containers that are currently outside any tab item. They hide every token
    // that belongs to a deeper block, which is what the previous per-container forward scans did
    // for each level one by one.
    let outerFrames = 0;

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      const type = token.type;

      if (type === tabsOpenType) {
        frames.push({
          level: token.level,
          meta: token.meta as TabContainerMeta,
          data: [],
          activeIndex: -1,
          inTabItem: false,
        });
        outerFrames++;
        continue;
      }

      if (type === tabsCloseType) {
        const frame = frames[frames.length - 1];

        frames.length--;

        frame.meta.tabsData = {
          active: frame.activeIndex,
          data: frame.data,
          id: frame.meta.id,
        };

        // All tab items of a container are closed before the container itself
        outerFrames--;
        continue;
      }

      const frame: TabFrame | undefined = frames[frames.length - 1];

      // Tokens outside every tabs container are left untouched
      if (frame == null) continue;

      const isDirectChild = frame.level === token.level - 1;

      // A container outside a tab item hides the token before a nested container gets to see it,
      // so the nested container does not treat a hidden marker as one of its own.
      if (outerFrames - (frame.inTabItem ? 0 : 1) > 0) {
        token.type = emptyType;
        token.hidden = true;
        continue;
      }

      if (isDirectChild) {
        if (type === tabOpenType) {
          const meta = token.meta as TabMeta;

          frame.inTabItem = true;
          outerFrames--;
          meta.index = frame.data.length;

          // only the first active tab of a container stays active
          if (meta.active) {
            if (frame.activeIndex === -1) frame.activeIndex = frame.data.length;
            else meta.active = false;
          }

          frame.data.push({
            title: token.info,
            index: frame.data.length,
            id: meta.id,
            isActive: meta.active,
          });
          continue;
        }

        if (type === tabCloseType) {
          frame.inTabItem = false;
          outerFrames++;
          continue;
        }

        // hide contents outside any tab item
        token.type = emptyType;
        token.hidden = true;
        continue;
      }

      if (outerFrames > 0) {
        token.type = emptyType;
        token.hidden = true;
      }
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
  const renderTabTitle = (title: string, env: Env | undefined): string => {
    for (let i = 0; i < title.length; i++) {
      const code = title.charCodeAt(i);

      // Non-ASCII text never matches a built-in inline rule
      if (code < 128 && INLINE_MARKUP[code] === 1) return md.renderInline(title, env);
    }

    // Plain text is escaped as a whole by the inline parser, and no escaped character is left
    return title;
  };

  const {
    name = "tabs",

    openRenderer = (
      info: MarkdownItTabInfo,
      _tokens: Token[],
      _index: number,
      _options: Required<MarkdownItOptions>,
      env: Env | undefined,
    ): string => {
      const { active, data, id: containerId } = info;

      const tabs = data.map(
        ({ title, id }, dataIndex) =>
          `<button type="button" class="${name}-tab-button${
            active === dataIndex ? " active" : ""
          }" data-tab="${dataIndex}"${id ? ` data-id="${escapeHtml(id)}"` : ""}${
            active === dataIndex ? " data-active" : ""
          }>${renderTabTitle(title, env)}</button>`,
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

    closeRenderer = (): string => `\
  </div>
</div>
`,

    tabOpenRenderer = (info: MarkdownItTabData): string => {
      const { index, id, isActive } = info;

      return `\
<div class="${name}-tab-content${isActive ? " active" : ""}" data-index="${index}"${
        id ? ` data-id="${md.utils.escapeHtml(id)}"` : ""
      }${isActive ? ' data-active=""' : ""}>
`;
    },

    tabCloseRenderer = (): string => `\
</div>
`,
  } = options ?? {};

  // Repeated installation of the same configuration must not register the rules twice.
  if (hasRule(md, `${name}_tabs`, "block")) return;

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
    const meta = tokens[index].meta as TabContainerMeta;
    const info: MarkdownItTabInfo = meta.tabsData ?? { active: -1, data: [], id: meta.id };

    return openRenderer(info, tokens, index, mdItOptions, env, self);
  };

  md.renderer.rules[`${name}_tabs_close`] = closeRenderer;

  md.renderer.rules[`${name}_tab_open`] = (tokens, index, mdItOptions, env, self): string => {
    const data = tabDataGetter(tokens, index);

    return tabOpenRenderer(data, tokens, index, mdItOptions, env, self);
  };

  md.renderer.rules[`${name}_tab_close`] = tabCloseRenderer;
};
