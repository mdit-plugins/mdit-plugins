/** Forked and modified from https://github.com/Antonio-Laguna/markdown-it-image-figures */
import { hasRule } from "@mdit/helper";
import type { CoreRule, PluginWithOptions } from "@mdit/helper";
import type { Token } from "markdown-it";

import type { MarkdownItFigureOptions } from "./options.js";

/** Native `<img>` attributes that should stay on the image */
const NATIVE_IMG_ATTRS = new Set([
  "alt",
  "crossorigin",
  "decoding",
  "elementtiming",
  "fetchpriority",
  "height",
  "ismap",
  "loading",
  "referrerpolicy",
  "sizes",
  "src",
  "srcset",
  "title",
  "usemap",
  "width",
]);

/** Matches any whitespace run when splitting `class` values */
const WHITESPACE_RE = /\s+/;

const removeAttribute = (token: Token, attribute: string): void => {
  // oxlint-disable-next-line typescript/no-non-null-assertion
  token.attrs = token.attrs!.filter(([key]) => key !== attribute);
};

/**
 * Merge a class value into an existing one, keeping the existing order and skipping duplicates.
 *
 * 将 class 值合并到已有的值中，保留原有顺序并跳过重复项。
 *
 * @param existing - Existing class value / 已有的 class 值
 * @param value - Class value to merge / 要合并的 class 值
 * @returns The merged class value / 合并后的 class 值
 */
const mergeClassValue = (existing: string, value: string): string => {
  const classes = new Set(existing.split(WHITESPACE_RE).filter(Boolean));
  let merged = existing;

  for (const className of value.split(WHITESPACE_RE)) {
    if (className && !classes.has(className)) {
      classes.add(className);
      merged = merged ? `${merged} ${className}` : className;
    }
  }

  return merged;
};

/**
 * Normalize a style value: trim each declaration and drop empty ones, so no empty declaration is
 * kept.
 *
 * 规范化 style 值：去除每个声明的首尾空白并丢弃空声明，避免留下空声明。
 *
 * @param value - Style value to normalize / 要规范化的 style 值
 * @returns The normalized style value / 规范化后的 style 值
 */
const normalizeStyleValue = (value: string): string => {
  const declarations = value.split(";");
  const normalized: string[] = [];

  for (const declaration of declarations) {
    const trimmed = declaration.trim();

    if (trimmed) normalized.push(trimmed);
  }

  return normalized.join(";");
};

/**
 * Merge an image attribute into the figure token.
 *
 * `class` values are merged and deduplicated, `style` values are merged as declarations, and any
 * other existing key is kept (first value wins).
 *
 * 将图片属性合并到 figure token 中。
 *
 * `class` 值会合并并去重，`style` 值会作为声明合并，其他已有的属性会保留（第一个值优先）。
 *
 * @param token - Figure token to merge into / 要合并到的 figure token
 * @param attr - Image attribute to merge / 要合并的图片属性
 */
const mergeFigureAttr = (token: Token, attr: [string, string | number]): void => {
  const attrs = (token.attrs ??= []);
  const attrKey = attr[0].toLowerCase();
  const existing = attrs.find(([key]) => key.toLowerCase() === attrKey);

  if (!existing) {
    // Clone the tuple: figure and image tokens must never share mutable attr arrays, otherwise a
    // later merge (or a downstream rule using `attrJoin`) would mutate both tokens.
    attrs.push([attr[0], attr[1]]);
  } else if (attrKey === "class") {
    existing[1] = mergeClassValue(String(existing[1]), String(attr[1]));
  } else if (attrKey === "style") {
    const existingStyle = normalizeStyleValue(String(existing[1]));
    const newStyle = normalizeStyleValue(String(attr[1]));

    if (newStyle) existing[1] = existingStyle ? `${existingStyle};${newStyle}` : newStyle;
  }
};

const testPattern = (pattern: RegExp, value: string): boolean => {
  // a global / sticky regex keeps `lastIndex` between calls
  if (pattern.global || pattern.sticky) pattern.lastIndex = 0;

  return pattern.test(value);
};

const getCaption = (image: Token): string => {
  const title = image.attrs?.find(([attr]) => attr === "title")?.[1] ?? null;

  if (title != null) {
    removeAttribute(image, "title");

    return title as string;
  }

  return image.content;
};

export const figure: PluginWithOptions<MarkdownItFigureOptions> = (
  md,
  { moveAttrs, focusable, linkImage } = {},
) => {
  const figureRule: CoreRule = (state) => {
    // do not process first and last token
    for (let index = 1, { length } = state.tokens; index < length - 1; index++) {
      const token = state.tokens[index];

      if (token.type !== "inline") continue;

      // children: image alone, or link_open -> image -> link_close
      if (!token.children || (token.children.length !== 1 && token.children.length !== 3)) continue;

      // one child, should be img
      if (token.children.length === 1 && token.children[0].type !== "image") continue;

      // three children, should be image enclosed in link
      if (token.children.length === 3) {
        // skip linked images if linkImage is false
        if (linkImage === false) continue;

        const [childrenA, childrenB, childrenC] = token.children;
        const isEnclosed =
          childrenA.type !== "link_open" ||
          childrenB.type !== "image" ||
          childrenC.type !== "link_close";

        if (isEnclosed) continue;
      }

      // check prev token is paragraph open and next token is paragraph close
      // hidden paragraphs (tight lists) render no figure tags, which would orphan the figcaption
      if (
        state.tokens[index - 1].type !== "paragraph_open" ||
        state.tokens[index - 1].hidden ||
        state.tokens[index + 1].type !== "paragraph_close"
      )
        continue;

      // We have inline token containing an image only.
      // Previous token is paragraph open.
      // Next token is paragraph close.
      // Lets replace the paragraph tokens with figure tokens.
      const figureToken = state.tokens[index - 1];

      figureToken.type = "figure_open";
      figureToken.tag = "figure";
      state.tokens[index + 1].type = "figure_close";
      state.tokens[index + 1].tag = "figure";

      // for linked images, image is one off
      const image = token.children.length === 1 ? token.children[0] : token.children[1];

      // oxlint-disable-next-line typescript/strict-boolean-expressions
      if (moveAttrs && image.attrs) {
        if (moveAttrs === true) {
          // Copy all non-native attrs to figure (img keeps them)
          const copiedAttrs = image.attrs.filter(([key]) => !NATIVE_IMG_ATTRS.has(key));

          for (const attr of copiedAttrs) mergeFigureAttr(figureToken, attr);
        } else {
          // Move matching attrs from img to figure (img loses them)
          const movedAttrs: [string, string | number][] = [];
          const keptAttrs: [string, string | number][] = [];

          for (const attr of image.attrs) {
            if (
              !NATIVE_IMG_ATTRS.has(attr[0]) &&
              moveAttrs.some((pattern) =>
                typeof pattern === "string" ? pattern === attr[0] : testPattern(pattern, attr[0]),
              )
            )
              movedAttrs.push(attr);
            else keptAttrs.push(attr);
          }

          if (movedAttrs.length > 0) {
            for (const attr of movedAttrs) mergeFigureAttr(figureToken, attr);
            image.attrs = keptAttrs;
          }
        }
      }

      const figCaption = getCaption(image);

      if (figCaption) {
        const [captionContent] = md.parseInline(figCaption, state.env);

        token.children.push(
          new state.Token("figcaption_open", "figcaption", 1),
          // oxlint-disable-next-line typescript/no-non-null-assertion
          ...captionContent.children!,
          new state.Token("figcaption_close", "figcaption", -1),
        );
      }

      // keep an author-provided tabindex instead of emitting a duplicate one
      // HTML attribute names are case-insensitive, and authored attrs keep their case
      if (focusable !== false && !image.attrs?.some(([key]) => key.toLowerCase() === "tabindex"))
        image.attrPush(["tabindex", "0"]);
    }
  };

  // Repeated installation of the same configuration must not register the rule twice.
  if (!hasRule(md, "figure", "core")) md.core.ruler.before("linkify", "figure", figureRule);
};
