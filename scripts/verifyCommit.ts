import path from "node:path";

import { verifyCommitMessage } from "@mr-hope/verify-commit-message";

/**
 * Verify the commit message passed to the `commit-msg` hook
 *
 * 校验传给 `commit-msg` hook 的提交信息
 */
export const verifyCommit = async (): Promise<void> => {
  await verifyCommitMessage({
    importMeta: import.meta,
    process,
    packages: ["docs", "packages/*"],
  });
};

/**
 * Whether this module is the process entry point
 *
 * The `commit-msg` hook executes this file through `unrun`, which runs a generated
 * `node_modules/.unrun/<name>.<hash>.mjs` bundle in a child process. In that case `process.argv[1]`
 * points at the bundle instead of this file, so the bundle name is matched as well.
 *
 * @returns Whether the current module is executed directly / 当前模块是否被直接执行
 */
const isEntryPoint = (): boolean => {
  const [, entry] = process.argv;

  if (!entry) return false;

  const entryPath = path.resolve(entry);

  return (
    entryPath === import.meta.filename ||
    path.basename(entryPath).startsWith(`${path.basename(import.meta.filename)}.`)
  );
};

if (isEntryPoint()) await verifyCommit();
