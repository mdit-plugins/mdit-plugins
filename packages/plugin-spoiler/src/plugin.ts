import type { UniversalPluginWithOptions } from "@mdit/helper";
import { inlineRule } from "@mdit/plugin-inline-rule";
import type { MarkdownIt } from "markdown-it";

import type { MarkdownItSpoilerOptions } from "./options.js";

export const spoiler: UniversalPluginWithOptions<MarkdownItSpoilerOptions> = ((
  md: MarkdownIt,
  {
    tag = "span",
    // A factory is used by default so every token receives a fresh attrs array: token attrs are
    // never shared, and `@mdit/plugin-attrs` can never mutate the plugin options.
    attrs = (): [string, string][] => [
      ["class", "spoiler"],
      ["tabindex", "-1"],
    ],
  }: MarkdownItSpoilerOptions = {},
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
}) as UniversalPluginWithOptions<MarkdownItSpoilerOptions>;
