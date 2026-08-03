/** Forked and modified from https://github.com/Antonio-Laguna/markdown-it-image-figures */
import type { PluginWithOptions } from "markdown-it";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
import type Token from "markdown-it/lib/token.mjs";

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

const removeAttribute = (token: Token, attribute: string): void => {
  // oxlint-disable-next-line typescript/no-non-null-assertion
  token.attrs = token.attrs!.filter(([key]) => key !== attribute);
};

const getCaption = (image: Token): string => {
  const title = image.attrs?.find(([attr]) => attr === "title")?.[1];

  if (title) {
    removeAttribute(image, "title");

    return title;
  }

  return image.content;
};

export const figure: PluginWithOptions<MarkdownItFigureOptions> = (
  md,
  { moveAttrs, focusable, linkImage } = {},
) => {
  const figureRule: RuleCore = (state) => {
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

          if (copiedAttrs.length > 0) {
            (figureToken.attrs ??= []).push(
              ...copiedAttrs.map(([key, value]) => [key, value] as [string, string]),
            );
          }
        } else {
          // Move matching attrs from img to figure (img loses them)
          const movedAttrs: [string, string][] = [];
          const keptAttrs: [string, string][] = [];

          for (const attr of image.attrs) {
            if (
              !NATIVE_IMG_ATTRS.has(attr[0]) &&
              moveAttrs.some((pattern) =>
                typeof pattern === "string" ? pattern === attr[0] : pattern.test(attr[0]),
              )
            )
              movedAttrs.push(attr);
            else keptAttrs.push(attr);
          }

          if (movedAttrs.length > 0) {
            (figureToken.attrs ??= []).push(...movedAttrs);
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

      if (focusable !== false) image.attrPush(["tabindex", "0"]);
    }
  };

  md.core.ruler.before("linkify", "figure", figureRule);
};
