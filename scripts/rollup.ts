import { basename } from "node:path";
import { cwd } from "node:process";

import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import type { RollupOptions } from "rollup";
import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const isProduction = process.env.NODE_ENV === "production";

export interface FileInfo {
  base?: string;
  files: string[];
  target?: string;
}

export interface RollupTypescriptOptions {
  dts?: boolean;
  external?: (RegExp | string)[];
  dtsExternal?: (RegExp | string)[];
  resolve?: boolean;
  alias?: Record<string, string>;
  output?: Record<string, unknown>;
  inlineDynamicImports?: boolean;
}

export const rollupTypescript = (
  filePath: string | FileInfo,
  {
    dts: enableDts = true,
    external = [],
    dtsExternal = [],
    output = {},
    resolve = false,
    alias: aliasOptions,
    inlineDynamicImports = false,
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

      output: [
        {
          ...(typeof filePath === "object"
            ? {
                dir: `./lib/${filePath.target ?? filePath.base ?? ""}`,
                entryFileNames: "[name].js",
              }
            : { file: `./lib/${filePath}.js` }),
          format: "esm",
          sourcemap: true,
          exports: "named",
          inlineDynamicImports,
          ...output,
        },
      ],

      plugins: [
        aliasOptions
          ? alias({
              entries: aliasOptions,
            })
          : [],
        resolve ? [commonjs(), nodeResolve()] : [],
        esbuild({ charset: "utf8", minify: isProduction, target: "node20" }),
        process.env.CODECOV_TOKEN
          ? [
              codecovRollupPlugin({
                enableBundleAnalysis: true,
                bundleName: basename(cwd()),
                uploadToken: process.env.CODECOV_TOKEN,
              }),
            ]
          : [],
      ],
      external: [/^markdown-it/, ...external],
      treeshake: {
        preset: "smallest",
      },
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
                      dir: `./lib/${filePath.target ?? filePath.base ?? ""}`,
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
            treeshake: {
              preset: "smallest",
            },
          }),
        ]
      : []),
  ]);
