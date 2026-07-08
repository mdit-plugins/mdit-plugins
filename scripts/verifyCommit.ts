import { readdir, stat, readFile } from "node:fs/promises";
import path from "node:path";

import picocolors from "picocolors";

const __dirname = import.meta.dirname;

const getSubDirectories = async (dir: string): Promise<string[]> => {
  const items = await readdir(dir);
  const stats = await Promise.all(items.map((item) => stat(path.join(dir, item))));

  return items.filter((_, index) => stats[index].isDirectory());
};

const pluginPackages = (await getSubDirectories(path.join(__dirname, "../packages"))).map((dir) =>
  dir === "helper" ? "helper" : `plugin-${dir}`,
);

const msgPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(".git/COMMIT_EDITMSG");
const msg = (await readFile(msgPath, "utf-8")).trim();

const types = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "workflow",
  "build",
  "ci",
  "chore",
  "types",
  "release",
];
const scopes = [...pluginPackages, "deps"];

const commitRE = /^(?:revert: )?(?<type>[^(]*?)(?:\((?<scope>[^)]*?)\))?!?: .{1,50}$/mu;

const match = commitRE.exec(msg);

if (!match) {
  console.error(
    `${picocolors.white(picocolors.bgRed(" ERROR "))} ${picocolors.red(
      `invalid commit message format.`,
    )}`,
  );
  // oxlint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

if (!types.includes(match.groups?.type ?? "")) {
  console.error(
    `${picocolors.white(picocolors.bgRed(" ERROR "))} ${picocolors.red(
      `invalid commit message type: "${match.groups?.type}".`,
    )}`,
  );
  // oxlint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

if (match.groups?.scope && !scopes.includes(match.groups.scope)) {
  console.error(
    `${picocolors.white(picocolors.bgRed(" ERROR "))} ${picocolors.red(
      `invalid commit message scope: "${match.groups.scope}".`,
    )}`,
  );
  // oxlint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}
