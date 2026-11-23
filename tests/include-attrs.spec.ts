import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it, onTestFinished } from "vitest";

import { attrs } from "../packages/plugin-attrs/src/index.js";
import type { IncludeEnv } from "../packages/plugin-include/src/index.js";
import { include } from "../packages/plugin-include/src/index.js";

// The include end marker is a token with nesting -1, but it is not a block container. Attribute
// rules that walk over consecutive closing tokens must stop at it and keep applying the
// attributes to the real container of the included block.

const createDir = (files: Record<string, string>): string => {
  const dir = mkdtempSync(path.join(tmpdir(), "mdit-include-attrs-"));

  onTestFinished(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), content);
  }

  return dir;
};

const createMd = (dir: string): MarkdownItType =>
  new MarkdownIt({ html: true })
    .use(include, {
      currentPath: (env: IncludeEnv) => (typeof env.filePath === "string" ? env.filePath : ""),
      projectRoot: dir,
    })
    .use(attrs);

const render = (md: MarkdownItType, dir: string, source: string): string =>
  md.render(source, { filePath: path.join(dir, "main.md") });

describe("include and attrs interop", () => {
  it("should apply attributes written at the end of an included file to its block", () => {
    const dir = createDir({
      "inc.md": "tail text\n{.red}\n",
    });

    expect(render(createMd(dir), dir, "<!-- @include: inc.md -->\n")).toBe(
      '<p class="red">tail text</p>\n',
    );
  });

  it("should apply attributes to a blockquote at the end of an included file", () => {
    const dir = createDir({
      "inc.md": "> quoted text\n> {.quote}\n",
    });

    expect(render(createMd(dir), dir, "<!-- @include: inc.md -->\n")).toBe(
      '<blockquote class="quote">\n<p>quoted text</p>\n</blockquote>\n',
    );
  });
});
