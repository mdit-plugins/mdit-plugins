import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { join } from "upath";
import { describe, expect, it, vi } from "vitest";

import type { IncludeEnv } from "../src/index.js";
import { include } from "../src/index.js";

const fsCounts = vi.hoisted(() => ({
  existsSync: 0,
  readFileSync: 0,
  realpathSync: 0,
  statSync: 0,
}));

const resetFsCounts = (): void => {
  fsCounts.existsSync = 0;
  fsCounts.readFileSync = 0;
  fsCounts.realpathSync = 0;
  fsCounts.statSync = 0;
};

// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock("node:fs", async (importOriginal) => {
  // oxlint-disable-next-line typescript/consistent-type-imports
  const actual = await importOriginal<typeof import("node:fs")>();

  return {
    ...actual,
    // oxlint-disable-next-line typescript/explicit-function-return-type
    existsSync: (...args: Parameters<typeof actual.existsSync>) => {
      fsCounts.existsSync++;

      return actual.existsSync(...args);
    },
    // oxlint-disable-next-line typescript/explicit-function-return-type
    readFileSync: (...args: Parameters<typeof actual.readFileSync>) => {
      fsCounts.readFileSync++;

      return actual.readFileSync(...args);
    },
    // oxlint-disable-next-line typescript/explicit-function-return-type
    realpathSync: (...args: Parameters<typeof actual.realpathSync>) => {
      fsCounts.realpathSync++;

      return actual.realpathSync(...args);
    },
    // oxlint-disable-next-line typescript/explicit-function-return-type
    statSync: (...args: Parameters<typeof actual.statSync>) => {
      fsCounts.statSync++;

      return actual.statSync(...args);
    },
  };
});

const createMd = (projectRoot: string, deep = false): MarkdownItType =>
  new MarkdownIt({ html: true }).use(include, {
    currentPath: (env: IncludeEnv) => env.filePath as string,
    deep,
    projectRoot,
  });

describe("include render cache", () => {
  it("should read a repeated include only once per render", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-cache-"));
    const filePath = join(dir, "a.md");

    writeFileSync(filePath, "line 1\nline 2\n");

    try {
      const md = createMd(dir);
      const env: IncludeEnv = { filePath: join(dir, "index.md") };

      resetFsCounts();

      const rendered = md.render("<!-- @include: a.md -->\n\n<!-- @include: a.md -->\n", env);

      expect(rendered).toBe("<p>line 1\nline 2</p>\n<p>line 1\nline 2</p>\n");
      expect(env.includedFiles).toStrictEqual([filePath, filePath]);
      expect(fsCounts.existsSync).toBe(1);
      expect(fsCounts.readFileSync).toBe(1);
      expect(fsCounts.statSync).toBe(1);
      // the second occurrence reuses the cached security verdict as well
      expect(fsCounts.realpathSync).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should share one file read between whole-file, region and line-range includes", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-cache-region-"));
    const filePath = join(dir, "regions.md");

    writeFileSync(
      filePath,
      [
        "// #region target",
        "target content",
        "// #endregion target",
        "",
        "// #region other",
        "other content",
        "// #endregion other",
        "",
      ].join("\n"),
    );

    try {
      const md = createMd(dir);
      const env: IncludeEnv = { filePath: join(dir, "index.md") };

      resetFsCounts();

      const rendered = md.render(
        [
          "<!-- @include: regions.md#target -->",
          "",
          "<!-- @include: regions.md#target -->",
          "",
          "<!-- @include: regions.md#other -->",
          "",
          "<!-- @include: regions.md{5-6} -->",
          "",
          "<!-- @include: regions.md -->",
        ].join("\n"),
        env,
      );

      expect(rendered.match(/target content/g)).toHaveLength(3);
      expect(rendered).toContain("other content");
      expect(fsCounts.existsSync).toBe(1);
      expect(fsCounts.readFileSync).toBe(1);
      expect(fsCounts.statSync).toBe(1);
      expect(fsCounts.realpathSync).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should re-read a file changed between renders even when the env is reused", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-cache-refresh-"));
    const filePath = join(dir, "a.md");

    writeFileSync(filePath, "before\n");

    try {
      const md = createMd(dir);
      const env: IncludeEnv = { filePath: join(dir, "index.md") };

      resetFsCounts();

      expect(md.render("<!-- @include: a.md -->", env)).toContain("before");

      // A different size guarantees the write is observable even on filesystems
      // with a coarse modification-time resolution.
      writeFileSync(filePath, "after the change\n");

      const rendered = md.render("<!-- @include: a.md -->", env);

      expect(rendered).toContain("after the change");
      expect(rendered).not.toContain("before");
      expect(env.includedFiles).toStrictEqual([filePath, filePath]);
      expect(fsCounts.readFileSync).toBe(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should strip a BOM and normalize CRLF once for repeated includes", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-cache-crlf-"));
    const filePath = join(dir, "crlf.md");

    writeFileSync(filePath, "\uFEFFline 1\r\nline 2\r\n");

    try {
      const md = createMd(dir);
      const env: IncludeEnv = { filePath: join(dir, "index.md") };

      resetFsCounts();

      const rendered = md.render("<!-- @include: crlf.md -->\n\n<!-- @include: crlf.md -->\n", env);

      expect(rendered).not.toContain("\r");
      expect(rendered.match(/line 1\s+line 2/g)).toHaveLength(2);
      expect(fsCounts.readFileSync).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should reuse cached files while expanding deep includes", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-cache-deep-"));
    const outerPath = join(dir, "outer.md");
    const innerPath = join(dir, "inner.md");

    writeFileSync(outerPath, "outer content\n<!-- @include: inner.md -->\n");
    writeFileSync(innerPath, "inner content\n");

    try {
      const md = createMd(dir, true);
      const env: IncludeEnv = { filePath: join(dir, "index.md") };

      resetFsCounts();

      const rendered = md.render(
        "<!-- @include: outer.md -->\n\n<!-- @include: outer.md -->\n",
        env,
      );

      expect(rendered.match(/outer content/g)).toHaveLength(2);
      expect(rendered.match(/inner content/g)).toHaveLength(2);
      expect(env.includedFiles).toStrictEqual([outerPath, innerPath, outerPath, innerPath]);
      // one read for each file for the whole render
      expect(fsCounts.readFileSync).toBe(2);
      expect(fsCounts.existsSync).toBe(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// A directory include is never cached and keeps reporting "File not found".
describe("include render cache directories", () => {
  it("should not cache directories", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-cache-dir-"));

    mkdirSync(join(dir, "dir.md"));

    try {
      const md = createMd(dir);
      const env: IncludeEnv = { filePath: join(dir, "index.md") };

      resetFsCounts();

      const rendered = md.render("<!-- @include: dir.md -->\n\n<!-- @include: dir.md -->\n", env);

      expect(rendered.match(/File not found/g)).toHaveLength(2);
      expect(fsCounts.readFileSync).toBe(0);
      expect(fsCounts.existsSync).toBe(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
