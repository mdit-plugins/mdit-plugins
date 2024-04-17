import { uml } from "@mdit/plugin-uml";
import type { Options, PluginWithOptions, Renderer, Token } from "markdown-it";

import { encode64, zip_deflate } from "./lib/deflate.js";
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
      `${server}/${format}/${encode64(
        zip_deflate(
          unescape(
            encodeURIComponent(`@start${name}\n${content.trim()}\n@end${name}`),
          ),
          9,
        ),
      )}`,
    render = (
      tokens: Token[],
      index: number,
      options: Options,
      _env: unknown,
      self: Renderer,
    ): string => {
      const token = tokens[index];
      const { content, info = "plantuml diagram" } = token;

      token.tag = "img";
      token.attrPush(["src", srcGetter(content)]);
      token.attrPush(["alt", info]);

      return self.renderToken(tokens, index, options);
    },
  } = {},
) => {
  if (type === "uml") {
    md.use(uml, {
      name,
      open,
      close,
      render,
    });
  } else {
    // Handle ```name  blocks
    const fenceRender = md.renderer.rules.fence!;

    md.renderer.rules.fence = (
      tokens: Token[],
      index: number,
      options: Options,
      env: unknown,
      self: Renderer,
    ): string => {
      const token = tokens[index];

      const [fenceName, alt] = token.info.split(" ", 2);

      if (fenceName === fence) {
        token.info = alt;

        return render(tokens, index, options, env, self);
      }

      return fenceRender(tokens, index, options, env, self);
    };
  }
};
