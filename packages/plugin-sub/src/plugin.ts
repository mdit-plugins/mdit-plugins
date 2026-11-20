import { definePlugin } from "@mdit/helper";
import type { UniversalPluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";

export const sub: UniversalPluginSimple = definePlugin("sub", (md) => {
  inlineRule(md, {
    marker: "~",
    tag: "sub",
    token: "sub",
  });
});
