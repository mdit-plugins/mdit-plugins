import type { PluginWithOptions } from "@mdit/helper";
import { uml } from "@mdit/plugin-uml";
import type { MarkdownItOptions, Renderer, Token } from "markdown-it";

import { deflate } from "@deflate";

import { customEncodeBase64 } from "./customBase64.js";
import type { MarkdownItPlantumlOptions } from "./options.js";

export const plantuml: PluginWithOptions<MarkdownItPlantumlOptions> = (
  md,
  {
    type = "uml",
    name = "uml",
    open = `start${name}`,
    close = `end${name}`,
    fence = name,
    format = "svg",
    server = "https://www.plantuml.com/plantuml",
    srcGetter = (content: string): string =>
      `${server}/${format}/${customEncodeBase64(
        deflate(`@start${name}\n${content.trim()}\n@end${name}`),
      )}`,
    renderer = (
      tokens: Token[],
      index: number,
      options: Required<MarkdownItOptions>,
      _env: unknown,
      self: Renderer,
    ): string => {
      const token = tokens[index];
      const { content, info } = token;

      token.tag = "img";
      // use attrSet so that rendering the same token twice does not duplicate
      // the src / alt attributes
      token.attrSet("src", srcGetter(content));
      token.attrSet("alt", info || "PlantUML Diagram");

      return self.renderToken(tokens, index, options);
    },
  } = {},
) => {
  if (type === "uml") {
    md.use(uml, {
      name,
      open,
      close,
      renderer,
    });
  } else {
    // Handle ```name  blocks
    const fenceRender = md.renderer.rules.fence;

    md.renderer.rules.fence = (tokens, index, options, env, self): string => {
      const token = tokens[index];
      const { info } = token;
      const spaceIndex = info.indexOf(" ");
      const fenceName = spaceIndex === -1 ? info : info.slice(0, spaceIndex);

      if (fenceName === fence) {
        // the renderer reads the alt text from `info`, so swap it in temporarily
        // and restore it afterwards to keep the token stream unchanged
        token.info = spaceIndex === -1 ? "" : info.slice(spaceIndex + 1).trim();

        try {
          return renderer(tokens, index, options, env, self);
        } finally {
          token.info = info;
        }
      }

      return fenceRender(tokens, index, options, env, self);
    };
  }
};
