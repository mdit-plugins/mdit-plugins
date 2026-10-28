import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { join } from "upath";
import { describe, expect, it } from "vitest";

import type { IncludeEnv, MarkdownItIncludeOptions } from "../src/index.js";
import { defaultSensitiveFiles, handleInclude, include } from "../src/index.js";
import { createSecurityChecker } from "../src/security.js";

interface Fixture {
  base: string;
  root: string;
}

const createFixture = (): Fixture => {
  const base = mkdtempSync(join(tmpdir(), "include-security-"));
  const root = join(base, "root");

  mkdirSync(root);
  writeFileSync(join(root, "inside.md"), "inside content\n");
  writeFileSync(join(root, ".env"), "SECRET=1\n");
  writeFileSync(join(base, "outside.md"), "outside content\n");

  return { base, root };
};

const createMd = (options: Omit<MarkdownItIncludeOptions, "currentPath"> = {}): MarkdownItType =>
  new MarkdownIt({ html: true }).use(include, {
    currentPath: (env: IncludeEnv) => env.filePath as string,
    ...options,
  });

// oxlint-disable-next-line promise/prefer-await-to-callbacks
const getError = (callback: () => unknown): Error => {
  try {
    // oxlint-disable-next-line promise/prefer-await-to-callbacks
    callback();
  } catch (err) {
    return err as Error;
  }

  throw new Error("Expected an error to be thrown");
};

describe("include security", () => {
  it("should allow files inside projectRoot", () => {
    const { base, root } = createFixture();

    try {
      const md = createMd({ projectRoot: root });
      const env: IncludeEnv = { filePath: join(root, "index.md") };
      const rendered = md.render("<!-- @include: inside.md -->", env);

      expect(rendered).toContain("inside content");
      expect(env.includedFiles).toStrictEqual([join(root, "inside.md")]);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should allow missing files inside projectRoot", () => {
    const { base, root } = createFixture();

    try {
      const md = createMd({ projectRoot: root });
      const env: IncludeEnv = { filePath: join(root, "index.md") };
      const rendered = md.render("<!-- @include: missing.md -->", env);

      expect(rendered).toContain("File not found");
      expect(env.includedFiles).toStrictEqual([join(root, "missing.md")]);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should reject relative paths outside projectRoot", () => {
    const { base, root } = createFixture();

    try {
      const md = createMd({ projectRoot: root });
      const env: IncludeEnv = { filePath: join(root, "index.md") };
      const error = getError(() => md.render("<!-- @include: ../outside.md -->", env));

      expect(error.message).toContain("[@mdit/plugin-include]");
      expect(error.message).toContain("../outside.md");
      expect(error.message).toContain("outside root");
      expect(error.message).not.toContain(realpathSync(join(base, "outside.md")));
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should reject absolute paths outside projectRoot", () => {
    const { base, root } = createFixture();

    try {
      const md = createMd({ projectRoot: root });
      const env: IncludeEnv = { filePath: join(root, "index.md") };
      const outsidePath = join(base, "outside.md");
      const error = getError(() => md.render(`<!-- @include: ${outsidePath} -->`, env));

      expect(error.message).toContain(outsidePath);
      expect(error.message).toContain("outside root");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should reject the parent directory itself", () => {
    const { base, root } = createFixture();

    try {
      const checker = createSecurityChecker({ projectRoot: root });
      const error = getError(() => checker("..", base));

      expect(error.message).toContain('".."');
      expect(error.message).toContain("outside root");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should allow outside files when allowOutsideRoot is true", () => {
    const { base, root } = createFixture();

    try {
      const md = createMd({ projectRoot: root, allowOutsideRoot: true });
      const env: IncludeEnv = { filePath: join(root, "index.md") };
      const rendered = md.render("<!-- @include: ../outside.md -->", env);

      expect(rendered).toContain("outside content");
      expect(env.includedFiles).toStrictEqual([join(base, "outside.md")]);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should still reject sensitive files when allowOutsideRoot is true", () => {
    const { base, root } = createFixture();

    writeFileSync(join(base, ".env"), "SECRET=2\n");

    try {
      const md = createMd({ projectRoot: root, allowOutsideRoot: true });
      const env: IncludeEnv = { filePath: join(root, "index.md") };
      const error = getError(() => md.render("<!-- @include: ../.env -->", env));

      expect(error.message).toContain("../.env");
      expect(error.message).toContain("sensitive file");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  // Creating symbolic links on Windows requires administrator privileges or
  // developer mode, so this case is skipped on Windows.
  it.skipIf(process.platform === "win32")(
    "should reject symlinks pointing outside projectRoot without leaking the real path",
    () => {
      const { base, root } = createFixture();
      const targetPath = join(base, "secret.md");

      writeFileSync(targetPath, "secret content\n");
      symlinkSync(targetPath, join(root, "link.md"));

      try {
        const md = createMd({ projectRoot: root });
        const env: IncludeEnv = { filePath: join(root, "index.md") };
        const error = getError(() => md.render("<!-- @include: link.md -->", env));

        expect(error.message).toContain("link.md");
        expect(error.message).toContain("outside root");
        expect(error.message).not.toContain(realpathSync(targetPath));
      } finally {
        rmSync(base, { recursive: true, force: true });
      }
    },
  );

  it("should reject default sensitive files inside projectRoot", () => {
    const { base, root } = createFixture();

    try {
      const md = createMd({ projectRoot: root });
      const env: IncludeEnv = { filePath: join(root, "index.md") };
      const error = getError(() => md.render("<!-- @include: ./.env -->", env));

      expect(error.message).toContain(".env");
      expect(error.message).toContain("sensitive file");
      expect(error.message).not.toContain(realpathSync(join(root, ".env")));
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should replace the default deny list when denyFiles is provided", () => {
    const { base, root } = createFixture();

    writeFileSync(join(root, "blocked.md"), "blocked content\n");

    try {
      const md = createMd({ projectRoot: root, denyFiles: ["blocked.md"] });
      const dotEnvEnv: IncludeEnv = { filePath: join(root, "index.md") };
      const blockedEnv: IncludeEnv = { filePath: join(root, "index.md") };
      const error = getError(() => md.render("<!-- @include: blocked.md -->", blockedEnv));

      expect(md.render("<!-- @include: ./.env -->", dotEnvEnv)).toContain("SECRET=1");
      expect(error.message).toContain("blocked.md");
      expect(error.message).toContain("sensitive file");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should allow sensitive files when denyFiles is an empty array", () => {
    const { base, root } = createFixture();

    try {
      const md = createMd({ projectRoot: root, denyFiles: [] });
      const env: IncludeEnv = { filePath: join(root, "index.md") };

      expect(md.render("<!-- @include: ./.env -->", env)).toContain("SECRET=1");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should support RegExp denyFiles", () => {
    const { base, root } = createFixture();

    writeFileSync(join(root, "secret.md"), "secret content\n");

    try {
      const md = createMd({ projectRoot: root, denyFiles: [/secret/] });
      const dotEnvEnv: IncludeEnv = { filePath: join(root, "index.md") };
      const secretEnv: IncludeEnv = { filePath: join(root, "index.md") };
      const error = getError(() => md.render("<!-- @include: secret.md -->", secretEnv));

      expect(md.render("<!-- @include: ./.env -->", dotEnvEnv)).toContain("SECRET=1");
      expect(error.message).toContain("secret.md");
      expect(error.message).toContain("sensitive file");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should extend the default deny list when spreading defaultSensitiveFiles", () => {
    const { base, root } = createFixture();

    writeFileSync(join(root, "blocked.md"), "blocked content\n");

    try {
      const md = createMd({
        projectRoot: root,
        denyFiles: [...defaultSensitiveFiles, "blocked.md"],
      });
      const dotEnvEnv: IncludeEnv = { filePath: join(root, "index.md") };
      const blockedEnv: IncludeEnv = { filePath: join(root, "index.md") };

      expect(() => md.render("<!-- @include: ./.env -->", dotEnvEnv)).toThrow("sensitive file");
      expect(() => md.render("<!-- @include: blocked.md -->", blockedEnv)).toThrow(
        "sensitive file",
      );
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should reject deep includes escaping projectRoot", () => {
    const { base, root } = createFixture();

    writeFileSync(join(root, "nested.md"), "nested content\n<!-- @include: ../outside.md -->\n");

    try {
      const md = createMd({ projectRoot: root, deep: true });
      const env: IncludeEnv = { filePath: join(root, "index.md") };
      const error = getError(() => md.render("<!-- @include: nested.md -->", env));

      expect(error.message).toContain("../outside.md");
      expect(error.message).toContain("outside root");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should validate the resolved target of an alias", () => {
    const { base, root } = createFixture();

    try {
      const md = createMd({
        projectRoot: root,
        resolvePath: (filePath: string): string =>
          filePath.replace(/^@root/, root).replace(/^@outside/, base),
      });
      const insideEnv: IncludeEnv = { filePath: join(root, "index.md") };
      const outsideEnv: IncludeEnv = { filePath: join(root, "index.md") };
      const error = getError(() => md.render("<!-- @include: @outside/outside.md -->", outsideEnv));

      expect(md.render("<!-- @include: @root/inside.md -->", insideEnv)).toContain(
        "inside content",
      );
      expect(error.message).toContain("@outside/outside.md");
      expect(error.message).toContain("outside root");
      expect(error.message).not.toContain(join(base, "outside.md"));
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should throw when projectRoot does not exist", () => {
    const { base } = createFixture();

    try {
      expect(() => createMd({ projectRoot: join(base, "missing") })).toThrow(
        '"projectRoot" must be an existing directory',
      );
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should throw when projectRoot is not a directory", () => {
    const { base, root } = createFixture();

    try {
      expect(() => createMd({ projectRoot: join(root, "inside.md") })).toThrow(
        '"projectRoot" must be an existing directory',
      );
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("should use process.cwd() and the default deny list by default", () => {
    const checker = createSecurityChecker({});

    const cwd = process.cwd();

    expect(checker("package.json", join(cwd, "package.json"))).toBeUndefined();
    expect(() => checker(".env", join(cwd, ".env"))).toThrow("sensitive file");
  });

  it("should validate direct handleInclude calls with default security options", () => {
    const includedFiles: string[] = [];
    const result = handleInclude(
      { filePath: join(__dirname, "./__fixtures__/simpleInclude.md") },
      { cwd: null, includedFiles },
    );

    expect(result).toContain("ABC");
    expect(includedFiles).toHaveLength(1);
  });
});
