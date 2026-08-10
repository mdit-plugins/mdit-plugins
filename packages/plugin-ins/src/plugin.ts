import type { PluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";

export const ins: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "+",
    tag: "ins",
    token: "ins",
    nested: true,
    double: true,
    placement: "before-emphasis",
  });
};
