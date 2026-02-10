// Convert input options to more useable format
// and compile search regexp

import type { EmojiPluginOptions } from "./options.js";

const quoteRE = (str: string): string => str.replaceAll(/[.?*+^$[\]\\(){}|-]/g, String.raw`\$&`);

export interface NormalizedEmojiPluginOptions {
  defs: Record<string, string>;
  shortcuts: Record<string, string>;
  scanRE: RegExp;
  replaceRE: RegExp;
}

export const normalizeOption = (options: EmojiPluginOptions): NormalizedEmojiPluginOptions => {
  let emojies = options.defs ?? {};

  // Filter emojies by whitelist, if needed
  if (options.enabled?.length) {
    const enabled = options.enabled;
    emojies = Object.keys(emojies).reduce<Record<string, string>>((acc, key) => {
      if (enabled.includes(key)) acc[key] = emojies[key];
      return acc;
    }, {});
  }

  // Flatten shortcuts to simple object: { alias: emoji_name }
  const shortcuts = Object.keys(options.shortcuts ?? {}).reduce<Record<string, string>>(
    (acc, key) => {
      // Skip aliases for filtered emojies, to reduce regexp
      if (!emojies[key]) return acc;

      // oxlint-disable-next-line typescript/no-non-null-assertion
      const shortcut = options.shortcuts![key];

      if (Array.isArray(shortcut)) {
        shortcut.forEach((alias) => {
          acc[alias] = key;
        });
        return acc;
      }

      acc[shortcut] = key;
      return acc;
    },
    {},
  );

  const keys = Object.keys(emojies);
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
    defs: emojies,
    shortcuts,
    scanRE,
    replaceRE,
  };
};
