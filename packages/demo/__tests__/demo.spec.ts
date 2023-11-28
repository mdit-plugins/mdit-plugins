import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { alert } from "../../alert/src/index.js";
import { include } from "../../include/src/plugin.js";
import { demo } from "../src/index.js";

const escapeHtml = (unsafeHTML: string): string =>
  unsafeHTML
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#039;");

const mdContent = `\
# Heading 1

Content text.

\`\`\`js
const a = 1;
\`\`\`\
`;

describe("demo", () => {
  it("default", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(demo);

    expect(
      markdownIt.render(`
::: demo Title text
${mdContent}
:::
`),
    ).toBe(
      `\
<details><summary>Title text</summary>
<h1>Heading 1</h1>
<p>Content text.</p>
<pre><code class="language-js">const a = 1;
</code></pre>
<pre><code class="language-md">${mdContent}
</code></pre>
</details>
`,
    );

    expect(
      markdownIt.render(`
- list

  ::: demo Title text
  # Heading 1

  Content text.

  \`\`\`js
  const a = 1;
  \`\`\`
  :::
`),
    ).toBe(
      `\
<ul>
<li>
<p>list</p>
<details><summary>Title text</summary>
<h1>Heading 1</h1>
<p>Content text.</p>
<pre><code class="language-js">const a = 1;
</code></pre>
<pre><code class="language-md">${mdContent}
</code></pre>
</details>
</li>
</ul>
`,
    );
  });

  it("customize name", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(demo, {
      name: "md-demo",
    });

    expect(
      markdownIt.render(`
::: md-demo Title text
${mdContent}
:::
`),
    ).toBe(
      `\
<details><summary>Title text</summary>
<h1>Heading 1</h1>
<p>Content text.</p>
<pre><code class="language-js">const a = 1;
</code></pre>
<pre><code class="language-md">${mdContent}
</code></pre>
</details>
`,
    );

    expect(
      markdownIt.render(`
::: md-demo Title text

${mdContent}

:::
`),
    ).toBe(
      `\
<details><summary>Title text</summary>
<h1>Heading 1</h1>
<p>Content text.</p>
<pre><code class="language-js">const a = 1;
</code></pre>
<pre><code class="language-md">${mdContent}
</code></pre>
</details>
`,
    );
  });

  it("beforeContent", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(demo, {
      beforeContent: true,
    });

    expect(
      markdownIt.render(`
::: demo Title text
${mdContent}
:::
`),
    ).toBe(
      `\
<details><summary>Title text</summary>
<pre><code class="language-md">${mdContent}
</code></pre>
<h1>Heading 1</h1>
<p>Content text.</p>
<pre><code class="language-js">const a = 1;
</code></pre>
</details>
`,
    );
  });

  it("customRender", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(demo, {
      openRender: () => `<details><summary><div>\n`,
      codeRender: (tokens, index, options, _env, self) => {
        tokens[index].type = "fence";
        tokens[index].info = "md";
        tokens[index].markup = "```";

        return `</div></summary>\n${self.rules.fence!(
          tokens,
          index,
          options,
          _env,
          self,
        )}`;
      },
    });

    expect(
      markdownIt.render(`
::: demo Title text
${mdContent}
:::
`),
    ).toBe(
      `\
<details><summary><div>
<h1>Heading 1</h1>
<p>Content text.</p>
<pre><code class="language-js">const a = 1;
</code></pre>
</div></summary>
<pre><code class="language-md">${mdContent}
</code></pre>
</details>
`,
    );
  });

  it("should work with alert", () => {
    const alertContent = `\
> [!caution]
> Caution text\
`;

    const markdownItAlert = MarkdownIt({ linkify: true })
      .use(alert, { deep: true })
      .use(demo);

    expect(
      markdownItAlert.render(`
::: demo Title text
${alertContent}
:::
`),
    ).toBe(
      `\
<details><summary>Title text</summary>
<div class="markdown-alert markdown-alert-caution">
<p class="markdown-alert-title">Caution</p>
<p>Caution text</p>
</div>
<pre><code class="language-md">${escapeHtml(alertContent)}
</code></pre>
</details>
`,
    );
  });

  it("should work with import", () => {
    const importContent = `\
<!-- @include: ../../include/__tests__/__fixtures__/simpleInclude.md -->
`;

    const markdownItInclude = MarkdownIt({ linkify: true })
      .use(include, {
        currentPath: () => __filename,
      })
      .use(demo);

    expect(
      markdownItInclude.render(`
::: demo Title text
${importContent}
:::
`),
    ).toBe(
      `\
<details><summary>Title text</summary>
<h1>ABC</h1>
<p>DEF</p>
<pre><code class="language-md">@include-push(/home/mister-hope/projects/mdit-plugins/packages/include/__tests__/__fixtures__)
# ABC

DEF

@include-pop()
</code></pre>
</details>
`,
    );

    expect(
      markdownItInclude.render(`
- list

  ::: demo Title text

  <!-- @include: ../../include/__tests__/__fixtures__/simpleInclude.md -->

  :::
`),
    ).toBe(
      `\
<ul>
<li>
<p>list</p>
<details><summary>Title text</summary>
<h1>ABC</h1>
<p>DEF</p>
<pre><code class="language-md">@include-push(/home/mister-hope/projects/mdit-plugins/packages/include/__tests__/__fixtures__)
# ABC

DEF

@include-pop()
</code></pre>
</details>
</li>
</ul>
`,
    );
  });
});
