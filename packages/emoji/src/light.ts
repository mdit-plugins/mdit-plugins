import type { PluginWithOptions } from "markdown-it";
import emojies_defs from "./data/light.js";
import emojiShortCuts from "./data/shortcuts.js";
import { bareEmojiPlugin } from "./bare.js";
import type { EmojiPluginOptions } from "./options.js";

const emoji_plugin: PluginWithOptions<EmojiPluginOptions> = (md, options) => {
  const defaults = {
    defs: emojies_defs,
    shortcuts: emojiShortCuts,
    enabled: [],
  };

  const opts = md.utils.assign({}, defaults, options ?? {});

  bareEmojiPlugin(md, opts);
};

export default emoji_plugin;
