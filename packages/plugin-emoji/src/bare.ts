import type { PluginWithOptions } from "markdown-it";

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

  md.core.ruler.after(
    "linkify",
    "emoji",
    emojiRule(md, options.definitions, options.shortcuts, options.scanRE, options.replaceRE),
  );
};
