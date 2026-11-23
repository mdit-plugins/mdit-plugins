import type { UniversalPluginSimple } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";
import type { MarkdownIt } from "markdown-it";

export const sup: UniversalPluginSimple = ((md: MarkdownIt) => {
  inlineRule(md, {
    marker: "^",
    tag: "sup",
    token: "sup",
  });
}) as UniversalPluginSimple;
