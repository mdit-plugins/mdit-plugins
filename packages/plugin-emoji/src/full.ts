import type { UniversalPluginWithOptions } from "@mdit/helper";
import type { MarkdownIt } from "markdown-it";

import { bareEmoji } from "./bare.js";
import { emojiData } from "./data/full.js";
import { emojiShortCuts } from "./data/shortcuts.js";
import type { EmojiPluginOptions } from "./options.js";

export const fullEmoji: UniversalPluginWithOptions<EmojiPluginOptions> = ((
  md: MarkdownIt,
  { definitions = emojiData, shortcuts = emojiShortCuts, enabled = [] }: EmojiPluginOptions = {},
) => {
  bareEmoji(md, {
    definitions,
    shortcuts,
    enabled,
  });
}) as UniversalPluginWithOptions<EmojiPluginOptions>;
