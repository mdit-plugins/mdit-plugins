/**
 * Forked and modified from https://github.com/Antonio-Laguna/markdown-it-image-figures
 */
import type { PluginWithOptions } from "markdown-it";
import type { RuleCore } from "markdown-it/lib/parser_core.mjs";
import type Token from "markdown-it/lib/token.mjs";

import type { MarkdownItFigureOptions } from "./options.js";

const removeAttribute = (token: Token, attribute: string): void => {
  token.attrs = token.attrs?.filter(([key]) => key !== attribute) ?? null;
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
  options = {},
) => {
  const figureRule: RuleCore = (state) => {
    // do not process first and last token
    for (
      let index = 1, { length } = state.tokens;
      index < length - 1;
      index++
    ) {
      const token = state.tokens[index];

      if (token.type !== "inline") continue;

      // children: image alone, or link_open -> image -> link_close
      if (
        !token.children ||
        (token.children.length !== 1 && token.children.length !== 3)
      )
        continue;

      // one child, should be img
      if (token.children.length === 1 && token.children[0].type !== "image")
        continue;

      // three children, should be image enclosed in link
      if (token.children.length === 3) {
        const [childrenA, childrenB, childrenC] = token.children;
        const isEnclosed =
          childrenA.type !== "link_open" ||
          childrenB.type !== "image" ||
          childrenC.type !== "link_close";

        if (isEnclosed) continue;
      }

      // prev token is paragraph open
      if (state.tokens[index - 1].type !== "paragraph_open") continue;

      // next token is paragraph close
      if (state.tokens[index + 1].type !== "paragraph_close") continue;

      // We have inline token containing an image only.
      // Previous token is paragraph open.
      // Next token is paragraph close.
      // Lets replace the paragraph tokens with figure tokens.
      const figure = state.tokens[index - 1];

      figure.type = "figure_open";
      figure.tag = "figure";
      state.tokens[index + 1].type = "figure_close";
      state.tokens[index + 1].tag = "figure";

      // for linked images, image is one off
      const image =
        token.children.length === 1 ? token.children[0] : token.children[1];

      const figCaption = getCaption(image);
      const [captionContent] = md.parseInline(figCaption, state.env);

      token.children.push(new state.Token("figcaption_open", "figcaption", 1));
      token.children.push(...(captionContent.children ?? []));
      token.children.push(
        new state.Token("figcaption_close", "figcaption", -1),
      );

      if (options.focusable !== false) image.attrPush(["tabindex", "0"]);
    }
  };

  md.core.ruler.before("linkify", "figure", figureRule);
};
