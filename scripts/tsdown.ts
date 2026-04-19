import type { UserConfig, CopyEntry } from "tsdown";
import { defineConfig } from "tsdown";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Tsdown options
 *
 * Tsdown 选项
 */
export interface TsdownOptions extends Omit<UserConfig, "entry" | "copy"> {
  /**
   * Global name for UMD bundles
   *
   * UMD 包的全局变量名
   */
  globalName?: string;

  /**
   * Whitelist of dependencies allowed to be bundled
   *
   * 允许被打包的依赖白名单
   *
   * @default false
   */
  onlyBundle?: (string | RegExp)[] | false;

  /**
   * Packages to always bundle
   *
   * 永远打包的包
   */
  alwaysBundle?: (string | RegExp)[];

  /**
   * Global variable names for external dependencies in UMD bundles
   *
   * UMD 包中外部依赖的全局变量名
   *
   * Example: 例如： globals: { "markdown-it": "markdownit", }
   */
  globals?: Record<string, string>;

  /**
   * Assets to never bundle
   *
   * 永远不打包的资源
   *
   * Modules starting with `@temp/`, `@internal/` are never bundled.
   */
  neverBundle?: (string | RegExp)[];

  /**
   * Additional files to copy to the output directory
   *
   * 要复制到输出目录的额外文件
   *
   * Each item is either a string (source path relative to src) or an copy entry object
   */
  copy?: (string | CopyEntry)[];
}

/**
 * Create tsdown configuration
 *
 * 创建 tsdown 配置
 *
 * @param fileInfo - Entry file(s) without extension, relative to src (e.g. "index" or ["index",
 *   "cli"])
 * @param options - Tsdown options / Tsdown 选项
 * @returns Tsdown configuration / Tsdown 配置
 */
export const tsdownConfig = (
  fileInfo: string | string[],
  {
    globalName,
    globals = {},
    platform = globalName ? "browser" : "neutral",
    dts = !globalName,
    alwaysBundle = [],
    neverBundle = [],
    onlyBundle = false,
    treeshake = {},
    copy = [],
    publint = isProduction,
    ...rest
  }: TsdownOptions = {},
): UserConfig => {
  const files = Array.isArray(fileInfo) ? fileInfo : [fileInfo];

  const alwaysBundleOptions = globalName
    ? [/^@mdit\//, /^markdown-it/, ...alwaysBundle]
    : alwaysBundle;

  return defineConfig({
    entry: Object.fromEntries(
      files.map((item) => [
        platform === "neutral"
          ? item
          : item === "index"
            ? globalName
              ? "cdn"
              : platform
            : `${item}-${globalName ? "cdn" : platform}`,
        `./src/${item}.ts`,
      ]),
    ),
    format: globalName ? "umd" : "esm",
    outDir: "./dist",
    sourcemap: true,
    dts,
    minify: isProduction,
    target:
      globalName || platform === "browser"
        ? ["chrome107", "edge107", "firefox104", "safari16"]
        : "node20",
    outputOptions: {
      globals,
    },
    globalName,
    platform: globalName ? "browser" : platform,
    treeshake,
    deps: {
      alwaysBundle: alwaysBundleOptions,
      neverBundle,
      onlyBundle,
    },
    copy: copy.map((item) => {
      if (typeof item === "string") {
        return {
          from: `./src/${item}`,
          flatten: false,
        };
      }

      return item;
    }),
    fixedExtension: false,
    publint,
    ...rest,
  });
};
