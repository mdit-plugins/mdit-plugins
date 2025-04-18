import type { PluginSimple } from "markdown-it";

export const imgLazyload: PluginSimple = (md) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const originalImageRender = md.renderer.rules.image!;

  md.renderer.rules.image = (tokens, index, options, env, self): string => {
    tokens[index].attrSet("loading", "lazy");

    return originalImageRender(tokens, index, options, env, self);
  };
};
