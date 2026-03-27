import { inlineRule } from "@mdit/plugin-inline-rule";
import type { PluginSimple } from "markdown-it";

export const sup: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "^",
    tag: "sup",
    token: "sup",
  });
};
