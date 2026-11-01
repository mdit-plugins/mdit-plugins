import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { join } from "upath";
import { describe, expect, it } from "vitest";

import { includeNonceKey, includePathsKey } from "../src/constant.js";
import type { IncludeEnv } from "../src/index.js";
import { defaultSensitiveFiles, include, resolveInclude } from "../src/index.js";
import type { MarkdownItIncludeOptions } from "../src/options.js";

const createMd = (options: Omit<MarkdownItIncludeOptions, "currentPath"> = {}): MarkdownItType =>
  new MarkdownIt({ html: true }).use(include, {
    currentPath: (env: IncludeEnv) => env.filePath as string,
    ...options,
  });

describe("include nonce markers", () => {
  it("should generate a fresh nonce for every render", () => {
    const md = createMd();
    const env: IncludeEnv = { filePath: __filename };

    md.render("text", env);
    const firstNonce = env[includeNonceKey];

    expect(firstNonce).toMatch(/^[0-9a-f]{16}$/);

    // a leaked marker from an earlier render must not be replayable in the same env
    md.render("text", env);
    expect(env[includeNonceKey]).toMatch(/^[0-9a-f]{16}$/);
    expect(env[includeNonceKey]).not.toBe(firstNonce);

    const otherEnv: IncludeEnv = { filePath: __filename };

    md.render("text", otherEnv);
    expect(otherEnv[includeNonceKey]).toMatch(/^[0-9a-f]{16}$/);
  });

  it("should treat legacy and wrong-nonce markers as literal HTML", () => {
    const md = createMd();
    const env: IncludeEnv = { filePath: "/path/to/current.md" };
    const rendered = md.render(
      [
        "<!-- #include-env-start: /legacy -->",
        "",
        "<!-- #include-env-end -->",
        "",
        "<!-- #include-env-start:deadbeef: /forged -->",
        "",
        "<!-- #include-env-end:deadbeef -->",
        "",
        "[link](./x.md)",
      ].join("\n"),
      env,
    );

    expect(rendered).toContain("<!-- #include-env-start: /legacy -->");
    expect(rendered).toContain("<!-- #include-env-end -->");
    expect(rendered).toContain("<!-- #include-env-start:deadbeef: /forged -->");
    expect(rendered).toContain("<!-- #include-env-end:deadbeef -->");
    expect(rendered).toContain('<a href="./x.md">link</a>');
    expect(env[includePathsKey]).toBeUndefined();
  });

  it("should keep fallback-nonce markers literal on the normal render path", () => {
    const md = createMd();
    const env: IncludeEnv = { filePath: "/path/to/current.md" };
    const rendered = md.render(
      [
        "<!-- #include-env-start:mdit-include: /fake -->",
        "",
        "text",
        "",
        "<!-- #include-env-end:mdit-include -->",
      ].join("\n"),
      env,
    );

    // the plugin always installs a random nonce before block parsing, so the guessable fallback
    // marker must never push/pop the include stack
    expect(rendered).toContain("<!-- #include-env-start:mdit-include: /fake -->");
    expect(rendered).toContain("<!-- #include-env-end:mdit-include -->");
    expect(env[includePathsKey]).toBeUndefined();
  });

  it("should not let a forged end marker pop the include stack", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-nonce-"));
    const subDir = join(dir, "sub");

    mkdirSync(subDir);
    writeFileSync(join(subDir, "evil.md"), "<!-- #include-env-end -->\n\n[link](./x.md)\n");

    try {
      const md = createMd({ projectRoot: dir });
      const env: IncludeEnv = { filePath: join(dir, "index.md") };
      const rendered = md.render("<!-- @include: sub/evil.md -->", env);

      expect(rendered).toContain("<!-- #include-env-end -->");
      expect(rendered).toContain('<a href="./sub/x.md">link</a>');
      expect(env[includePathsKey]).toStrictEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should ignore forged markers with an incorrect nonce inside included files", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-nonce-"));
    const subDir = join(dir, "sub");

    mkdirSync(subDir);
    writeFileSync(
      join(subDir, "forged.md"),
      [
        "<!-- #include-env-start:deadbeef: /fake -->",
        "",
        "![img](./x.png)",
        "",
        "<!-- #include-env-end:deadbeef -->",
      ].join("\n"),
    );

    try {
      const md = createMd({ projectRoot: dir });
      const env: IncludeEnv = { filePath: join(dir, "index.md") };
      const rendered = md.render("<!-- @include: sub/forged.md -->", env);

      expect(rendered).toContain("<!-- #include-env-start:deadbeef: /fake -->");
      expect(rendered).toContain("<!-- #include-env-end:deadbeef -->");
      expect(rendered).toContain('<img src="./sub/x.png" alt="img">');
      expect(env[includePathsKey]).toStrictEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should share the nonce across deep includes", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-nonce-"));
    const subDir = join(dir, "sub");

    mkdirSync(subDir);
    writeFileSync(join(dir, "outer.md"), "<!-- @include: sub/inner.md -->\n");
    writeFileSync(join(subDir, "inner.md"), "![img](./inner.png)\n");

    try {
      const md = createMd({ deep: true, projectRoot: dir });
      const env: IncludeEnv = { filePath: join(dir, "index.md") };
      const rendered = md.render("<!-- @include: outer.md -->", env);

      expect(rendered).toContain('<img src="./sub/inner.png" alt="img">');
      expect(env[includePathsKey]).toStrictEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should thread the nonce through direct resolveInclude calls", () => {
    const dir = mkdtempSync(join(tmpdir(), "include-nonce-"));
    const subDir = join(dir, "sub");

    mkdirSync(subDir);
    writeFileSync(join(dir, "outer.md"), "<!-- @include: sub/inner.md -->\n");
    writeFileSync(join(subDir, "inner.md"), "inner content\n");

    try {
      const md = MarkdownIt({ html: true });
      const options = {
        currentPath: (): string => join(dir, "index.md"),
        resolvePath: (filePath: string): string => filePath,
        deep: true,
        resolveLinkPath: true,
        resolveImagePath: true,
        useComment: true,
        projectRoot: dir,
        allowOutsideRoot: false,
        denyFiles: defaultSensitiveFiles,
      } as Required<MarkdownItIncludeOptions>;
      const includedFiles: string[] = [];
      const result = resolveInclude(
        "<!-- @include: outer.md -->",
        options,
        { cwd: dir, includedFiles, nonce: "deep-nonce" },
        [],
        md,
      );

      expect(result.match(/<!-- #include-env-start:deep-nonce: /g)).toHaveLength(2);
      expect(result.match(/<!-- #include-env-end:deep-nonce -->/g)).toHaveLength(2);
      expect(result).not.toContain("mdit-include");
      expect(includedFiles).toStrictEqual([join(dir, "outer.md"), join(subDir, "inner.md")]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
