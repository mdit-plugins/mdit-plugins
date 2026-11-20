import type { UniversalPluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";
import type { MarkdownIt } from "markdown-it";

export const mark: UniversalPluginSimple = ((md: MarkdownIt) => {
  inlineRule(md, {
    marker: "=",
    tag: "mark",
    token: "mark",
    nested: true,
    double: true,
    placement: "before-emphasis",
  });
}) as UniversalPluginSimple;
