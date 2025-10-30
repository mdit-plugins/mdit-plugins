import { basename } from "node:path";
import { cwd } from "node:process";

import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import type { OutputOptions, RollupOptions } from "rollup";
import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const isProduction = process.env.NODE_ENV === "production";

export interface RollupTypescriptOptions {
  dts?: boolean;
  external?: (RegExp | string)[] | false;
  dtsExternal?: (RegExp | string)[];
  alias?: Record<string, string>;
  output?: OutputOptions;
  inlineDynamicImports?: boolean;
  treeshake?: RollupOptions["treeshake"];
}

export const rollupTypescript = (
  filePath: string,
  {
    dts: enableDts = true,
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
      input: `./src/${filePath}.ts`,
      output: {
        file: `./lib/${filePath}.js`,
        format: "esm",
        sourcemap: true,
        exports: "named",
        inlineDynamicImports,
        ...output,
      },
      plugins: [
        aliasOptions ? alias({ entries: aliasOptions }) : [],
        external ? [] : [nodeResolve(), commonjs()],
        esbuild({ charset: "utf8", minify: isProduction, target: "node20" }),
        process.env.CODECOV_TOKEN
          ? [
              codecovRollupPlugin({
                enableBundleAnalysis: true,
                bundleName: `${basename(cwd())}${external ? "" : "-browser"}`,
                uploadToken: process.env.CODECOV_TOKEN,
                telemetry: false,
              }),
            ]
          : [],
      ],
      external: external
        ? [/^node:/, /^@mdit\//, /^markdown-it/, ...external]
        : [],
      treeshake,
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
            treeshake,
          }),
        ]
      : []),
  ]);
