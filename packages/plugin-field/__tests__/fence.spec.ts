import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

const md = new MarkdownIt({ html: true }).use(field);

describe("fenced code blocks", () => {
  it("should not treat field markers inside a fence as new fields", () => {
    const result = md.render(`
:::fields
@\`prop1\`

\`\`\`
@\`prop2\`
\`\`\`
:::
`);

    expect(result).toContain(
      '<dt class="field-name" data-level="1">prop1</dt>\n<dd class="field-content" data-level="1">\n<pre><code>@`prop2`\n</code></pre>',
    );
    expect(result).not.toContain(">prop2</dt>");
    expect(result.match(/class="field-name"/g)).toHaveLength(1);
  });

  it("should support tilde fences with field markers inside", () => {
    const result = md.render(`
:::fields
@\`prop1\`
~~~
@\`prop2\`
~~~
:::
`);

    expect(result).not.toContain(">prop2</dt>");
    expect(result.match(/class="field-name"/g)).toHaveLength(1);
    expect(result).toContain("<pre><code>@`prop2`\n</code></pre>");
  });

  it("should not close the container at a `:::` line inside a backtick fence", () => {
    const result = md.render(`
:::fields
@\`prop1\`

\`\`\`text
:::
\`\`\`
@\`prop2\`
Description 2
:::

Outside
`);

    expect(result).toContain('<pre><code class="language-text">:::\n</code></pre>');
    expect(result.match(/class="field-name"/g)).toHaveLength(2);
    expect(result).toContain(">prop2</dt>");
    expect(result).toContain("<p>Description 2</p>");
    expect(result).toContain("</dl>\n<p>Outside</p>");
  });

  it("should not close the container at a `:::` line inside a tilde fence", () => {
    const result = md.render(`
:::fields
@\`prop1\`
~~~
::::
~~~
@\`prop2\`
:::
`);

    expect(result).toContain("<pre><code>::::\n</code></pre>");
    expect(result.match(/class="field-name"/g)).toHaveLength(2);
    expect(result).toContain(">prop2</dt>");
  });

  it("should skip an indented fence containing a container-level `:::` line", () => {
    const result = md.render(`
  :::fields
  @\`prop1\`
    \`\`\`text
  :::
    \`\`\`
  @\`prop2\`
  :::
`);

    expect(result).toContain('<pre><code class="language-text">:::\n</code></pre>');
    expect(result.match(/class="field-name"/g)).toHaveLength(2);
    expect(result).toContain(">prop2</dt>");
  });

  it("should continue scanning after a closed fence", () => {
    const result = md.render(`
:::fields
@\`prop1\`
\`\`\`
foo
\`\`\`
@\`prop2\`
Description 2
:::
`);

    expect(result.match(/class="field-name"/g)).toHaveLength(2);
    expect(result).toContain(">prop2</dt>");
    expect(result).toContain("<p>Description 2</p>");
  });
});
