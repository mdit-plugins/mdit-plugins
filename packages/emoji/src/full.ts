import type { PluginWithOptions } from "markdown-it";
import emojies_defs from "./data/full.js";
import emojies_shortcuts from "./data/shortcuts.js";
import { bareEmojiPlugin } from "./bare.js";
import type { EmojiPluginOptions } from "./options.js";

const emoji_plugin: PluginWithOptions<EmojiPluginOptions> = (md, options) => {
  const defaults = {
    defs: emojies_defs,
    shortcuts: emojies_shortcuts,
    enabled: [],
  };

  const opts = md.utils.assign({}, defaults, options ?? {});

  bareEmojiPlugin(md, opts);
};

export default emoji_plugin;
