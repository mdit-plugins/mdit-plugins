/**
 * Fork and edited from https://github.com/tatsy/markdown-it-imsize/blob/master/lib/index.js
 */

import type { PluginSimple } from "markdown-it";
import { isSpace } from "markdown-it/lib/common/utils.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { ImgSizeEnv } from "./types.js";

// Parse image size
//
const parseNumber = (
  str: string,
  pos: number,
  max: number,
): { ok: boolean; pos: number; value: string } => {
  let char: number;
  const start = pos;
  const result = {
    ok: false,
    pos: pos,
    value: "",
  };

  char = str.charCodeAt(pos);

  while ((pos < max && char >= 48 /* 0 */ && char <= 57) /* 9 */ || char === 37 /* % */) {
    char = str.charCodeAt(++pos);
  }

  result.ok = true;
  result.pos = pos;
  result.value = str.slice(start, pos);

  return result;
};

const parseImageSize = (
  str: string,
  pos: number,
  max: number,
): { pos: number; width: string; height: string } | null => {
  if (str.charCodeAt(pos) !== 61 /* = */) return null;

  pos++;

  // size must follow = without any white spaces as follows
  // (1) =300x200
  // (2) =300x
  // (3) =x200
  const char = str.charCodeAt(pos);

  if (char !== 120 /* x */ && (char < 48 /* 0 */ || char > 57) /* 9 */) return null;

  // parse width
  const width = parseNumber(str, pos, max);

  pos = width.pos;

  // next character must be 'x'
  if (str.charCodeAt(pos++) !== 120 /* x */) return null;

  // parse height
  const height = parseNumber(str, pos, max);

  pos = height.pos;

  return {
    pos,
    width: width.value,
    height: height.value,
  };
};

const legacyImgSizeRule: RuleInline = (state, silent) => {
  const env = state.env as ImgSizeEnv;
  const oldPos = state.pos;
  const max = state.posMax;

  if (
    state.src.charCodeAt(state.pos) !== 33 /* ! */ ||
    state.src.charCodeAt(state.pos + 1) !== 91 /* [ */
  ) {
    return false;
  }

  const labelStart = state.pos + 2;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) return false;

  let pos = labelEnd + 1;
  let char: number;

  let href = "";
  let title = "";
  let width = "";
  let height = "";

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

    // minimal 5 => [link]( a =1x)
    if (pos + 5 > max) return false;

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

    let skipSpaces = false;

    if (start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        if (!isSpace(state.src.charCodeAt(pos))) {
          skipSpaces = true;
          break;
        }
      }

      if (!skipSpaces || pos + 3 > max) return false;
    } else {
      title = "";
    }

    const sizeInfo = parseImageSize(state.src, pos, state.posMax);

    if (sizeInfo) {
      ({ width, height, pos } = sizeInfo);

      // [link](  <href>  "title" =WxH  )
      //                              ^^ skipping these spaces
      for (; pos < max; pos++) {
        if (!isSpace(state.src.charCodeAt(pos))) break;
      }
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 41 /* ) */) {
      state.pos = oldPos;

      return false;
    }
    pos++;
  } else {
    let label = "";

    //
    // Link reference
    //
    if (typeof env.references === "undefined") return false;

    // [foo]  [bar]
    //      ^^ optional whitespace (can include newlines)
    for (; pos < max; pos++) {
      char = state.src.charCodeAt(pos);
      if (char !== 32 /* space */ && char !== 9 /* \t */) break;
    }

    if (pos < max && state.src.charCodeAt(pos) === 91 /* [ */) {
      const start = pos + 1;

      pos = state.md.helpers.parseLinkLabel(state, pos);

      if (pos >= 0) label = state.src.slice(start, pos++);
      else pos = labelEnd + 1;
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) label = state.src.slice(labelStart, labelEnd);

    const ref = env.references[state.md.utils.normalizeReference(label)];

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
    const content = state.src.slice(labelStart, labelEnd);
    const tokens: Token[] = [];

    state.md.inline.parse(content, state.md, state.env, tokens);

    const token = state.push("image", "img", 0);

    const attrs: [string, string][] = [
      ["src", href],
      ["alt", ""],
    ];

    if (title) attrs.push(["title", title]);
    if (width) attrs.push(["width", width]);
    if (height) attrs.push(["height", height]);
    token.attrs = attrs;

    token.children = tokens;
    token.content = content;
  }

  state.pos = pos;
  state.posMax = max;

  return true;
};

/**
 * @deprecated Recommended to use `imgSize` instead.
 */
export const legacyImgSize: PluginSimple = (md) => {
  md.inline.ruler.before("emphasis", "image", legacyImgSizeRule);
};
