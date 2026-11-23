import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { field } from "../packages/plugin-field/src/index.js";
import type { IncludeEnv } from "../packages/plugin-include/src/index.js";
import { include } from "../packages/plugin-include/src/index.js";

// The field scanner hides the tokens before the first field. When the first field comes from an
// included file, the include markers must stay paired and the included file must still be the base
// for relative urls.

const createDir = (files: Record<string, string>): string => {
  const dir = mkdtempSync(path.join(tmpdir(), "mdit-field-include-"));

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
    .use(field);

const render = (dir: string, source: string): { rendered: string; errors: unknown[] } => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    const rendered = createMd(dir).render(source, { filePath: path.join(dir, "main.md") });

    return { rendered, errors: errorSpy.mock.calls };
  } finally {
    errorSpy.mockRestore();
  }
};

describe("field and include interop", () => {
  it("should keep include markers paired when the first field is included", () => {
    const dir = createDir({
      "sub/inc.md": "@`alpha`\n\n[alpha link](./a.md)\n",
    });
    const { errors, rendered } = render(
      dir,
      "::: fields\n<!-- @include: sub/inc.md -->\n\n@`beta`\n\nbeta content\n:::\n",
    );

    expect(errors).toStrictEqual([]);
    expect(rendered).toContain('<dt class="field-name" data-level="1">alpha</dt>');
    expect(rendered).toContain('<dt class="field-name" data-level="1">beta</dt>');
    // the included file is the base for relative urls, not the page
    expect(rendered).toContain('<a href="./sub/a.md">alpha link</a>');
  });

  it("should hide an include that ends before the first field without warnings", () => {
    const dir = createDir({
      "preamble.md": "preamble text\n\n![preamble](./p.png)\n",
    });
    const { errors, rendered } = render(
      dir,
      "::: fields\n<!-- @include: preamble.md -->\n\n@`beta`\n\nbeta content\n:::\n",
    );

    expect(errors).toStrictEqual([]);
    expect(rendered).not.toContain("preamble");
    expect(rendered).toContain('<dt class="field-name" data-level="1">beta</dt>');
  });

  it("should stay idempotent when rendering the same tokens twice", () => {
    const dir = createDir({
      "sub/inc.md": "@`alpha`\n\n[alpha link](./a.md)\n",
    });
    const md = createMd(dir);
    const env: IncludeEnv = { filePath: path.join(dir, "main.md") };
    const tokens = md.parse(
      "::: fields\n<!-- @include: sub/inc.md -->\n\n@`beta`\n\nbeta content\n:::\n",
      env,
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const firstRender = md.renderer.render(tokens, md.options, env);
      const secondRender = md.renderer.render(tokens, md.options, env);

      expect(firstRender).toBe(secondRender);
      expect(firstRender).toContain('<a href="./sub/a.md">alpha link</a>');
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });
});
