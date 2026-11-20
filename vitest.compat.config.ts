import { createRequire } from "node:module";
import path from "node:path";

import type { ViteUserConfigExport } from "vitest/config";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

/**
 * Replaces `markdown-it` with `markdown-exit` for every test file.
 *
 * The regex is anchored so that upstream packages such as `markdown-it-attrs` are not rewritten.
 */
const config: ViteUserConfigExport = defineConfig({
  resolve: {
    alias: [
      {
        find: "@deflate",
        replacement: path.resolve(
          import.meta.dirname,
          "packages/plugin-plantuml/src/deflate/node.js",
        ),
      },
      {
        find: /^markdown-it$/u,
        replacement: require.resolve("markdown-exit"),
      },
    ],
  },
  test: {
    // Mirrors the root test settings instead of inheriting them, so coverage and reporting options
    // never leak into the compatibility run. Keep in sync with `vitest.config.ts`.
    exclude: ["**/.agents/**", "**/node_modules/**", "**/dist/**", "temp/**"],
    fsModuleCache: true,
    pool: "threads",
  },
});

export default config;
