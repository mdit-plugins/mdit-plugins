import type { PluginWithOptions } from "markdown-it";
import { emojiData } from "./data/full.js";
import { emojiShortCuts } from "./data/shortcuts.js";
import { bareEmoji } from "./bare.js";
import type { EmojiPluginOptions } from "./options.js";

export const fullEmoji: PluginWithOptions<EmojiPluginOptions> = (
  md,
  { definitions = emojiData, shortcuts = emojiShortCuts, enabled = [] } = {},
) => {
  bareEmoji(md, {
    definitions,
    shortcuts,
    enabled,
  });
};
