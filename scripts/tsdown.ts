import { basename } from "node:path";
import { cwd } from "node:process";

import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import type { UserConfig } from "tsdown";
import { defineConfig } from "tsdown";

const isProduction = process.env.NODE_ENV === "production";

/**
 * File information
 *
 * 文件信息
 */
export interface FileInfo {
  /**
   * Base directory
   *
   * 基础目录
   */
  base: string;

  /**
   * Files to bundle
   *
   * 待打包的文件
   */
  files: string[];

  /**
   * Target directory
   *
   * 目标目录
   */
  target?: string;
}

/**
 * Tsdown options
 *
 * Tsdown 选项
 */
export interface TsdownOptions {
  /**
   * Whether it's a browser build
   *
   * 是否为浏览器构建
   *
   * @default false
   */
  browser?: boolean;

  /**
   * Whether to generate dts files
   *
   * 是否生成 dts 文件
   *
   * @default !browser
   */
  dts?: boolean;

  /**
   * External dependencies
   *
   * 外部依赖
   *
   * @default []
   */
  external?: (RegExp | string)[];

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
   * Inline options
   *
   * 内联选项
   *
   * @default browser ? false : undefined
   */
  inlineOnly?: UserConfig["inlineOnly"];
}

/**
 * Create tsdown configuration
 *
 * 创建 tsdown 配置
 *
 * @param filePath - File path or file info / 文件路径或文件信息
 * @param options - Tsdown options / Tsdown 选项
 * @returns Tsdown configuration / Tsdown 配置
 */
export const tsdownConfig = (
  filePath: string | FileInfo,
  options: TsdownOptions = {},
): UserConfig => {
  const {
    browser = false,
    dts = !browser,
    external = [],
    alias: aliasOptions,
    treeshake = true,
    inlineOnly = browser ? false : undefined,
  } = options;
  const isObject = typeof filePath === "object";
  const base = isObject ? (filePath.base ? `${filePath.base}/` : "") : "";
  const files = isObject ? filePath.files : [filePath];
  const targetDir = isObject ? (filePath.target ?? filePath.base) : "";

  return defineConfig({
    entry: Object.fromEntries(
      files.map((item) => [
        browser ? (item === "index" ? "browser" : `${item}-browser`) : item,
        `./src/${base}${item}.ts`,
      ]),
    ),
    format: "esm",
    outDir: `./lib${targetDir ? `/${targetDir}` : ""}`,
    sourcemap: true,
    dts,
    minify: isProduction,
    target: "node20",
    platform: browser ? "browser" : "node",
    external: browser ? [] : [/^node:/, /^@mdit\//, /^markdown-it/, ...external],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    inlineOnly: inlineOnly!,
    ...(aliasOptions ? { alias: aliasOptions } : {}),
    treeshake,
    fixedExtension: false,
    plugins: [
      process.env.CODECOV_TOKEN
        ? codecovRollupPlugin({
            enableBundleAnalysis: true,
            bundleName: `${basename(cwd())}${browser ? "-browser" : ""}`,
            uploadToken: process.env.CODECOV_TOKEN,
            telemetry: false,
          })
        : null,
    ].filter((item) => item !== null) as UserConfig["plugins"],
    clean: false,
  });
};
