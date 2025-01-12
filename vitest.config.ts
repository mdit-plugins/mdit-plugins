import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      include: ["packages/*/src/**/*.ts"],
    },
    include: ["**/*.spec.ts"],
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
