import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// `@mathjax/src` and `@mathjax/mathjax-newcm-font` are optional peer dependencies, so the built
// entries must not import them statically: a static import fails at load time
// (`ERR_MODULE_NOT_FOUND`) before the plugin can report its descriptive "not installed" error.
// Dynamic `import()` calls are fine: the source wraps them in `try`/`catch`.
const BUILT_ENTRIES = ["index.js", "worker.js", "async/index.js"] as const;

// Static imports, side-effect imports and re-exports all share this shape. Dynamic imports
// (`import("x")`, including template-literal specifiers) are deliberately not matched.
const STATIC_MATHJAX_IMPORT = /(?:\bfrom|\bimport)\s*["']@mathjax\//gu;

const findStaticMathjaxImports = (code: string): string[] =>
  code.match(STATIC_MATHJAX_IMPORT) ?? [];

const distEntryPath = (entry: string): URL => new URL(`../dist/${entry}`, import.meta.url);

// The entries have to be built: the guard inspects the shipped artifacts.
const assertEntriesAreBuilt = (): void => {
  for (const entry of BUILT_ENTRIES) {
    if (existsSync(fileURLToPath(distEntryPath(entry)))) continue;

    throw new Error(`dist/${entry} is missing. Run \`pnpm run build\` before running these tests.`);
  }
};

// oxlint-disable-next-line vitest/require-hook
assertEntriesAreBuilt();

describe("optional mathjax peers", () => {
  it.each([...BUILT_ENTRIES])("should not statically import @mathjax in dist/%s", (entry) => {
    const code = readFileSync(distEntryPath(entry), "utf8");

    expect(findStaticMathjaxImports(code)).toStrictEqual([]);
  });
});
