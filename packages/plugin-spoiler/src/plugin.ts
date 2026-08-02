import { inlineRule } from "@mdit/plugin-inline-rule";
import type { PluginWithOptions } from "markdown-it";

import type { MarkdownItSpoilerOptions } from "./options.js";

export const spoiler: PluginWithOptions<MarkdownItSpoilerOptions> = (
  md,
  {
    tag = "span",
    // a fresh array is created on every `use(spoiler)` call, so token attrs are
    // not shared by reference across instances (avoiding cross-render leakage)
    attrs = [
      ["class", "spoiler"],
      ["tabindex", "-1"],
    ] as [string, string][],
  } = {},
) => {
  inlineRule(md, {
    marker: "!",
    tag,
    token: "spoiler",
    nested: true,
    double: true,
    placement: "before-emphasis",
    attrs,
  });
};
