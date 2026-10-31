import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASELINE_ROOT = path.join(ROOT, "temp", "bench-baseline");
const BASELINE_REF = process.env.BENCH_BASELINE_REF ?? "origin/main";
const MARKER = path.join(BASELINE_ROOT, ".bench-commit");

const exec = (command: string, args: string[], cwd: string): void => {
  execFileSync(command, args, {
    cwd,
    env: { ...process.env, HUSKY: "0" },
    stdio: "inherit",
  });
};

const removeBaseline = (): void => {
  if (!existsSync(BASELINE_ROOT)) return;

  try {
    exec("git", ["worktree", "remove", "--force", BASELINE_ROOT], ROOT);
  } catch {
    rmSync(BASELINE_ROOT, { recursive: true, force: true });
    exec("git", ["worktree", "prune"], ROOT);
  }
};

const getBaselineCommit = (): string =>
  execFileSync("git", ["rev-parse", BASELINE_REF], { cwd: ROOT, encoding: "utf8" }).trim();

const main = (): void => {
  if (process.argv.includes("--clean")) {
    removeBaseline();
    console.log(`[bench] removed baseline worktree ${BASELINE_ROOT}`);
    return;
  }

  const skipCurrentBuild = process.argv.includes("--skip-current-build");

  if (!skipCurrentBuild) {
    console.log("[bench] building current tree (production dist)…");
    exec("pnpm", ["run", "build"], ROOT);
  }

  const commit = getBaselineCommit();

  if (existsSync(MARKER) && readFileSync(MARKER, "utf8").trim() === commit) {
    console.log(`[bench] baseline already prepared at ${commit}`);
    return;
  }

  removeBaseline();
  mkdirSync(path.dirname(BASELINE_ROOT), { recursive: true });
  console.log(`[bench] creating baseline worktree at ${BASELINE_REF} (${commit})…`);
  exec("git", ["worktree", "add", "--detach", BASELINE_ROOT, commit], ROOT);

  console.log("[bench] installing baseline dependencies…");
  exec("pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], BASELINE_ROOT);

  console.log("[bench] building baseline (production dist)…");
  exec("pnpm", ["run", "build"], BASELINE_ROOT);

  writeFileSync(MARKER, `${commit}\n`);
  console.log(`[bench] baseline ready at ${commit}`);
};

main();
