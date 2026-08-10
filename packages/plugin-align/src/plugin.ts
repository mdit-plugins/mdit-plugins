import type { PluginSimple } from "@mdit/helper";
import { container } from "@mdit/plugin-container";

export const align: PluginSimple = (md) => {
  ["left", "center", "right", "justify"].forEach((name) => {
    md.use(() => {
      container(md, {
        name,
        openRender: () => `<div style="text-align:${name}">\n`,
      });
    });
  });
};
