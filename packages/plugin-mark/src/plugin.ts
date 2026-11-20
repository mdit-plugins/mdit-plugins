import { definePlugin } from "@mdit/helper";
import type { UniversalPluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";

export const mark: UniversalPluginSimple = definePlugin("mark", (md) => {
  inlineRule(md, {
    marker: "=",
    tag: "mark",
    token: "mark",
    nested: true,
    double: true,
    placement: "before-emphasis",
  });
});
