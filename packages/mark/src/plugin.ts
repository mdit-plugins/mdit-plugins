import type { PluginSimple } from "markdown-it";

import { inlineRule } from "@mdit/plugin-inline-rule";

export const mark: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "=",
    tag: "mark",
    token: "mark",
    nested: true,
    placement: "before-emphasis",
  });
};
