import { hasRule } from "@mdit/helper";
import type { PluginWithOptions } from "@mdit/helper";

import { normalizeOption } from "./normalizeOption.js";
import type { EmojiPluginOptions } from "./options.js";
import { emojiRender } from "./render.js";
import { emojiRule } from "./rule.js";

export const bareEmoji: PluginWithOptions<EmojiPluginOptions> = (
  md,
  { definitions = {}, shortcuts = {}, enabled = [] } = {},
) => {
  const options = normalizeOption({
    definitions,
    shortcuts,
    enabled,
  });

  md.renderer.rules.emoji = emojiRender;

  // Only one emoji rule can be installed per instance: a repeated installation (including one with
  // a different definitions set) keeps the first installation's parse rule; the renderer
  // assignment above is idempotent. Install a single variant per markdown-it instance.
  if (!hasRule(md, "emoji", "core")) {
    md.core.ruler.after(
      "linkify",
      "emoji",
      emojiRule(md, options.definitions, options.shortcuts, options.scanRE, options.replaceRE),
    );
  }
};
