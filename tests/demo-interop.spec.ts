import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { escapeHtml } from "../packages/helper/src/index.js";
import { alert } from "../packages/plugin-alert/src/index.js";
import { container } from "../packages/plugin-container/src/index.js";
import { demo } from "../packages/plugin-demo/src/index.js";
import { include } from "../packages/plugin-include/src/plugin.js";

describe("demo interop", () => {
  it("should work with alert", () => {
    const alertContent = `\
> [!caution]
> Caution text\
`;

    const markdownItAlert = new MarkdownIt({ linkify: true }).use(alert, { deep: true }).use(demo);

    expect(
      markdownItAlert.render(`
::: demo Title text
${alertContent}
:::
`),
    ).toBe(
      `\
<details><summary>Title text</summary>
<div class="demo-content">
<div class="markdown-alert markdown-alert-caution">
<p class="markdown-alert-title">Caution</p>
<p>Caution text</p>
</div>
</div>
<pre><code class="language-md">${escapeHtml(alertContent)}
</code></pre>
</details>
`,
    );
  });

  it("should work with include", () => {
    const importContent = `\
<!-- @include: ../packages/plugin-include/__tests__/__fixtures__/simpleInclude.md -->
`;

    const markdownItInclude = new MarkdownIt({ linkify: true })
      .use(include, {
        currentPath: () => __filename,
      })
      .use(demo);

    const result1 = markdownItInclude.render(`
::: demo Title text
${importContent}
:::
`);

    const result2 = markdownItInclude.render(`
::: demo Title text

${importContent}

:::
`);

    expect(result1).toMatch(
      `\
<details><summary>Title text</summary>
<div class="demo-content">
<h1>ABC</h1>
<p>DEF</p>
</div>
<pre><code class="language-md"># ABC

DEF
</code></pre>
</details>
`,
    );

    expect(result2).toMatch(
      `\
<details><summary>Title text</summary>
<div class="demo-content">
<h1>ABC</h1>
<p>DEF</p>
</div>
<pre><code class="language-md"># ABC

DEF
</code></pre>
</details>
`,
    );
  });

  it("should ignore the marker inside a fence nested in containers", () => {
    const markdownItNested = new MarkdownIt().use(demo).use(container, { name: "tip" });
    // The fence content contains a `::::` line: without skipping fenced code it would close
    // the outer `:::: demo` block early.
    const source = `\
:::: demo
::: tip
tip content
:::

\`\`\`js
::::
\`\`\`

::::
`;

    const opens = markdownItNested
      .parse(source, {})
      .filter((token) => token.type === "demo_demo_open");

    expect(opens).toHaveLength(1);
    expect(opens[0].map).toStrictEqual([0, 9]);

    const result = markdownItNested.render(source);

    expect(result).toContain('<div class="tip">\n<p>tip content</p>\n</div>');
    expect(result).toContain('<pre><code class="language-js">::::\n</code></pre>');
  });
});
