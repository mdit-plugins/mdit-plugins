import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "vitest";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASELINE_ROOT = path.join(ROOT, "temp", "bench-baseline");

/** A plugin function loaded from a built package / 从构建产物加载的插件函数 */
export type BenchPlugin = (md: unknown, options?: unknown) => void;

const importBuiltPackage = async (
  root: string,
  packageDir: string,
): Promise<Record<string, unknown>> => {
  const entry = path.join(root, "packages", packageDir, "dist", "index.js");

  if (!existsSync(entry)) {
    throw new Error(
      `[bench] ${entry} is missing. Run \`pnpm run bench:prepare\` first to build the current tree and the baseline worktree.`,
    );
  }

  return import(/* @vite-ignore */ pathToFileURL(entry).href) as Promise<Record<string, unknown>>;
};

/**
 * Load a built package from the current working tree.
 *
 * 从当前工作区加载已构建的包。
 *
 * @param packageDir - Directory name under packages/ / packages/ 下的目录名
 * @returns The loaded module namespace / 加载后的模块命名空间
 */
export const loadCurrent = async (packageDir: string): Promise<Record<string, unknown>> =>
  importBuiltPackage(ROOT, packageDir);

/**
 * Load a built package from the baseline worktree.
 *
 * 从 baseline worktree 加载已构建的包。
 *
 * @param packageDir - Directory name under packages/ / packages/ 下的目录名
 * @returns The loaded module namespace / 加载后的模块命名空间
 */
export const loadBaseline = async (packageDir: string): Promise<Record<string, unknown>> =>
  importBuiltPackage(BASELINE_ROOT, packageDir);

/**
 * Register a Vitest benchmark.
 *
 * 注册一个 Vitest benchmark。
 *
 * @param name - Benchmark name / benchmark 名称
 * @param fn - Function to benchmark / 要 benchmark 的函数
 */
export const defineBench = (name: string, fn: () => void): void => {
  test(name, async ({ bench: benchmark }) => {
    await expect(benchmark(name, fn).run()).resolves.toBeDefined();
  });
};
