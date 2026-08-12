import type { PluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";

export const sup: PluginSimple = (md) => {
  inlineRule(md, {
    marker: "^",
    tag: "sup",
    token: "sup",
  });
};
