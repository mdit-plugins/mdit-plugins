import { definePlugin } from "@mdit/helper";
import type { UniversalPluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";

export const ins: UniversalPluginSimple = definePlugin("ins", (md) => {
  inlineRule(md, {
    marker: "+",
    tag: "ins",
    token: "ins",
    nested: true,
    double: true,
    placement: "before-emphasis",
  });
});
