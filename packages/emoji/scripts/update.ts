import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, ".."); // packages/emoji

const G_EMOJI_SOURCE = "https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json";

const obj2esm = (obj: unknown): string => `\
// Generated, don't edit
export default ${JSON.stringify(obj, null, 2)};
`;

const main = async (): Promise<void> => {
  const response = await fetch(G_EMOJI_SOURCE);

  if (!response.ok) throw new Error(`Bad response code: ${response.status}`);

  const defs = (await response.json()) as { emoji: string; aliases: string[] }[];

  // Drop aliases without names (with names "uXXXX")
  defs.forEach((def) => {
    def.aliases = def.aliases.filter((a) => !/^u[0-9a-b]{4,}$/i.test(a));
  });

  //
  // Write full set
  //

  const emojis: Record<string, string> = {};

  defs.forEach((def) => {
    def.aliases.forEach((alias) => {
      emojis[alias] = def.emoji;
    });
  });

  writeFileSync(resolve(root, "src/data/full.ts"), obj2esm(emojis), "utf-8");

  //
  // Write light set
  //

  const visible = readFileSync(resolve(root, "visible.txt"), "utf-8");

  const emoji_light: Record<string, string> = {};

  Object.keys(emojis).forEach((name) => {
    const val = emojis[name];
    if (visible.includes(val.replaceAll("\uFE0F", ""))) {
      emoji_light[name] = val;
    }
  });

  writeFileSync(resolve(root, "src/data/light.ts"), obj2esm(emoji_light), "utf-8");
};

await main();
