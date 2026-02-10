import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, ".."); // packages/emoji

const G_EMOJI_SOURCE = "https://raw.githubusercontent.com/rhysd/gemoji/unicode-16.0/db/emoji.json";
// const G_EMOJI_SOURCE = "https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json";

const emojiDataToFile = (emojiData: unknown, light = false): string => `\
// oxlint-disable id-length${light ? "" : ", max-lines"}
// Generated, don't edit
export const emoji${light ? "Light" : ""}Data: Record<string, string> = ${JSON.stringify(emojiData, null, 2)};
`;

const main = async (): Promise<void> => {
  const response = await fetch(G_EMOJI_SOURCE);

  if (!response.ok) throw new Error(`Bad response code: ${response.status}`);

  const definitions = (await response.json()) as { emoji: string; aliases: string[] }[];

  // Drop aliases without names (with names "uXXXX")
  definitions.forEach((definition) => {
    definition.aliases = definition.aliases.filter((a) => !/^u[0-9a-b]{4,}$/i.test(a));
  });

  const emojis: Record<string, string> = {};

  definitions.forEach((def) => {
    def.aliases.forEach((alias) => {
      emojis[alias] = def.emoji;
    });
  });

  writeFileSync(resolve(root, "src/data/full.ts"), emojiDataToFile(emojis), "utf-8");

  const visible = readFileSync(resolve(root, "visible.txt"), "utf-8");

  const emojiLight: Record<string, string> = {};

  Object.keys(emojis).forEach((name) => {
    const val = emojis[name];
    if (visible.includes(val.replaceAll("\uFE0F", ""))) {
      emojiLight[name] = val;
    }
  });

  writeFileSync(resolve(root, "src/data/light.ts"), emojiDataToFile(emojiLight, true), "utf-8");
};

await main();
