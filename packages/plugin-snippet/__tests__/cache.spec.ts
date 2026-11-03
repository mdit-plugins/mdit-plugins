import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { join } from "upath";
import { describe, expect, it, vi } from "vitest";

import type { SnippetEnv } from "../src/index.js";
import { snippet } from "../src/index.js";

const fsCounts = vi.hoisted(() => ({
  readFileSync: 0,
  realpathSync: 0,
  statSync: 0,
}));

const resetFsCounts = (): void => {
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

const createMd = (projectRoot: string): MarkdownItType =>
  new MarkdownIt({ html: true }).use(snippet, {
    currentPath: (env: SnippetEnv) => env.filePath as string,
    projectRoot,
  });

const createFixture = (): { dir: string; filePath: string } => {
  const dir = mkdtempSync(join(tmpdir(), "snippet-cache-"));

  return { dir, filePath: join(dir, "index.md") };
};

describe("snippet render cache", () => {
  it("should read a repeated snippet only once per render", () => {
    const { dir, filePath } = createFixture();

    writeFileSync(join(dir, "snippet.js"), "const answer = 42;\n");

    try {
      const md = createMd(dir);
      const env: SnippetEnv = { filePath };

      resetFsCounts();

      const rendered = md.render(
        ["<<< snippet.js", "", "<<< snippet.js", "", "<<< snippet.js"].join("\n"),
        env,
      );

      expect(rendered.match(/const answer = 42;/g)).toHaveLength(3);
      expect(env.snippetFiles).toStrictEqual([
        join(dir, "snippet.js"),
        join(dir, "snippet.js"),
        join(dir, "snippet.js"),
      ]);
      expect(fsCounts.readFileSync).toBe(1);
      // the file state is revalidated for every occurrence
      expect(fsCounts.statSync).toBe(3);
      // the block rule and the fence renderer share the security verdict
      expect(fsCounts.realpathSync).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should cache extracted regions per file", () => {
    const { dir, filePath } = createFixture();

    writeFileSync(
      join(dir, "regions.js"),
      [
        "// #region target",
        "const target = 1;",
        "// #endregion target",
        "",
        "// #region other",
        "const other = 2;",
        "// #endregion other",
        "",
      ].join("\n"),
    );

    try {
      const md = createMd(dir);
      const env: SnippetEnv = { filePath };

      resetFsCounts();

      const rendered = md.render(
        ["<<< regions.js#target", "", "<<< regions.js#target", "", "<<< regions.js#other"].join(
          "\n",
        ),
        env,
      );

      expect(rendered.match(/const target = 1;/g)).toHaveLength(2);
      expect(rendered.match(/const other = 2;/g)).toHaveLength(1);
      expect(fsCounts.readFileSync).toBe(1);
      expect(fsCounts.realpathSync).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should cache a missing region fallback", () => {
    const { dir, filePath } = createFixture();

    writeFileSync(join(dir, "snippet.js"), "const answer = 42;\n");

    try {
      const md = createMd(dir);
      const env: SnippetEnv = { filePath };

      resetFsCounts();

      const rendered = md.render(
        ["<<< snippet.js#missing", "", "<<< snippet.js#missing"].join("\n"),
        env,
      );

      expect(rendered.match(/const answer = 42;/g)).toHaveLength(2);
      expect(fsCounts.readFileSync).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should re-read a snippet changed between renders even when the env is reused", () => {
    const { dir, filePath } = createFixture();
    const snippetPath = join(dir, "snippet.js");

    writeFileSync(snippetPath, "const before = 1;\n");

    try {
      const md = createMd(dir);
      const env: SnippetEnv = { filePath };

      resetFsCounts();

      expect(md.render("<<< snippet.js", env)).toContain("const before = 1;");

      // A different size guarantees the write is observable even on filesystems
      // with a coarse modification-time resolution.
      writeFileSync(snippetPath, "const after = 22;\n");

      const rendered = md.render("<<< snippet.js", env);

      expect(rendered).toContain("const after = 22;");
      expect(rendered).not.toContain("const before");
      expect(fsCounts.readFileSync).toBe(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should not cache missing files", () => {
    const { dir, filePath } = createFixture();
    const snippetPath = join(dir, "created-later.js");

    try {
      const md = createMd(dir);
      const env: SnippetEnv = { filePath };

      expect(md.render("<<< created-later.js", env)).toContain("Unable to find snippet");

      writeFileSync(snippetPath, "const created = true;\n");

      const rendered = md.render("<<< created-later.js", env);

      expect(rendered).toContain("const created = true;");
      expect(env.snippetFiles).toStrictEqual([snippetPath]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
