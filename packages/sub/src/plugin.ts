import { inlineRule } from "@mdit/plugin-inline-rule";
import type { PluginSimple } from "markdown-it";

export const sub: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "~",
    tag: "sub",
    token: "sub",
  });
};
