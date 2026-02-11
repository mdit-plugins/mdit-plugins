import type { PluginWithOptions } from "markdown-it";

import { inlineRule } from "@mdit/plugin-inline-rule";

import type { MarkdownItSpoilerOptions } from "./options.js";

const DEFAULT_TAG = "span";
const DEFAULT_ATTRS: [string, string][] = [
  ["class", "spoiler"],
  ["tabindex", "-1"],
];

export const spoiler: PluginWithOptions<MarkdownItSpoilerOptions> = (md, options) => {
  const { tag = DEFAULT_TAG, attrs = DEFAULT_ATTRS } = options ?? {};

  inlineRule(md, {
    marker: "!",
    tag,
    token: "spoiler",
    nested: true,
    placement: "before-emphasis",
    attrs,
  });
};
