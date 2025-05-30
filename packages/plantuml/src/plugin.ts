// eslint-disable-next-line import-x/no-unresolved
import { deflate } from "@deflate";
import { uml } from "@mdit/plugin-uml";
import type { Options, PluginWithOptions } from "markdown-it";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
