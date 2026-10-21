import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const packagesDir = path.join(repoRoot, "packages");

/** Source directories of the plugin packages */
const sourceDirectories = readdirSync(packagesDir)
  .map((name) => path.join(packagesDir, name, "src"))
  .filter((dir) => existsSync(dir) && statSync(dir).isDirectory());

/**
 * Recursively collect TypeScript source files under a directory
 *
 * @param dir Directory to scan
 * @returns Absolute paths of TypeScript source files
 */
const collectSourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const filePath = path.join(dir, name);

    if (statSync(filePath).isDirectory()) return collectSourceFiles(filePath);

    return name.endsWith(".ts") ? [filePath] : [];
  });

/**
 * Check whether an import/export clause only references types
 *
 * @param clause Clause between the keyword and `from`
 * @returns Whether the clause is type-only
 */
const isTypeOnlyClause = (clause: string): boolean => {
  const trimmedClause = clause.trim();

  if (trimmedClause.startsWith("type ")) return true;

  if (!trimmedClause.startsWith("{")) return false;

  const specifierSource = trimmedClause.slice(1, trimmedClause.lastIndexOf("}"));

  return specifierSource
    .split(",")
    .map((specifier) => specifier.trim())
    .filter(Boolean)
    .every((specifier) => specifier.startsWith("type "));
};

/**
 * Find runtime imports of the peer package in a source file
 *
 * @param source Source file content
 * @returns Matched statements that import the peer package at runtime
 */
const findRuntimeImports = (source: string): string[] => {
  const statements: string[] = [];

  for (const match of source.matchAll(
    /(?:^|\n)[ \t]*(?:import|export)\s+(?<clause>[^;]*?)\s*from\s+["']markdown-it["']/g,
  ))
    if (!isTypeOnlyClause(match.groups?.clause ?? "")) statements.push(match[0].trim());

  for (const match of source.matchAll(/(?:^|\n)[ \t]*import\s+["']markdown-it["']/g))
    statements.push(match[0].trim());

  for (const match of source.matchAll(/\bimport\s*\(\s*["']markdown-it["']\s*\)/g))
    statements.push(match[0].trim());

  return statements;
};

describe("packaging", () => {
  it("should not import markdown-it at runtime from plugin sources", () => {
    const sourceFiles = sourceDirectories.flatMap((dir) => collectSourceFiles(dir));

    expect(sourceFiles.length).toBeGreaterThan(0);

    const violations = sourceFiles.flatMap((filePath) =>
      findRuntimeImports(readFileSync(filePath, "utf8")).map(
        (statement) => `${path.relative(repoRoot, filePath)}: ${statement}`,
      ),
    );

    expect(violations).toStrictEqual([]);
  });

  it("should allow type-only imports of markdown-it", () => {
    expect(isTypeOnlyClause("type { Token }")).toBe(true);
    expect(isTypeOnlyClause("{ type Token, type RendererRule }")).toBe(true);
    expect(isTypeOnlyClause("MarkdownIt")).toBe(false);
    expect(isTypeOnlyClause("{ Token, type RendererRule }")).toBe(false);
    expect(isTypeOnlyClause("{ Token }")).toBe(false);
  });

  it("should detect runtime imports of markdown-it", () => {
    expect(findRuntimeImports(`import MarkdownIt from "markdown-it";`)).toStrictEqual([
      `import MarkdownIt from "markdown-it"`,
    ]);
    expect(findRuntimeImports(`import type { Token } from "markdown-it";`)).toStrictEqual([]);
    expect(findRuntimeImports(`import { type Token } from "markdown-it";`)).toStrictEqual([]);
    expect(findRuntimeImports(`import "markdown-it";`)).toStrictEqual([`import "markdown-it"`]);
    expect(findRuntimeImports(`const md = await import("markdown-it");`)).toStrictEqual([
      `import("markdown-it")`,
    ]);
  });
});
