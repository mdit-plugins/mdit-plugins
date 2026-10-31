import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

import type { BlockRule } from "@mdit/helper";
import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType, Token } from "markdown-it";
import { join } from "upath";
import { describe, expect, it, vi } from "vitest";

import type { SnippetEnv } from "../src/index.js";
import { snippet } from "../src/index.js";

const createMd = (projectRoot: string): MarkdownItType =>
  new MarkdownIt({ html: true }).use(snippet, {
    currentPath: (env: SnippetEnv) => env.filePath as string,
    projectRoot,
  });

const createFixture = (): { dir: string; filePath: string } => {
  const dir = mkdtempSync(join(tmpdir(), "snippet-silent-"));

  writeFileSync(join(dir, "snippet.js"), "const answer = 42;\n");

  return { dir, filePath: join(dir, "index.md") };
};

const getSnippetRule = (md: MarkdownItType): BlockRule => {
  const rule = md.block.ruler.__rules__.find(({ name }) => name === "snippet")?.fn;

  if (!rule) throw new Error("snippet block rule is not registered");

  return rule;
};

describe("snippet silent mode", () => {
  it("should not resolve paths, run security checks or emit tokens", () => {
    const { dir, filePath } = createFixture();

    try {
      const currentPath = vi.fn<(env: SnippetEnv) => string>((env) => env.filePath as string);
      const resolvePath = vi.fn<(path: string) => string>((path) => path);
      const md = new MarkdownIt({ html: true }).use(snippet, {
        currentPath,
        resolvePath,
        projectRoot: dir,
      });
      const env: SnippetEnv = { filePath };
      const tokens: Token[] = [];
      // This path escapes projectRoot: the real parse rejects it, while a silent
      // probe must only report the match and stay free of side effects.
      const state = new md.block.State("<<< ../outside.js", md, env, tokens);

      expect(getSnippetRule(md)(state, 0, 1, true)).toBe(true);
      expect(currentPath).not.toHaveBeenCalled();
      expect(resolvePath).not.toHaveBeenCalled();
      expect(state.line).toBe(0);
      expect(tokens).toHaveLength(0);

      expect(() => md.parse("<<< ../outside.js", env)).toThrow(/outside root/);
      expect(() => md.parse("<<< .env", env)).toThrow(/sensitive file/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should claim the same lines as the real parse", () => {
    const { dir, filePath } = createFixture();

    try {
      const md = createMd(dir);
      const sources = [
        "<<< snippet.js",
        "<<<snippet.js",
        "<<< snippet.js#region {}",
        "<<< snippet.js {js}",
        "<<<<",
        "<<<",
        "<< snippet.js",
        "< snippet.js",
        "text <<< snippet.js",
        "",
      ];

      const silentResults = sources.map((source) => {
        const state = new md.block.State(source, md, { filePath }, []);
        const result = getSnippetRule(md)(state, 0, 1, true);

        expect(state.line).toBe(0);
        expect(state.tokens).toHaveLength(0);

        return result;
      });

      const realResults = sources.map((source) => {
        const state = new md.block.State(source, md, { filePath }, []);
        return getSnippetRule(md)(state, 0, 1, false);
      });

      expect(silentResults).toStrictEqual(realResults);
      expect(realResults).toStrictEqual(sources.map((source) => source.startsWith("<<<")));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("should not duplicate tokens when another rule probes the snippet line", () => {
    const { dir, filePath } = createFixture();

    try {
      const md = createMd(dir);

      // The shipped registration does not add an `alt` termination chain, so stock
      // markdown-it never probes the snippet rule while ending a paragraph or
      // list. This test installs such a probe through the public Ruler API to
      // exercise the silent contract that a termination chain relies on.
      md.block.ruler.before(
        "paragraph",
        "snippet_probe",
        (state, startLine, endLine, silent) =>
          getSnippetRule(md)(state, startLine, endLine, silent),
        { alt: ["paragraph", "reference", "blockquote", "list"] },
      );

      const source = ["paragraph", "<<< snippet.js"].join("\n");
      const env: SnippetEnv = { filePath };
      const tokens = md.parse(source, env);

      expect(tokens.map(({ type }) => type)).toStrictEqual([
        "paragraph_open",
        "inline",
        "paragraph_close",
        "fence",
      ]);
      expect(tokens.filter(({ type }) => type === "fence")).toHaveLength(1);
      expect(md.renderer.render(tokens, md.options, env)).toBe(
        '<p>paragraph</p>\n<pre><code class="language-js">const answer = 42;\n</code></pre>\n',
      );
      expect(env.snippetFiles).toStrictEqual([join(dir, "snippet.js")]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
