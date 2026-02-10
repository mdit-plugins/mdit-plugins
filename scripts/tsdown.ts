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
  } = options;
  const files = Array.isArray(fileInfo) ? fileInfo : [fileInfo];
  const noExternal =
    // bundle markdown-it and @mdit packages for cdn builds
    type === "cdn" ? [/^@mdit\//, /^markdown-it/, ...noExternalOptions] : noExternalOptions;

  return defineConfig({
    entry: Object.fromEntries(
      files.map((item) => [
        type === "esm" ? item : item === "index" ? type : `${item}-${type}`,
        `./src/${item}.ts`,
      ]),
    ),
    format: "esm",
    outDir: "./dist",
    sourcemap: true,
    dts,
    minify: isProduction,
    target:
      type === "cdn" || type === "browser"
        ? ["chrome107", "edge107", "firefox104", "safari16"]
        : "node20",
    platform: type === "cdn" || type === "browser" ? "browser" : "node",
    alias,
    treeshake,
    fixedExtension: false,
    inlineOnly: false,
    noExternal,
    publint: true,
  });
};
