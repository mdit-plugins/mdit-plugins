import type { PluginSimple } from "markdown-it";

import { inlineRule } from "@mdit/plugin-inline-rule";

export const sub: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "~",
    tag: "sub",
    token: "sub",
  });
};
