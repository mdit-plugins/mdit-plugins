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
  filePath: string,
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
      input: `./src/${filePath}.ts`,
      output: [
        {
          file: `./lib/${filePath}.js`,
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
                bundleName: `${basename(cwd())}${resolve ? "-browser" : ""}`,
                uploadToken: process.env.CODECOV_TOKEN,
                telemetry: false,
              }),
            ]
          : [],
      ],
      external: resolve ? [] : [/^markdown-it/, ...external],
      treeshake: {
        preset: "smallest",
      },
    },
    ...(enableDts
      ? [
          defineConfig({
            input: `./src/${filePath}.ts`,
            output: [{ file: `./lib/${filePath}.d.ts`, format: "esm" }],
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
