import type { PluginSimple } from "markdown-it";
import { isSpace } from "markdown-it/lib/common/utils.mjs";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { ImgSizeEnv } from "./types.js";

const isNumber = (charCode: number): boolean => charCode >= 48 /* 0 */ && charCode <= 57; /* 9 */

/**
 * Parse image size information from label text in Obsidian format
 * Format: `alt | width x height`
 */
const parseObsidianImageSize = (
  label: string,
): {
  label: string;
  width: string | null;
  height: string | null;
} | null => {
  const max = label.length;
  let pos = label.lastIndexOf("|");

  if (pos === -1) return null;

  // Get original label part before the pipe
  const origLabel = label.slice(0, pos++).trimEnd();

  // Skip spaces after pipe
  while (pos < max) {
    if (!isSpace(label.charCodeAt(pos))) break;
    pos++;
  }

  if (pos === max) return null;

  const widthStart = pos;

  while (pos < max && isNumber(label.charCodeAt(pos))) {
    pos++;
  }

  if (pos === widthStart || pos === max) return null;

  const width = label.slice(widthStart, pos);

  // Skip spaces after width
  while (pos < max) {
    if (!isSpace(label.charCodeAt(pos))) break;
    pos++;
  }

  // Check for 'x' character - 只接受小写 x
  if (pos === max || label.charCodeAt(pos++) !== 120 /* x */) return null;

  // Skip spaces after 'x'
  while (pos < max) {
    if (!isSpace(label.charCodeAt(pos))) break;
    pos++;
  }

  const heightStart = pos;

  while (pos < max && isNumber(label.charCodeAt(pos))) {
    pos++;
  }

  if (pos === heightStart) return null;

  // 验证宽度是有效的数字序列
  const height = label.slice(heightStart, pos);
  const widthNum = Number(width);
  const heightNum = Number(height);

  if (!widthNum && !heightNum) return null;

  while (pos < max) {
    if (!isSpace(label.charCodeAt(pos++))) return null;
  }

  return {
    label: origLabel,
    width: widthNum ? width : null,
    height: heightNum ? height : null,
  };
};

export const obsidianImgSizeRule: RuleInline = (state, silent) => {
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

  const rawLabel = state.src.slice(labelStart, labelEnd);

  // check if label has img size
  const sizeInfo = parseObsidianImageSize(rawLabel);

  if (!sizeInfo) return false;

  const { label, width, height } = sizeInfo;

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

    if (pos === max) return false;

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

      if (pos >= 0) referenceLabel = state.src.slice(start, pos++);
      else pos = labelEnd + 1;
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!referenceLabel) referenceLabel = label;

    const ref = env.references[state.md.utils.normalizeReference(referenceLabel)];

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

    if (width) attrs.push(["width", width]);
    if (height) attrs.push(["height", height]);

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
