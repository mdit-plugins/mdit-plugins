import type { PluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";

export const mark: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "=",
    tag: "mark",
    token: "mark",
    nested: true,
    double: true,
    placement: "before-emphasis",
  });
};
