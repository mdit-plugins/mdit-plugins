import { definePlugin } from "@mdit/helper";
import type { UniversalPluginWithOptions } from "@mdit/helper";

import { bareEmoji } from "./bare.js";
import { emojiData } from "./data/full.js";
import { emojiShortCuts } from "./data/shortcuts.js";
import type { EmojiPluginOptions } from "./options.js";

export const fullEmoji: UniversalPluginWithOptions<EmojiPluginOptions> =
  definePlugin<EmojiPluginOptions>(
    "fullEmoji",
    (md, { definitions = emojiData, shortcuts = emojiShortCuts, enabled = [] } = {}) => {
      bareEmoji(md, {
        definitions,
        shortcuts,
        enabled,
      });
    },
  );
