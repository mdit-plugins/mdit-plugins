import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it, onTestFinished } from "vitest";

import { alert } from "../packages/plugin-alert/src/index.js";
import type { IncludeEnv } from "../packages/plugin-include/src/index.js";
import { include } from "../packages/plugin-include/src/index.js";

// Include markers are transparent containers: their nesting keeps the paired markers balanced
// when a token filter drops the surrounding content, but the included content must stay at the
// level of the surrounding block so rules with absolute level checks (e.g. alerts) still apply.

const createDir = (files: Record<string, string>): string => {
  const dir = mkdtempSync(path.join(tmpdir(), "mdit-include-level-"));

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
    .use(alert);

const render = (md: MarkdownItType, dir: string, source: string): string =>
  md.render(source, { filePath: path.join(dir, "main.md") });

describe("include block level", () => {
  it("should render top-level blocks of an included file at the surrounding level", () => {
    const dir = createDir({
      "inc.md": "> [!note]\n> included alert\n",
    });
    const md = createMd(dir);
    const source = "<!-- @include: inc.md -->\n";

    const tokens = md.parse(source, { filePath: path.join(dir, "main.md") });
    const alertToken = tokens.find((token) => token.type === "alert_open");

    expect(alertToken?.level).toBe(0);
    expect(render(md, dir, source)).toContain('<div class="markdown-alert markdown-alert-note">');
  });

  it("should not shift the level of blocks after the include", () => {
    const dir = createDir({
      "inc.md": "included paragraph\n",
    });
    const md = createMd(dir);

    expect(render(md, dir, "<!-- @include: inc.md -->\n\n> [!note]\n> after alert\n")).toContain(
      '<div class="markdown-alert markdown-alert-note">',
    );
  });
});
