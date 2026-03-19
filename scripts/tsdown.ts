import type { UserConfig, CopyEntry } from "tsdown";
import { defineConfig } from "tsdown";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Tsdown options
 *
 * Tsdown 选项
 */
export interface TsdownOptions extends Omit<UserConfig, "entry" | "copy"> {
  cdn?: boolean;

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
   * Example:
   * 例如：
   * globals: {
   *   "markdown-it": "markdownit",
   * }
   */
  globals?: Record<string, string>;

  /**
   * Assets to never bundle
   *
   * 永远不打包的资源
   *
   * @description modules starting with `@temp/`, `@internal/` are never bundled.
   */
  neverBundle?: (string | RegExp)[];

  /**
   * Custom module side effects determination
   *
   * By default, only `.css` and `.scss` imports are considered to have side
   * effects. Use this to add additional side-effect patterns. This is part
   * of the `treeshake` option in tsdown/rolldown.
   *
   * 自定义模块副作用判定，默认仅保留 `.css` 和 `.scss` 导入的副作用。
   *
   * @param id - Module ID / 模块 ID
   * @param external - Whether the module is external / 模块是否为外部模块
   *
   * @default (id) => id.endsWith('.css') || id.endsWith('.scss')
   */
  moduleSideEffects?: (id: string, external: boolean) => boolean | undefined;

  /**
   * Additional files to copy to the output directory
   *
   * 要复制到输出目录的额外文件
   *
   * Each item is a tuple of [from, to], where 'from' is the source path relative to src, and 'to' is the destination path relative to the output directory. To can be omitted to copy to the same relative path in the output directory.
   * 每个项都是一个 [from, to] 的元组，其中 'from' 是相对于 src 目录的源路径，'to' 是相对于输出目录的目标路径。to 可以省略，表示复制到输出目录的相同相对路径。
   *
   * Example:
   * 例如：
   * copy: [
   *   ['assets/'], // Copy src/assets/ folder to dist/assets/
   *   ['types/global.d.ts', 'global.d.ts'], // Copy src/types/global.d.ts to dist/global.d.ts
   * ]
   */
  copy?: (string | CopyEntry)[];
}

/**
 * Create tsdown configuration
 *
 * 创建 tsdown 配置
 *
 * @param fileInfo - Entry options / 入口选项
 * @param options - Tsdown options / Tsdown 选项
 * @returns Tsdown configuration / Tsdown 配置
 */
export const tsdownConfig = (
  fileInfo: string | string[],
  {
    cdn = false,
    platform = cdn ? "browser" : "neutral",
    dts = !cdn,
    alwaysBundle = [],
    neverBundle = [],
    onlyBundle = false,
    treeshake = {},
    copy = [],
    publint = isProduction,
    globals = {},
    ...rest
  }: TsdownOptions = {},
): UserConfig => {
  const files = Array.isArray(fileInfo) ? fileInfo : [fileInfo];

  const alwaysBundleOptions = cdn ? [/^@mdit\//, /^markdown-it/, ...alwaysBundle] : alwaysBundle;

  return defineConfig({
    entry: Object.fromEntries(
      files.map((item) => [
        platform === "neutral"
          ? item
          : item === "index"
            ? cdn
              ? "cdn"
              : platform
            : `${item}-${cdn ? "cdn" : platform}`,
        `./src/${item}.ts`,
      ]),
    ),
    format: cdn ? "umd" : "esm",
    outDir: "./dist",
    sourcemap: true,
    dts,
    minify: isProduction,
    target:
      cdn || platform === "browser" ? ["chrome107", "edge107", "firefox104", "safari16"] : "node20",
    outputOptions: {
      globals,
    },
    platform: cdn ? "browser" : platform,
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
