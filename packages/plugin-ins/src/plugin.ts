import type { UniversalPluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";
import type { MarkdownIt } from "markdown-it";

export const ins: UniversalPluginSimple = ((md: MarkdownIt) => {
  inlineRule(md, {
    marker: "+",
    tag: "ins",
    token: "ins",
    nested: true,
    double: true,
    placement: "before-emphasis",
  });
}) as UniversalPluginSimple;
