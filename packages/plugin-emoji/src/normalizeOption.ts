/**
 * Forked and modified from
 * https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/normalize_opts.mjs
 */

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

    // Skip empty and whitespace-only shortcuts: an empty string would add a
    // zero-length alternative that matches at every position, while a
    // whitespace-only alias is meaningless and can still rewrite delimiting
    // whitespace. Both would corrupt plain text.
    if (Array.isArray(shortcut)) {
      shortcut.forEach((alias) => {
        if (alias.trim().length > 0) acc[alias] = key;
      });
      return acc;
    }

    if (shortcut.trim().length > 0) acc[shortcut] = key;
    return acc;
  }, {});

  const keys = Object.keys(definitions);
  const names =
    // If no definitions are given, return empty regex to avoid replacements with 'undefined'.
    keys.length === 0
      ? "^$"
      : // Compile regexp
        keys
          .map((name) => `:${name}:`)
          .concat(Object.keys(shortcuts))
          .sort()
          .reverse()
          .map((name) => quoteRE(name))
          .join("|");

  const scanRE = new RegExp(names);
  const replaceRE = new RegExp(names, "g");

  return {
    definitions,
    shortcuts,
    scanRE,
    replaceRE,
  };
};
