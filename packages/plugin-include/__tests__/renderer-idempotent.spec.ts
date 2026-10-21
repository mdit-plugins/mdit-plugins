import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { IncludeEnv } from "../src/index.js";
import { include } from "../src/index.js";

describe("include renderer idempotency", () => {
  it("should resolve relative links and images once when rendering the same tokens twice", () => {
    const md = new MarkdownIt().use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
    });
    const env: IncludeEnv = { filePath: __filename };
    const tokens = md.parse("<!-- @include: ./__fixtures__/relative/includeLink.md -->\n", env);
    const expected = `<p><img src="./__fixtures__/relative/a.jpg" alt="Image1">
<a href="./__fixtures__/relative/a.md">Markdown</a></p>
`;

    const firstRender = md.renderer.render(tokens, md.options, env);
    const secondRender = md.renderer.render(tokens, md.options, env);

    expect(firstRender).toBe(expected);
    expect(secondRender).toBe(expected);
  });
});
