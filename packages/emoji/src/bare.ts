import type { PluginWithOptions } from "markdown-it";
import type { EmojiPluginOptions } from "./options.js";
import emoji_html from "./render.js";
import { emojiRule } from "./rule.js";
import { normalizeOption } from "./normalizeOption.js";

export const bareEmojiPlugin: PluginWithOptions<EmojiPluginOptions> = (md, options) => {
  const defaults = {
    defs: {},
    shortcuts: {},
    enabled: [],
  };

  const opts = normalizeOption(md.utils.assign({}, defaults, options ?? {}));

  md.renderer.rules.emoji = emoji_html;

  md.core.ruler.after(
    "linkify",
    "emoji",
    emojiRule(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE),
  );
};
