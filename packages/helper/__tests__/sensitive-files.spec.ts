import { describe, expect, it } from "vitest";

import { defaultSensitiveFiles, isSensitiveFile } from "../src/index.js";

describe("default sensitive files", () => {
  it("should contain the common sensitive file patterns", () => {
    expect(defaultSensitiveFiles).toStrictEqual(
      expect.arrayContaining([
        ".env",
        ".env.*",
        ".npmrc",
        ".netrc",
        ".git-credentials",
        "id_rsa*",
        "id_ed25519*",
        "*.pem",
        "*.key",
        "*.p12",
      ]),
    );
  });

  it("should contain directory patterns", () => {
    expect(defaultSensitiveFiles).toStrictEqual(
      expect.arrayContaining([
        ".git/**",
        ".ssh/**",
        ".aws/**",
        ".azure/**",
        ".kube/**",
        ".docker/config.json",
        "*.tfstate*",
      ]),
    );
  });
});

describe("sensitive file matching", () => {
  it("should match default patterns by path or basename", () => {
    expect(isSensitiveFile(".env")).toBe(true);
    expect(isSensitiveFile("nested/.env")).toBe(true);
    expect(isSensitiveFile(".env.local")).toBe(true);
    expect(isSensitiveFile("config/.env.production")).toBe(true);
    expect(isSensitiveFile(".npmrc")).toBe(true);
    expect(isSensitiveFile(".netrc")).toBe(true);
    expect(isSensitiveFile(".git-credentials")).toBe(true);
  });

  it("should match default key patterns", () => {
    expect(isSensitiveFile("id_rsa")).toBe(true);
    expect(isSensitiveFile("keys/id_rsa.pub")).toBe(true);
    expect(isSensitiveFile("id_ed25519")).toBe(true);
    expect(isSensitiveFile("cert.pem")).toBe(true);
    expect(isSensitiveFile("cert.key")).toBe(true);
    expect(isSensitiveFile("cert.p12")).toBe(true);
  });

  it("should match default directory patterns", () => {
    expect(isSensitiveFile(".git/config")).toBe(true);
    expect(isSensitiveFile("nested/.git/config")).toBe(true);
    expect(isSensitiveFile(".ssh/id_rsa")).toBe(true);
    expect(isSensitiveFile(".aws/credentials")).toBe(true);
    expect(isSensitiveFile(".azure/token")).toBe(true);
    expect(isSensitiveFile(".kube/config")).toBe(true);
    expect(isSensitiveFile(".docker/config.json")).toBe(true);
    expect(isSensitiveFile("nested/.docker/config.json")).toBe(true);
    expect(isSensitiveFile("terraform.tfstate.backup")).toBe(true);
  });

  it("should not match regular files", () => {
    expect(isSensitiveFile("README.md")).toBe(false);
    expect(isSensitiveFile("src/index.ts")).toBe(false);
    expect(isSensitiveFile("env.example")).toBe(false);
    expect(isSensitiveFile("mykey.txt")).toBe(false);
    expect(isSensitiveFile("")).toBe(false);
  });

  it("should support basename and whole path globs", () => {
    expect(isSensitiveFile("blocked.md", ["blocked.md"])).toBe(true);
    expect(isSensitiveFile("nested/blocked.md", ["blocked.md"])).toBe(true);
    expect(isSensitiveFile("nested/blocked.md", ["nested/blocked.md"])).toBe(true);
    expect(isSensitiveFile("blocked.md", ["nested/blocked.md"])).toBe(false);
  });

  it("should support single star and question mark globs", () => {
    expect(isSensitiveFile("src/a.ts", ["src/*.ts"])).toBe(true);
    expect(isSensitiveFile("src/sub/a.ts", ["src/*.ts"])).toBe(false);
    expect(isSensitiveFile("file1.md", ["file?.md"])).toBe(true);
    expect(isSensitiveFile("file12.md", ["file?.md"])).toBe(false);
    expect(isSensitiveFile("dir/file1.md", ["file?.md"])).toBe(true);
  });

  it("should support double star globs", () => {
    expect(isSensitiveFile("nested/blocked.md", ["nested/**/*.md"])).toBe(true);
    expect(isSensitiveFile("nested/deep/blocked.md", ["nested/**/*.md"])).toBe(true);
    expect(isSensitiveFile("nested/deep/file.txt", ["nested/**"])).toBe(true);
    expect(isSensitiveFile("other/deep/file.txt", ["nested/**"])).toBe(false);
    expect(isSensitiveFile("a/b", ["a/**/b"])).toBe(true);
    expect(isSensitiveFile("a/x/b", ["a/**/b"])).toBe(true);
    expect(isSensitiveFile("a/x/y/b", ["a/**/b"])).toBe(true);
  });

  it("should escape regexp special characters in globs", () => {
    expect(isSensitiveFile("a+b.md", ["a+b.md"])).toBe(true);
    expect(isSensitiveFile("aab.md", ["a+b.md"])).toBe(false);
    expect(isSensitiveFile("xenv", [".env"])).toBe(false);
    expect(isSensitiveFile("(name).md", ["(name).md"])).toBe(true);
  });

  it("should support RegExp patterns", () => {
    expect(isSensitiveFile("secret/file.txt", [/secret/])).toBe(true);
    expect(isSensitiveFile("dir/secret.txt", [/^secret/])).toBe(true);
    expect(isSensitiveFile("dir/public.txt", [/secret/])).toBe(false);
  });

  it("should reset lastIndex for global and sticky RegExp patterns", () => {
    const globalPattern = /secret/g;
    const anchoredGlobalPattern = /^secret/g;
    const stickyPattern = /secret/y;

    expect(isSensitiveFile("secret.txt", [globalPattern])).toBe(true);
    expect(isSensitiveFile("secret.txt", [globalPattern])).toBe(true);
    expect(isSensitiveFile("dir/secret.txt", [anchoredGlobalPattern])).toBe(true);
    expect(isSensitiveFile("dir/secret.txt", [anchoredGlobalPattern])).toBe(true);
    expect(isSensitiveFile("secret.txt", [stickyPattern])).toBe(true);
    expect(isSensitiveFile("secret.txt", [stickyPattern])).toBe(true);
  });

  it("should replace the default list with custom patterns", () => {
    expect(isSensitiveFile(".env", ["blocked.md"])).toBe(false);
    expect(isSensitiveFile("blocked.md", ["blocked.md"])).toBe(true);
    expect(isSensitiveFile(".env", [])).toBe(false);
  });

  it("should keep matching correctly when the same glob is checked repeatedly", () => {
    const patterns = ["blocked-*.md"];

    for (let index = 0; index < 3; index++) {
      expect(isSensitiveFile("blocked-a.md", patterns)).toBe(true);
      expect(isSensitiveFile("allowed-a.md", patterns)).toBe(false);
    }

    // another glob of the same shape must use its own compiled RegExp
    expect(isSensitiveFile("blocked-a.md", ["allowed-*.md"])).toBe(false);
    expect(isSensitiveFile("allowed-a.md", ["allowed-*.md"])).toBe(true);
  });

  it("should keep matching correctly when default patterns are checked repeatedly", () => {
    for (let index = 0; index < 3; index++) {
      expect(isSensitiveFile("src/index.ts")).toBe(false);
      expect(isSensitiveFile("nested/.env")).toBe(true);
      expect(isSensitiveFile(".ssh/id_rsa")).toBe(true);
    }
  });

  it("should not alter user-supplied RegExp patterns between repeated calls", () => {
    const globalPattern = /secret/g;

    for (let index = 0; index < 3; index++) {
      expect(isSensitiveFile("dir/secret.txt", [globalPattern])).toBe(true);
      expect(isSensitiveFile("dir/public.txt", [globalPattern])).toBe(false);
    }
  });
});
