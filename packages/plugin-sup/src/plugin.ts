import { definePlugin } from "@mdit/helper";
import type { UniversalPluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";

export const sup: UniversalPluginSimple = definePlugin("sup", (md) => {
  inlineRule(md, {
    marker: "^",
    tag: "sup",
    token: "sup",
  });
});
