import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@deflate": path.resolve(import.meta.dirname, "packages/plantuml/src/deflate/node.js"),
    },
  },
  test: {
    coverage: {
      provider: "istanbul",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["packages/plantuml/src/**/browser.ts"],
      reporter: process.env.TEST_REPORT ? ["cobertura", "text"] : ["text", "html"],
    },
    benchmark: {
      include: ["**/*.bench.ts"],
    },
    ...(process.env.TEST_REPORT
      ? {
          reporters: ["junit"],
          outputFile: {
            junit: "coverage/test-report.junit.xml",
          },
        }
      : {}),
  },
});
