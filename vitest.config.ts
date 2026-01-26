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
    },
    benchmark: {
      include: ["**/*.bench.ts"],
    },
    ...(process.env.CODECOV_TOKEN
      ? {
          reporters: ["junit"],
          outputFile: {
            junit: "coverage/test-report.junit.xml",
          },
        }
      : {}),
  },
});
