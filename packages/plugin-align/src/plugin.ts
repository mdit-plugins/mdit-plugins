import { definePlugin } from "@mdit/helper";
import type { UniversalPluginSimple } from "@mdit/helper";
import { container } from "@mdit/plugin-container";

export const align: UniversalPluginSimple = definePlugin("align", (md) => {
  ["left", "center", "right", "justify"].forEach((name) => {
    md.use(() => {
      container(md, {
        name,
        openRenderer: () => `<div style="text-align:${name}">\n`,
      });
    });
  });
});
