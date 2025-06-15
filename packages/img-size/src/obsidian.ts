import type { PluginSimple } from "markdown-it";
import { isSpace } from "markdown-it/lib/common/utils.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { ImgSizeEnv } from "./types.js";

const OBSIDIAN_IMAGE_SIZE_REGEXP = /^(.*?)\s*\|\s*(\d+)\s*x\s*(\d+)\s*$/;

export const obsidianImgSizeRule: RuleInline = (state, silent) => {
  const env = state.env as ImgSizeEnv;
  const oldPos = state.pos;
  const max = state.posMax;

  if (
    state.src.charCodeAt(state.pos) !== 33 /* ! */ ||
    state.src.charCodeAt(state.pos + 1) !== 91 /* [ */
  )
    return false;

  const labelStart = state.pos + 2;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) return false;

  const rawLabel = state.src.substring(labelStart, labelEnd);

  // check if label has img size
  const matches = OBSIDIAN_IMAGE_SIZE_REGEXP.exec(rawLabel);

  if (!matches) return false;

  const [, label, width, height] = matches;
  const widthValue = Number(width);
  const heightValue = Number(height);

  if (!widthValue && !heightValue) return false;

  let pos = labelEnd + 1;
  let href = "";
  let title = "";

  if (pos < max && state.src.charCodeAt(pos) === 40 /* ( */) {
    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;

    while (pos < max) {
      if (!isSpace(state.src.charCodeAt(pos))) break;
      pos++;
    }

    if (pos >= max) return false;

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    let res;

    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);

    if (res.ok) {
      href = state.md.normalizeLink(res.str);

      if (state.md.validateLink(href)) pos = res.pos;
      else href = "";
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    const start = pos;

    for (; pos < max; pos++) {
      if (!isSpace(state.src.charCodeAt(pos))) break;
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);

    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        if (!isSpace(state.src.charCodeAt(pos))) break;
      }
    } else {
      title = "";
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 41 /* ) */) {
      state.pos = oldPos;

      return false;
    }
    pos++;
  } else {
    let referenceLabel = "";

    //
    // Link reference
    //
    if (typeof env.references === "undefined") return false;

    // [foo]  [bar]
    //      ^^ optional whitespace (can include newlines)
    for (; pos < max; pos++) {
      if (!isSpace(state.src.charCodeAt(pos))) break;
    }

    if (pos < max && state.src.charCodeAt(pos) === 91 /* [ */) {
      const start = pos + 1;

      pos = state.md.helpers.parseLinkLabel(state, pos);

      if (pos >= 0) referenceLabel = state.src.substring(start, pos++);
      else pos = labelEnd + 1;
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!referenceLabel) referenceLabel = label;

    const ref =
      env.references[state.md.utils.normalizeReference(referenceLabel)];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!ref) {
      state.pos = oldPos;

      return false;
    }

    href = ref.href;
    title = ref.title ?? "";
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    const token = state.push("image", "img", 0);
    const attrs: [string, string][] = [
      ["src", href],
      ["alt", ""],
    ];

    if (title) attrs.push(["title", title]);

    if (widthValue) attrs.push(["width", width]);
    if (heightValue) attrs.push(["height", height]);

    const tokens: Token[] = [];

    state.md.inline.parse(label, state.md, state.env, tokens);

    token.attrs = attrs;
    token.children = tokens;
    token.content = label;
  }

  state.pos = pos;
  state.posMax = max;

  return true;
};

export const obsidianImgSize: PluginSimple = (md) => {
  md.inline.ruler.before("image", "obsidian-img-size", obsidianImgSizeRule);
};
