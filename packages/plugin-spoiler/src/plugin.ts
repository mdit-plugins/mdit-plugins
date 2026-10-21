import type { PluginWithOptions } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";

import type { MarkdownItSpoilerOptions } from "./options.js";

export const spoiler: PluginWithOptions<MarkdownItSpoilerOptions> = (
  md,
  {
    tag = "span",
    // `inline-rule` clones these attrs for every token, so this array is never
    // shared with token instances nor mutated by `@mdit/plugin-attrs`
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
