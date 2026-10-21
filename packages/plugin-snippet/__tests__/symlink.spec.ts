import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

import MarkdownIt from "markdown-it";
import { join } from "upath";
import { describe, expect, it } from "vitest";

import type { SnippetEnv } from "../src/index.js";
import { snippet } from "../src/index.js";

const md = new MarkdownIt({ html: true }).use(snippet, {
  currentPath: (env: SnippetEnv) => env.filePath as string,
});

// Creating symbolic links on Windows requires administrator privileges or
// developer mode, so these cases are skipped on Windows.
describe.skipIf(process.platform === "win32")("snippet symlink", () => {
  it("should follow a symbolic link to a file", () => {
    const dir = mkdtempSync(join(tmpdir(), "mdit-snippet-symlink-"));
    const targetPath = join(dir, "target.md");
    const linkPath = join(dir, "link.md");

    writeFileSync(targetPath, "# target content\n");
    symlinkSync(targetPath, linkPath);

    try {
      const env: SnippetEnv = {
        filePath: join(dir, "index.md"),
      };
      const rendered = md.render("<<< ./link.md", env);

      expect(rendered).toContain('<pre><code class="language-md">');
      expect(rendered).toContain("target content");
      expect(env.snippetFiles).toStrictEqual([linkPath]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should not follow a symbolic link to a directory", () => {
    const dir = mkdtempSync(join(tmpdir(), "mdit-snippet-symlink-dir-"));
    const targetPath = join(dir, "target");
    const linkPath = join(dir, "link.md");

    mkdirSync(targetPath);
    symlinkSync(targetPath, linkPath);

    try {
      const env: SnippetEnv = {
        filePath: join(dir, "index.md"),
      };
      const rendered = md.render("<<< ./link.md", env);

      expect(rendered).toContain("Unable to find snippet");
      expect(env.snippetFiles).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should report a dangling symbolic link as missing", () => {
    const dir = mkdtempSync(join(tmpdir(), "mdit-snippet-symlink-broken-"));
    const linkPath = join(dir, "link.md");

    symlinkSync(join(dir, "not-exist.md"), linkPath);

    try {
      const env: SnippetEnv = {
        filePath: join(dir, "index.md"),
      };
      const rendered = md.render("<<< ./link.md", env);

      expect(rendered).toContain("Unable to find snippet");
      expect(env.snippetFiles).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
