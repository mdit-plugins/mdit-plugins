import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { demo } from "../src/index.js";

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
      `<details><summary>Title text</summary>
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
      `<details><summary>Title text</summary>
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
      `<details><summary>Title text</summary>
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
        console.log(tokens[index]);

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
      `<details><summary><div>
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
});
