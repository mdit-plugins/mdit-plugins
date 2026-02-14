import type { UserConfig } from "tsdown";
import { defineConfig } from "tsdown";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Tsdown options
 *
 * Tsdown 选项
 */
export interface TsdownOptions {
  /**
   * Output type
   *
   * 输出类型
   *
   * @default "esm"
   */
  type?: "esm" | "cdn" | "node" | "browser";

  /**
   * Whether to generate dts files
   *
   * 是否生成 dts 文件
   *
   * @default !browser
   */
  dts?: boolean;

  /**
   * Alias options
   *
   * 别名选项
   */
  alias?: Record<string, string>;

  /**
   * Whether to tree shake
   *
   * 是否进行树摇
   *
   * @default true
   */
  treeshake?: UserConfig["treeshake"];

  /**
   * Packages not to treat as external
   *
   * 不作为外部处理的包
   */
  noExternal?: (string | RegExp)[];

  /**
   * Global name for UMD bundles
   *
   * UMD 包的全局变量名
   */
  globalName?: string;

  /**
   * External dependencies with their global names
   *
   * 外部依赖及其全局变量名映射
   */
  externals?: Record<string, string>;
}

/**
 * Create tsdown configuration
 *
 * 创建 tsdown 配置
 *
 * @param fileInfo - Entry file name or names (without extension) / 入口文件名或文件名列表（不带扩展名）
 * @param options - Tsdown options / Tsdown 选项
 * @returns Tsdown configuration / Tsdown 配置
 */
export const tsdownConfig = (
  fileInfo: string | string[],
  options: TsdownOptions = {},
): UserConfig => {
  const {
    type = "esm",
    dts = type !== "cdn",
    alias = {},
    noExternal: noExternalOptions = [],
    treeshake = {
      moduleSideEffects: false,
    },
    globalName,
    externals = {},
  } = options;
  const files = Array.isArray(fileInfo) ? fileInfo : [fileInfo];

  // For CDN builds, externalize specified dependencies, otherwise bundle @mdit and markdown-it
  const external =
    type === "cdn" && Object.keys(externals).length > 0 ? Object.keys(externals) : [];

  const noExternal =
    // bundle markdown-it and @mdit packages for cdn builds (unless externalized)
    type === "cdn" ? [/^@mdit\//, /^markdown-it/, ...noExternalOptions] : noExternalOptions;

  const hasExternals = type === "cdn" && Object.keys(externals).length > 0;

  // Using type assertion here to work around tsdown's strict type checking with conditional properties
  // The configuration is type-safe, but TypeScript's exactOptionalPropertyTypes makes it difficult
  // to conditionally include outputOptions without assertion
  return defineConfig({
    entry: Object.fromEntries(
      files.map((item) => [
        type === "esm" ? item : item === "index" ? type : `${item}-${type}`,
        `./src/${item}.ts`,
      ]),
    ),
    format: type === "cdn" ? "umd" : "esm",
    outDir: "./dist",
    sourcemap: true,
    dts,
    minify: isProduction,
    target:
      type === "cdn" || type === "browser"
        ? (["chrome107", "edge107", "firefox104", "safari16"] as string[])
        : "node20",
    platform: type === "cdn" || type === "browser" ? "browser" : "node",
    alias,
    treeshake,
    fixedExtension: false,
    inlineOnly: false,
    external,
    noExternal,
    globalName,
    ...(hasExternals
      ? {
          outputOptions: {
            globals: externals,
          },
        }
      : {}),
    publint: true,
  } as UserConfig);
};
