import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance } from "markdown-it";
import { describe, expect, it } from "vitest";

import { demo } from "../packages/plugin-demo/src/index.js";
import { include } from "../packages/plugin-include/src/index.js";
import type { IncludeEnv } from "../packages/plugin-include/src/types.js";

const createMarkdown = (projectRoot: string): MarkdownItInstance =>
  new MarkdownIt({ html: true })
    .use(include, {
      currentPath: (env: IncludeEnv) => env.filePath as string,
      projectRoot,
    })
    .use(demo);

describe("demo + include integration", () => {
  it("should strip nonce-form include markers from the demo source", () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), "demo-include-"));

    try {
      writeFileSync(path.join(projectRoot, "included.md"), "# Included\n\n![image](./a.png)\n");

      const markdownIt = createMarkdown(projectRoot);
      const env: IncludeEnv = { filePath: path.join(projectRoot, "index.md") };
      const rendered = markdownIt.render("::: demo\n  <!-- @include: included.md -->\n:::\n", env);

      // the included document is rendered as the demo content, with its relative image resolved
      expect(rendered).toContain("<h1>Included</h1>");
      expect(rendered).toContain('src="./a.png"');

      // the displayed demo source keeps the directive but never leaks the internal include markers
      const codeSample = rendered.slice(
        rendered.indexOf('<pre><code class="language-md">'),
        rendered.indexOf("</code></pre>"),
      );

      // include expands before the demo rule runs, so the source shows the included content
      expect(codeSample).toContain("# Included");
      expect(codeSample).not.toContain("include-env");
    } finally {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});
