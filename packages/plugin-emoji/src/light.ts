import type { UniversalPluginWithOptions } from "@mdit/helper";
import type { MarkdownIt } from "markdown-it";

import { bareEmoji } from "./bare.js";
import { emojiLightData } from "./data/light.js";
import { emojiShortCuts } from "./data/shortcuts.js";
import type { EmojiPluginOptions } from "./options.js";

export const lightEmoji: UniversalPluginWithOptions<EmojiPluginOptions> = ((
  md: MarkdownIt,
  {
    definitions = emojiLightData,
    shortcuts = emojiShortCuts,
    enabled = [],
  }: EmojiPluginOptions = {},
) => {
  bareEmoji(md, {
    definitions,
    shortcuts,
    enabled,
  });
}) as UniversalPluginWithOptions<EmojiPluginOptions>;
