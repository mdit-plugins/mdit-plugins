/** Fork and edited from https://github.com/tatsy/markdown-it-imsize/blob/master/lib/index.js */

import type { InlineRule, PluginSimple } from "@mdit/helper";
import type { MarkdownIt, Token } from "markdown-it";

import type { ImgSizeEnv } from "./types.js";

// oxlint-disable-next-line max-lines-per-function
const legacyImgSizeRule: InlineRule = (state, silent) => {
  const oldPos = state.pos;
  const src = state.src;

  // Cheap early exit: this rule is called for every terminator character of the inline content but
  // only ever handles `![` openers.
  if (src.charCodeAt(oldPos) !== 33 /* ! */ || src.charCodeAt(oldPos + 1) !== 91 /* [ */)
    return false;

  const md = state.md;
  const isSpace = md.utils.isSpace;
  const max = state.posMax;

  const labelStart = oldPos + 2;
  const labelEnd = md.helpers.parseLinkLabel(state, oldPos + 1, false);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) return false;

  let pos = labelEnd + 1;
  let charCode: number;

  let href = "";
  let title = "";
  let width = "";
  let height = "";

  if (pos < max && src.charCodeAt(pos) === 40 /* ( */) {
    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;

    while (pos < max) {
      if (!isSpace(src.charCodeAt(pos))) break;

      pos++;
    }

    // minimal 5 => [link]( a =1x)
    if (pos + 5 > max) return false;

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    let res;

    res = md.helpers.parseLinkDestination(src, pos, max);

    if (res.ok) {
      href = md.normalizeLink(res.str);

      if (md.validateLink(href)) pos = res.pos;
      else href = "";
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    const start = pos;

    for (; pos < max; pos++) if (!isSpace(src.charCodeAt(pos))) break;

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = md.helpers.parseLinkTitle(src, pos, max);

    let skipSpaces = false;

    if (start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        if (!isSpace(src.charCodeAt(pos))) {
          skipSpaces = true;
          break;
        }
      }

      if (!skipSpaces || pos + 3 > max) return false;
    } else {
      title = "";
    }

    // [link](  <href>  "title" =WxH  )
    //                          ^^^^ parsing image size
    //
    // The size is parsed in place: a generic helper allocated an object per dimension plus one per
    // image, which is measurable on image heavy documents.
    //
    // size must follow `=` without any white spaces as follows
    // (1) =300x200
    // (2) =300x
    // (3) =x200
    if (pos < max && src.charCodeAt(pos) === 61 /* = */) {
      const widthStart = pos + 1;
      let sizePos = widthStart;
      let sizeCode = src.charCodeAt(sizePos);
      let widthIsZero = true;

      // parse width
      while (sizePos < max) {
        sizeCode = src.charCodeAt(sizePos);

        if (sizeCode < 48 /* 0 */ || sizeCode > 57 /* 9 */) break;
        // `0` is treated as unspecified, so only the digits decide the numeric value
        if (sizeCode !== 48 /* 0 */) widthIsZero = false;

        sizePos++;
      }

      let widthEnd = sizePos;

      // the size must start directly after `=` with a number or `x`, without white spaces
      let valid = src.charCodeAt(widthStart) === 120 /* x */ || widthEnd > widthStart;

      // a dimension must be a pure number, optionally followed by a single trailing `%`
      if (valid && sizePos > widthStart && sizePos < max && src.charCodeAt(sizePos) === 37 /* % */)
        widthEnd = ++sizePos;

      // next character must be 'x'
      if (sizePos >= max || src.charCodeAt(sizePos) !== 120 /* x */) valid = false;

      if (valid) sizePos++;

      // parse height
      const heightStart = sizePos;
      let heightIsZero = true;

      while (sizePos < max) {
        sizeCode = src.charCodeAt(sizePos);

        if (sizeCode < 48 /* 0 */ || sizeCode > 57 /* 9 */) break;
        if (sizeCode !== 48 /* 0 */) heightIsZero = false;

        sizePos++;
      }

      let heightEnd = sizePos;

      if (valid && sizePos > heightStart && sizePos < max && src.charCodeAt(sizePos) === 37 /* % */)
        heightEnd = ++sizePos;

      // a size whose width and height are both zero is invalid and left unparsed
      if (widthIsZero && heightIsZero) valid = false;

      if (valid) {
        if (!widthIsZero) width = src.slice(widthStart, widthEnd);

        if (!heightIsZero) height = src.slice(heightStart, heightEnd);

        pos = sizePos;

        // [link](  <href>  "title" =WxH  )
        //                              ^^ skipping these spaces
        while (pos < max && isSpace(src.charCodeAt(pos))) pos++;
      }
    }

    if (pos >= max || src.charCodeAt(pos) !== 41 /* ) */) {
      state.pos = oldPos;

      return false;
    }
    pos++;
  } else {
    let label = "";

    //
    // Link reference
    //
    const env = state.env as ImgSizeEnv;

    if (typeof env.references !== "object") return false;

    // [foo]  [bar]
    //      ^^ optional whitespace (can include newlines)
    for (; pos < max; pos++) {
      charCode = src.charCodeAt(pos);
      if (charCode !== 32 /* space */ && charCode !== 9 /* \t */) break;
    }

    if (pos < max && src.charCodeAt(pos) === 91 /* [ */) {
      const start = pos + 1;

      pos = md.helpers.parseLinkLabel(state, pos);

      if (pos >= 0) label = src.slice(start, pos++);
      else pos = labelEnd + 1;
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) label = src.slice(labelStart, labelEnd);

    const ref = env.references[md.utils.normalizeReference(label)];

    // oxlint-disable-next-line typescript/strict-boolean-expressions
    if (!ref) {
      state.pos = oldPos;

      return false;
    }

    href = ref.href;
    // oxlint-disable-next-line typescript/no-non-null-assertion
    title = ref.title!;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    const content = src.slice(labelStart, labelEnd);
    const tokens: Token[] = [];

    md.inline.parse(content, md, state.env, tokens);

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

// markdown-it already ships a rule named `image`, so `hasRule` cannot tell whether this
// plugin has prepended its own one. Match the rule function instead.
const hasLegacyImgSizeRule = (md: MarkdownIt): boolean => {
  // oxlint-disable-next-line eslint/no-underscore-dangle
  const rules = md.inline.ruler.__rules__;

  return rules.some(({ fn, name }) => name === "image" && fn === legacyImgSizeRule);
};

/**
 * @deprecated Recommended to use `imgSize` instead.
 * @param md Markdown-it instance
 */
export const legacyImgSize: PluginSimple = (md) => {
  // A second installation would add another `image` rule in front of the upstream one.
  if (hasLegacyImgSizeRule(md)) return;

  md.inline.ruler.before("emphasis", "image", legacyImgSizeRule);
};
