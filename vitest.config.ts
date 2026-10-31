import path from "node:path";

import type { ViteUserConfigExport } from "vitest/config";
import { defineConfig } from "vitest/config";

const config: ViteUserConfigExport = defineConfig({
  resolve: {
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "packages/plugin-plantuml/src/deflate/node.js"),
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "temp/**"],
    fsModuleCache: true,
    pool: "threads",
    coverage: {
      provider: "istanbul",
      include: ["packages/*/src/**/*.ts"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
      reporter: process.env.TEST_REPORT ? ["cobertura", "text"] : ["text", "html"],
    },
    benchmark: {
      include: ["**/*.bench.ts"],
      exclude: ["**/node_modules/**", "**/dist/**", "temp/**"],
    },
    ...(process.env.TEST_REPORT
      ? {
          reporters: ["default", "junit"],
          outputFile: {
            junit: "coverage/test-report.junit.xml",
          },
        }
      : {}),
  },
});

export default config;
