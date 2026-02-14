import path from "node:path";

import type { ViteUserConfigExport } from "vitest/config";
import { defineConfig } from "vitest/config";

const config: ViteUserConfigExport = defineConfig({
  resolve: {
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "packages/plantuml/src/deflate/node.js"),
    },
  },
  test: {
    coverage: {
      provider: "istanbul",
      include: ["packages/*/src/**/*.ts"],
      reporter: process.env.TEST_REPORT ? ["cobertura", "text"] : ["text", "html"],
    },
    benchmark: {
      include: ["**/*.bench.ts"],
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
