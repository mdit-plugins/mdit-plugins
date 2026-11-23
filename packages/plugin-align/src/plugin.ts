import type { UniversalPluginSimple } from "@mdit/helper";
import { container } from "@mdit/plugin-container";
import type { MarkdownIt } from "markdown-it";

export const align: UniversalPluginSimple = ((md: MarkdownIt) => {
  ["left", "center", "right", "justify"].forEach((name) => {
    md.use(() => {
      container(md, {
        name,
        openRenderer: () => `<div style="text-align:${name}">\n`,
      });
    });
  });
}) as UniversalPluginSimple;
