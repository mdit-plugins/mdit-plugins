import type { PluginWithOptions } from "markdown-it";
import { emojiLightData } from "./data/light.js";
import { emojiShortCuts } from "./data/shortcuts.js";
import { bareEmoji } from "./bare.js";
import type { EmojiPluginOptions } from "./options.js";

export const lightEmoji: PluginWithOptions<EmojiPluginOptions> = (
  md,
  { definitions = emojiLightData, shortcuts = emojiShortCuts, enabled = [] } = {},
) => {
  bareEmoji(md, {
    definitions,
    shortcuts,
    enabled,
  });
};
