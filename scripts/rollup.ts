import type { RollupOptions } from "rollup";
import { dts } from "rollup-plugin-dts";
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
    output = {},
    inlineDynamicImports = false,
  }: RollupTypescriptOptions = {},
): RollupOptions[] => [
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
      esbuild({ charset: "utf8", minify: isProduction, target: "node18" }),
    ],
    external: [/^markdown-it/, ...external],
    treeshake: {
      preset: "smallest",
    },
  },
  ...(enableDts
    ? [
        {
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
        } as RollupOptions,
      ]
    : []),
];
