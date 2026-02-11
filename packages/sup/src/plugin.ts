import type { PluginSimple } from "markdown-it";

import { inlineRule } from "@mdit/plugin-inline-rule";

export const sup: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "^",
    tag: "sup",
    token: "sup",
  });
};
