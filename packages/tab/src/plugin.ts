import { escapeHtml } from "@mdit/helper";
import type { Options, PluginWithOptions } from "markdown-it";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type {
  MarkdownItTabData,
  MarkdownItTabInfo,
  MarkdownItTabOptions,
} from "./options.js";

const MIN_MARKER_NUM = 3;
const TAB_MARKER = `@tab`;
const TAB_MARKER_LENGTH = TAB_MARKER.length;

const getTabRule =
  (name: string, store: { state: string | null }): RuleBlock =>
  (state, startLine, endLine, silent) => {
    if (store.state !== name) return false;

    const currentLineStart = state.bMarks[startLine] + state.tShift[startLine];
    const currentLineMax = state.eMarks[startLine];
    const currentLineIndent = state.sCount[startLine];

    /*
     * Check out the first character quickly,
     * this should filter out most of non-uml blocks
     */
    if (state.src.charCodeAt(currentLineStart) !== 64 /* @ */) return false;

    // Check out the rest of the marker string
    for (let index = 0; index < TAB_MARKER_LENGTH; index++)
      if (TAB_MARKER[index] !== state.src[currentLineStart + index])
        return false;

    const markup = state.src.substring(
      currentLineStart,
      currentLineStart + TAB_MARKER_LENGTH,
    );
    const info = state.src.substring(
      currentLineStart + TAB_MARKER_LENGTH,
      currentLineMax,
    );

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

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
        // closing fence should be indented same as opening one
        state.sCount[nextLine] === currentLineIndent &&
        // match start
        state.src[nextLineStart] === "@"
      ) {
        let openMakerMatched = true;

        for (let index = 0; index < TAB_MARKER.length; index++)
          if (TAB_MARKER[index] !== state.src[nextLineStart + index]) {
            openMakerMatched = false;
            break;
          }

        if (openMakerMatched) {
          // found!
          autoClosed = true;
          break;
        }
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
    state.blkIndent = currentLineIndent;

    const openToken = state.push(`${name}_tab_open`, "", 1);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [, title, id] = /^(.*?)(?:(?<!\\)#([^#]*))?$/.exec(
      info.replace(/^:active/, ""),
    )!;

    openToken.block = true;
    openToken.markup = markup;
    openToken.info = title.trim().replace(/\\#/g, "#");
    openToken.meta = {
      active: info.includes(":active"),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (id) openToken.meta.id = id.trim();
    openToken.map = [startLine, nextLine - (autoClosed ? 1 : 0)];

    state.md.block.tokenize(
      state,
      startLine + 1,
      nextLine + (autoClosed ? 0 : 1),
    );

    const closeToken = state.push(`${name}_tab_close`, "", -1);

    closeToken.block = true;
    closeToken.markup = "";

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;
    state.line = nextLine + (autoClosed ? 0 : 1);

    return true;
  };

const getTabsRule =
  (name: string, store: { state: string | null }): RuleBlock =>
  (state, startLine, endLine, silent) => {
    const currentLineStart = state.bMarks[startLine] + state.tShift[startLine];
    const currentLineMax = state.eMarks[startLine];
    const currentLineIndent = state.sCount[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    if (state.src[currentLineStart] !== ":") return false;

    let pos = currentLineStart + 1;

    // Check out the rest of the marker string
    while (pos <= currentLineMax) {
      if (state.src[pos] !== ":") break;
      pos++;
    }

    const markerCount = pos - currentLineStart;

    if (markerCount < MIN_MARKER_NUM) return false;

    const markup = ":".repeat(markerCount);
    const params = state.src.substring(pos, currentLineMax);

    const [containerName, id = ""] = params.split("#", 2);

    if (containerName.trim() !== name) return false;

    // Since start is found, we can report success here in validation mode
    if (silent) return true;

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

      if (
        nextLineStart < nextLineMax &&
        state.sCount[nextLine] < currentLineIndent
      )
        // non-empty line with negative indent should stop the list:
        // - :::
        //  test
        break;

      if (
        // closing fence should be indented same as opening one
        state.sCount[nextLine] === currentLineIndent &&
        // match start
        ":" === state.src[nextLineStart]
      ) {
        // check rest of marker
        for (pos = nextLineStart + 1; pos <= nextLineMax; pos++)
          if (state.src[pos] !== ":") break;

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
    const oldState = store.state;

    // @ts-expect-error: We are creating a new type called "${name}_tabs"
    state.parentType = `${name}_tabs`;

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine - (autoClosed ? 1 : 0);

    // this will update the block indent
    state.blkIndent = currentLineIndent;

    const openToken = state.push(`${name}_tabs_open`, "", 1);

    openToken.markup = markup;
    openToken.block = true;
    openToken.info = containerName;
    openToken.meta = { id: id.trim() };
    openToken.map = [startLine, nextLine - (autoClosed ? 1 : 0)];

    store.state = name;

    state.md.block.tokenize(
      state,
      startLine + 1,
      nextLine - (autoClosed ? 1 : 0),
    );

    store.state = oldState;

    const closeToken = state.push(`${name}_tabs_close`, "", -1);

    closeToken.markup = markup;
    closeToken.block = true;

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.blkIndent = oldBlkIndent;
    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  };

const getTabsDataGetter =
  (name: string): ((tokens: Token[], index: number) => MarkdownItTabInfo) =>
  (tokens, index) => {
    const tabData: MarkdownItTabData[] = [];
    let activeIndex = -1;
    let isTabStart = false;
    let nestingDepth = 0;

    for (
      // skip the current tabs_open token
      let i = index + 1;
      i < tokens.length;
      i++
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { block, meta, type, info } = tokens[i];

      if (block) {
        // record the nesting depth of tabs
        if (type === `${name}_tabs_open`) {
          nestingDepth++;
          continue;
        }

        if (type === `${name}_tabs_close`) {
          if (nestingDepth === 0) break;

          nestingDepth--;
          continue;
        }

        // if we are in a nesting tabs, skip processing
        if (nestingDepth > 0) continue;

        if (type === `${name}_tab_open`) {
          isTabStart = true;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          meta.index = tabData.length;

          // tab is active
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (meta.active)
            if (activeIndex === -1) activeIndex = tabData.length;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            else meta.active = false;

          tabData.push({
            title: info,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            index: meta.index as number,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            ...(meta.id ? { id: meta.id as string } : {}),
          });

          continue;
        }

        if (type === `${name}_tab_close`) continue;

        if (!isTabStart) {
          tokens[i].type = `${name}_tabs_empty`;
          tokens[i].hidden = true;
        }
      }
    }

    return {
      active: activeIndex,
      data: tabData.map((data, index) => ({
        ...data,
        active: index === activeIndex,
      })),
    };
  };

const tabDataGetter = (tokens: Token[], index: number): MarkdownItTabData => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { info, meta } = tokens[index];

  return {
    title: info,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    index: meta.index as number,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...(meta.id ? { id: meta.id as string } : {}),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    isActive: Boolean(meta.active),
  };
};

const store = { state: null };

export const tab: PluginWithOptions<MarkdownItTabOptions> = (md, options) => {
  const {
    name = "tabs",

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (token.meta.id) token.attrJoin("data-id", token.meta.id as string);

      const tabs = data.map(
        ({ title, id }, index) =>
          `<button type="button" class="${name}-tab-button${
            active === index ? " active" : ""
          }" data-tab="${index}"${id ? ` data-id="${escapeHtml(id)}"` : ""}${
            active === index ? " data-active" : ""
          }>${escapeHtml(title)}</button>`,
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

    tabOpenRender = (
      info: MarkdownItTabData,
      tokens: Token[],
      index: number,
      _options: Options,
      _env: unknown,
      self: Renderer,
    ): string => {
      const token = tokens[index];

      token.attrJoin(
        "class",
        `${name}-tab-content${info.isActive ? " active" : ""}`,
      );
      token.attrSet("data-index", info.index.toString());
      if (info.id) token.attrSet("data-id", info.id.toString());

      if (info.isActive) token.attrJoin("data-active", "");

      return `\
<div${self.renderAttrs(tokens[index])}>
`;
    },

    tabCloseRender = (): string => `\
</div>
`,
  } = options ?? {};

  const tabsDataGetter = getTabsDataGetter(name);

  md.block.ruler.before("fence", `${name}_tabs`, getTabsRule(name, store), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.block.ruler.before("paragraph", `${name}_tab`, getTabRule(name, store), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.renderer.rules[`${name}_tabs_open`] = (
    tokens,
    index,
    options,
    env,
    self,
  ): string => {
    const info = tabsDataGetter(tokens, index);

    return openRender(info, tokens, index, options, env, self);
  };

  md.renderer.rules[`${name}_tabs_close`] = closeRender;

  md.renderer.rules[`${name}_tab_open`] = (tokens, index, ...args): string => {
    const data = tabDataGetter(tokens, index);

    return tabOpenRender(data, tokens, index, ...args);
  };

  md.renderer.rules[`${name}_tab_close`] = tabCloseRender;
};
