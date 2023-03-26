import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { type RollupOptions } from "rollup";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const isProduction = process.env["NODE_ENV"] === "production";

export interface RollupTypescriptOptions {
  dts?: boolean;
  external?: (RegExp | string)[];
  dtsExternal?: (RegExp | string)[];
  resolve?: boolean;
  output?: Record<string, unknown>;
  inlineDynamicImports?: boolean;
}

export const rollupTypescript = (
  filePath: string,
  {
    dts: enableDts = true,
    external = [],
    dtsExternal = [],
    resolve = false,
    output = {},
    inlineDynamicImports = false,
  }: RollupTypescriptOptions = {}
): RollupOptions[] => [
  {
    input: `./src/${filePath}.ts`,
    output: [
      {
        file: `./lib/${filePath}.cjs`,
        format: "cjs",
        sourcemap: true,
        exports: "named",
        inlineDynamicImports,
        ...output,
      },
      {
        file: `./lib/${filePath}.mjs`,
        format: "esm",
        sourcemap: true,
        exports: "named",
        inlineDynamicImports,
        ...output,
      },
    ],
    plugins: [
      ...(resolve ? [nodeResolve({ preferBuiltins: true }), commonjs()] : []),
      esbuild({ charset: "utf8", minify: isProduction, target: "node14" }),
    ],
    external,
    treeshake: {
      preset: "smallest",
    },
  },
  ...(enableDts
    ? [
        <RollupOptions>{
          input: `./src/${filePath}.ts`,
          output: [
            { file: `./lib/${filePath}.d.ts`, format: "esm" },
            { file: `./lib/${filePath}.d.cts`, format: "esm" },
            { file: `./lib/${filePath}.d.mts`, format: "esm" },
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
        },
      ]
    : []),
];
