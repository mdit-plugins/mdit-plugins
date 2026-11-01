import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance, Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import { container } from "../../plugin-container/src/index.js";
import { demo } from "../src/index.js";

const markdownIt = new MarkdownIt().use(demo);

const findDemoOpens = (md: MarkdownItInstance, source: string): Token[] =>
  md.parse(source, {}).filter((token) => token.type === "demo_demo_open");

describe(demo, () => {
  it("should ignore the marker inside a backtick fence", () => {
    const source = `\
::: demo
\`\`\`js
const a = ":::";
:::
\`\`\`
after
:::
`;

    const opens = findDemoOpens(markdownIt, source);

    expect(opens).toHaveLength(1);
    expect(opens[0].map).toStrictEqual([0, 6]);

    const result = markdownIt.render(source);

    expect(result).toContain(`\
<pre><code class="language-js">const a = &quot;:::&quot;;
:::
</code></pre>
<p>after</p>`);
    expect(result).toContain(":::\n```\nafter");
    expect(result).not.toContain("<pre><code>after");
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

  it("should ignore the marker inside a tilde fence", () => {
    const source = `\
::: demo
~~~js
:::
~~~
after
:::
`;

    const opens = findDemoOpens(markdownIt, source);

    expect(opens).toHaveLength(1);
    expect(opens[0].map).toStrictEqual([0, 5]);

    const result = markdownIt.render(source);

    expect(result).toContain(`\
<pre><code class="language-js">:::
</code></pre>
<p>after</p>`);
    expect(result).not.toContain("<pre><code>after");
  });

  it("should ignore the marker inside a fence with an info string", () => {
    const source = `\
::: demo
\`\`\`js title="a"
:::
\`\`\`
after
:::
`;

    const opens = findDemoOpens(markdownIt, source);

    expect(opens).toHaveLength(1);
    expect(opens[0].map).toStrictEqual([0, 5]);

    const result = markdownIt.render(source);

    expect(result).toContain('<pre><code class="language-js">:::\n</code></pre>');
    expect(result).toContain("<p>after</p>");
    expect(result).not.toContain("<pre><code>after");
  });

  it.each([0, 1, 2, 3])("should ignore the marker inside a fence opened at indent %i", (indent) => {
    const spaces = " ".repeat(indent);
    const source = `\
::: demo
${spaces}\`\`\`md
:::
${spaces}\`\`\`
after
:::
`;

    const opens = findDemoOpens(markdownIt, source);

    expect(opens).toHaveLength(1);
    expect(opens[0].map).toStrictEqual([0, 5]);
    expect(markdownIt.render(source)).toContain("<p>after</p>");
  });

  it("should auto close an unclosed fence and the demo at the end of the parent", () => {
    const source = `\
::: demo
\`\`\`js
:::
`;

    const opens = findDemoOpens(markdownIt, source);

    expect(opens).toHaveLength(1);
    expect(opens[0].map).toStrictEqual([0, 3]);

    const result = markdownIt.render(source);

    expect(result).toContain('<pre><code class="language-js">:::\n</code></pre>');
    expect(result.endsWith("</details>\n")).toBe(true);
  });

  it("should ignore the marker inside a fence in a blockquoted demo", () => {
    const source = `\
> ::: demo
> \`\`\`js
> :::
> \`\`\`
> after
> :::
`;

    const opens = findDemoOpens(markdownIt, source);

    expect(opens).toHaveLength(1);
    expect(opens[0].map).toStrictEqual([0, 5]);

    const result = markdownIt.render(source);

    expect(result).toContain(`\
<pre><code class="language-js">:::
</code></pre>
<p>after</p>`);
    expect(result).not.toContain("<pre><code>after");
  });

  it("should ignore the marker inside a fence in a list-indented demo", () => {
    const source = `\
- item

  ::: demo
  \`\`\`js
  :::
  \`\`\`
  after
  :::
`;

    const opens = findDemoOpens(markdownIt, source);

    expect(opens).toHaveLength(1);
    expect(opens[0].map).toStrictEqual([2, 7]);

    const result = markdownIt.render(source);

    expect(result).toContain(`\
<pre><code class="language-js">:::
</code></pre>
<p>after</p>`);
    expect(result).not.toContain("<pre><code>after");
  });

  it("should still close at a normal marker", () => {
    const source = `\
::: demo
content
:::
`;

    const opens = findDemoOpens(markdownIt, source);

    expect(opens).toHaveLength(1);
    expect(opens[0].map).toStrictEqual([0, 2]);
    expect(markdownIt.render(source)).toContain("<p>content</p>");
  });
});
