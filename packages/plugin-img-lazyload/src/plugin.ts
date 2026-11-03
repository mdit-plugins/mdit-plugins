import type { PluginSimple } from "@mdit/helper";
import type { RendererRule } from "markdown-it";

const LAZYLOAD_RENDERER_MARKER: unique symbol = Symbol.for("@mdit/plugin-img-lazyload/installed");

interface LazyloadRendererRule extends RendererRule {
  [LAZYLOAD_RENDERER_MARKER]?: boolean;
}

const isLazyloadRenderer = (rule: RendererRule): boolean =>
  (rule as LazyloadRendererRule)[LAZYLOAD_RENDERER_MARKER] === true;

export const imgLazyload: PluginSimple = (md) => {
  const originalImageRender = md.renderer.rules.image;

  // A second installation must not stack another wrapper: the installed rule already sets the
  // attribute. The marker lives on the rule itself, so it also covers a rule installed by another
  // copy of this plugin.
  if (isLazyloadRenderer(originalImageRender)) return;

  const lazyloadImageRender: LazyloadRendererRule = (tokens, index, options, env, self) => {
    tokens[index].attrSet("loading", "lazy");

    return originalImageRender(tokens, index, options, env, self);
  };

  lazyloadImageRender[LAZYLOAD_RENDERER_MARKER] = true;

  md.renderer.rules.image = lazyloadImageRender;
};
