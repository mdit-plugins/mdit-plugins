import { container } from "@mdit/plugin-container";
import type { PluginSimple } from "markdown-it";

export const align: PluginSimple = (md) => {
  ["left", "center", "right", "justify"].forEach((name) =>
    md.use((md) =>
      container(md, {
        name,
        openRender: () => `<div style="text-align:${name}">\n`,
      }),
    ),
  );
};

export default align;
