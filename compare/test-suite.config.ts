import path from "node:path";

import type { ViteUserConfigExport } from "vitest/config";
import { defineConfig } from "vitest/config";

/** Package directory under `packages/` that is being tested, e.g. `packages/plugin-dl` */
const pluginDir = process.env.COMPARE_PLUGIN_DIR;

/** Generated module that re-exports the reference implementation under the public export names */
const shimFile = process.env.COMPARE_SHIM;

if (!pluginDir || !shimFile) {
  throw new Error(
    "[compare] COMPARE_PLUGIN_DIR and COMPARE_SHIM must be set to run the test suite against a reference implementation.",
  );
}

/** Directory that contains the tests of the package under comparison */
const testsDir = path.resolve(import.meta.dirname, "..", pluginDir, "__tests__");

const config: ViteUserConfigExport = defineConfig({
  resolve: {
    alias: {
      "@deflate": path.resolve(
        import.meta.dirname,
        "../packages/plugin-plantuml/src/deflate/node.js",
      ),
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "temp/**"],
    fsModuleCache: true,
    pool: "threads",
    include: [`${pluginDir}/__tests__/**/*.spec.ts`],
  },
  plugins: [
    {
      name: "compare-swap-reference-implementation",
      enforce: "pre",
      resolveId(source: string, importer?: string) {
        if (!importer) return null;

        const importerPath = path.resolve(importer);

        if (!importerPath.startsWith(`${testsDir}${path.sep}`)) return null;

        // The tests import the package under test from `../src/index.js` (or `../src/plugin.js`);
        // every other source import is an internal helper and keeps using the current package.
        if (source === "../src/index.js" || source === "../src/plugin.js") return shimFile;

        return null;
      },
    },
  ],
});

export default config;
