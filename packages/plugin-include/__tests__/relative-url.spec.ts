import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import type { IncludeEnv } from "../src/index.js";
import { include } from "../src/index.js";

const createMd = (): MarkdownItType =>
  new MarkdownIt().use(include, {
    currentPath: (env: IncludeEnv) => env.filePath as string,
  });

const renderInclude = (file: string): string => {
  const md = createMd();
  const env: IncludeEnv = { filePath: __filename };

  return md.render(`<!-- @include: ./__fixtures__/relative/${file} -->\n`, env);
};

describe("relative urls", () => {
  it("should resolve bare relative image and link urls", () => {
    expect(renderInclude("includeBare.md"))
      .toBe(`<p><img src="./__fixtures__/relative/a.jpg" alt="Image1">
<img src="./__fixtures__/relative/sub/a.jpg" alt="Sub">
<a href="./__fixtures__/relative/a.md">Markdown</a></p>
`);
  });

  it("should keep query and hash suffixes when resolving", () => {
    expect(renderInclude("includeBareSuffix.md"))
      .toBe(`<p><img src="./__fixtures__/relative/a.jpg?raw=1" alt="Image1">
<a href="./__fixtures__/relative/a.md#section">Markdown</a></p>
`);
  });

  it("should not resolve anchors, absolute, external or query-only urls", () => {
    expect(renderInclude("includeExcluded.md")).toBe(`<p><a href="#section">Anchor</a>
<img src="/images/a.png" alt="Root">
<a href="https://example.com/a.png">External</a>
<a href="mailto:a@example.com">Mail</a>
<a href="?q=1">Query</a>
<img src="//example.com/a.png" alt="Protocol relative">
<img src="" alt=""></p>
`);
  });

  it("should stay idempotent when rendering the same tokens twice", () => {
    const md = createMd();
    const env: IncludeEnv = { filePath: __filename };
    const tokens = md.parse("<!-- @include: ./__fixtures__/relative/includeBare.md -->\n", env);

    const firstRender = md.renderer.render(tokens, md.options, env);
    const secondRender = md.renderer.render(tokens, md.options, env);

    expect(secondRender).toBe(firstRender);
    expect(firstRender).toContain('src="./__fixtures__/relative/a.jpg"');
    expect(firstRender).toContain('href="./__fixtures__/relative/a.md"');
  });
});
