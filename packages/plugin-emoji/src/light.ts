import { definePlugin } from "@mdit/helper";
import type { UniversalPluginWithOptions } from "@mdit/helper";

import { bareEmoji } from "./bare.js";
import { emojiLightData } from "./data/light.js";
import { emojiShortCuts } from "./data/shortcuts.js";
import type { EmojiPluginOptions } from "./options.js";

export const lightEmoji: UniversalPluginWithOptions<EmojiPluginOptions> =
  definePlugin<EmojiPluginOptions>(
    "lightEmoji",
    (md, { definitions = emojiLightData, shortcuts = emojiShortCuts, enabled = [] } = {}) => {
      bareEmoji(md, {
        definitions,
        shortcuts,
        enabled,
      });
    },
  );
