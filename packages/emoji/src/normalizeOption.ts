// Convert input options to more useable format
// and compile search regexp

import type { EmojiPluginOptions } from "./options.js";

const quoteRE = (str: string): string => str.replaceAll(/[.?*+^$[\]\\(){}|-]/g, String.raw`\$&`);

export interface NormalizedEmojiPluginOptions {
  definitions: Record<string, string>;
  shortcuts: Record<string, string>;
  scanRE: RegExp;
  replaceRE: RegExp;
}

export const normalizeOption = ({
  definitions = {},
  enabled = [],
  shortcuts: shortcutsOption = {},
}: EmojiPluginOptions): NormalizedEmojiPluginOptions => {
  // Filter emojis by whitelist, if needed
  if (enabled.length > 0) {
    const enabledSet = new Set(enabled);

    // oxlint-disable-next-line no-param-reassign
    definitions = Object.fromEntries(
      Object.entries(definitions).filter(([key]) => enabledSet.has(key)),
    );
  }

  // Flatten shortcuts to simple object: { alias: emoji_name }
  const shortcuts = Object.keys(shortcutsOption).reduce<Record<string, string>>((acc, key) => {
    // Skip aliases for filtered emojis, to reduce regexp
    if (!definitions[key]) return acc;

    const shortcut = shortcutsOption[key];

    if (Array.isArray(shortcut)) {
      shortcut.forEach((alias) => {
        acc[alias] = key;
      });
      return acc;
    }

    acc[shortcut] = key;
    return acc;
  }, {});

  const keys = Object.keys(definitions);
  let names: string;

  // If no definitions are given, return empty regex to avoid replacements with 'undefined'.
  if (keys.length === 0) {
    names = "^$";
  } else {
    // Compile regexp
    names = keys
      .map((name) => `:${name}:`)
      .concat(Object.keys(shortcuts))
      .sort()
      .reverse()
      .map((name) => quoteRE(name))
      .join("|");
  }
  const scanRE = new RegExp(names);
  const replaceRE = new RegExp(names, "g");

  return {
    definitions,
    shortcuts,
    scanRE,
    replaceRE,
  };
};
