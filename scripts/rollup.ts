import { basename } from "node:path";
import { cwd } from "node:process";

import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import type { OutputOptions, PreRenderedChunk, RollupOptions } from "rollup";
import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const isProduction = process.env.NODE_ENV === "production";

export interface FileInfo {
  base: string;
  files: string[];
  target?: string;
}

export interface RollupTypescriptOptions {
  browser?: boolean;
  dts?: boolean;
  external?: (RegExp | string)[];
  dtsExternal?: (RegExp | string)[];
  alias?: Record<string, string>;
  output?: OutputOptions;
  inlineDynamicImports?: boolean;
  treeshake?: RollupOptions["treeshake"];
}

export const rollupTypescript = (
  filePath: string | FileInfo,
  {
    browser = false,
    dts: enableDts = !browser,
    external = [],
    dtsExternal = [],
    output = {},
    alias: aliasOptions,
    inlineDynamicImports = false,
    treeshake = { preset: "smallest" },
  }: RollupTypescriptOptions = {},
): RollupOptions[] =>
  defineConfig([
    {
      input:
        typeof filePath === "object"
          ? Object.fromEntries(
              filePath.files.map((item) => [
                item,
                `./src/${filePath.base ? `${filePath.base}/` : ""}${item}.ts`,
              ]),
            )
          : `./src/${filePath}.ts`,
      output: {
        ...(typeof filePath === "object"
          ? {
              dir: `./lib/${filePath.target ?? filePath.base}`,
              entryFileNames: (chunkInfo: PreRenderedChunk) =>
                browser
                  ? chunkInfo.name === "index"
                    ? "browser.js"
                    : `${chunkInfo.name}-browser.js`
                  : `${chunkInfo.name}.js`,
            }
          : {
              file: `./lib/${browser ? (filePath === "index" ? "browser" : `${filePath}-browser`) : filePath}.js`,
            }),
        format: "esm",
        sourcemap: true,
        exports: "named",
        inlineDynamicImports,
        ...output,
      },
      plugins: [
        aliasOptions ? alias({ entries: aliasOptions }) : [],
        browser ? [nodeResolve(), commonjs()] : [],
        esbuild({ charset: "utf8", minify: isProduction, target: "node20" }),
        process.env.CODECOV_TOKEN
          ? [
              codecovRollupPlugin({
                enableBundleAnalysis: true,
                bundleName: `${basename(cwd())}${browser ? "-browser" : ""}`,
                uploadToken: process.env.CODECOV_TOKEN,
                telemetry: false,
              }),
            ]
          : [],
      ],
      external: browser
        ? []
        : [/^node:/, /^@mdit\//, /^markdown-it/, ...external],
      treeshake,
    },
    ...(enableDts
      ? [
          defineConfig({
            input:
              typeof filePath === "object"
                ? Object.fromEntries(
                    filePath.files.map((item) => [
                      item,
                      `./src/${filePath.base ? `${filePath.base}/` : ""}${item}.ts`,
                    ]),
                  )
                : `./src/${filePath}.ts`,
            output: [
              {
                ...(typeof filePath === "object"
                  ? {
                      dir: `./lib/${filePath.target ?? filePath.base}`,
                      entryFileNames: "[name].d.ts",
                    }
                  : { file: `./lib/${filePath}.d.ts` }),

                format: "esm",
              },
            ],
            plugins: [
              dts({
                compilerOptions: {
                  preserveSymlinks: false,
                },
              }),
            ],
            external: dtsExternal,
            treeshake,
          }),
        ]
      : []),
  ]);
