import type { PluginSimple } from "markdown-it";

import { inlineRule } from "@mdit/plugin-inline-rule";

export const ins: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "+",
    tag: "ins",
    token: "ins",
    nested: true,
    placement: "before-emphasis",
  });
};
