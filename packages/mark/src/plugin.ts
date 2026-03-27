import { inlineRule } from "@mdit/plugin-inline-rule";
import type { PluginSimple } from "markdown-it";

export const mark: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "=",
    tag: "mark",
    token: "mark",
    nested: true,
    placement: "before-emphasis",
  });
};
