// oxlint-disable-next-line import/no-nodejs-modules
import { realpathSync, statSync } from "node:fs";
// oxlint-disable-next-line import/no-nodejs-modules, unicorn/import-style
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

import { defaultSensitiveFiles, isSensitiveFile } from "@mdit/helper";

const PLUGIN_NAME = "[@mdit/plugin-include]";
const PROJECT_ROOT_ERROR = `${PLUGIN_NAME}: "projectRoot" must be an existing directory`;

/**
 * Security options shared by the include plugin.
 *
 * Include 插件共享的安全选项。
 */
export interface SecurityOptions {
  /** Whether files outside `projectRoot` may be read / 是否允许读取 `projectRoot` 之外的文件 */
  allowOutsideRoot?: boolean;
  /** Project root path / 项目根目录 */
  projectRoot?: string;
  /** Patterns of files that must not be read / 禁止读取的文件模式 */
  denyFiles?: readonly (string | RegExp)[];
}

/**
 * Validate a requested file before reading it.
 *
 * 读取文件前校验请求路径。
 */
export type SecurityChecker = (requestedPath: string, absolutePath: string) => void;

const toPosixPath = (path: string): string => path.split(sep).join("/");

/**
 * Resolve the real path of a file, falling back to the closest existing parent.
 *
 * 解析文件真实路径，文件不存在时回退到最近存在的父目录。
 *
 * @param path - Absolute path / 绝对路径
 * @returns Real path / 真实路径
 */
const resolveRealPath = (path: string): string => {
  const missingSegments: string[] = [];
  let currentPath = path;

  for (;;) {
    try {
      const realPath = realpathSync(currentPath);

      return missingSegments.length ? join(realPath, ...missingSegments) : realPath;
    } catch {
      const parentPath = dirname(currentPath);

      // The filesystem root has no parent, so nothing more can be resolved.
      /* istanbul ignore next -- @preserve */
      if (parentPath === currentPath) return path;

      missingSegments.unshift(basename(currentPath));
      currentPath = parentPath;
    }
  }
};

/**
 * Create a security checker that restricts file reads to the project root and blocks sensitive
 * files.
 *
 * 创建安全校验器，将文件读取限制在项目根目录内并阻止敏感文件。
 *
 * @param options - Security options / 安全选项
 * @returns Checker called before reading a file / 读取文件前调用的校验器
 */
export const createSecurityChecker = ({
  allowOutsideRoot = false,
  projectRoot,
  denyFiles,
}: SecurityOptions): SecurityChecker => {
  const projectRootPath = projectRoot ?? ".";
  let rootRealPath: string;

  try {
    rootRealPath = realpathSync(resolve(process.cwd(), projectRootPath));
  } catch {
    throw new Error(`${PROJECT_ROOT_ERROR}: ${projectRootPath}`);
  }

  if (!statSync(rootRealPath).isDirectory())
    throw new Error(`${PROJECT_ROOT_ERROR}: ${projectRootPath}`);

  return (requestedPath, absolutePath) => {
    const targetRealPath = resolveRealPath(absolutePath);
    const relativePath = relative(rootRealPath, targetRealPath);
    const outside =
      relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath);

    if (outside && !allowOutsideRoot)
      throw new Error(`${PLUGIN_NAME}: Refusing to read "${requestedPath}": outside root`);

    const matcherPath = toPosixPath(outside ? targetRealPath : relativePath);

    if (isSensitiveFile(matcherPath, denyFiles ?? defaultSensitiveFiles))
      throw new Error(`${PLUGIN_NAME}: Refusing to read "${requestedPath}": sensitive file`);
  };
};
