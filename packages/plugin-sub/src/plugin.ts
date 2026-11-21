import type { UniversalPluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";
import type { MarkdownIt } from "markdown-it";

export const sub: UniversalPluginSimple = ((md: MarkdownIt) => {
  inlineRule(md, {
    marker: "~",
    tag: "sub",
    token: "sub",
  });
}) as UniversalPluginSimple;
