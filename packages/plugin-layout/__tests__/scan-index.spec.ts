import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = new MarkdownIt().use(layout);
const mdNoInline = new MarkdownIt().use(layout, { inlineStyles: false });

describe("layout scan index", () => {
  it("should handle nested containers with siblings after them", () => {
    expect(
      markdownIt.render(`\
@@@flexs
@@grids
@columns
@column
Deep
@end
@@end
@@@end
@flexs
@flex
Sibling A
@end
@grids
@grid
Sibling B
@end
`),
    ).toBe(`\
<div style="display:flex">
<div style="display:grid">
<div>
<div>
<p>Deep</p>
</div>
</div>
</div>
</div>
<div style="display:flex">
<div>
<p>Sibling A</p>
</div>
</div>
<div style="display:grid">
<div>
<p>Sibling B</p>
</div>
</div>
`);
  });

  it("should keep an unmatched deeper `@end` inside a container body", () => {
    expect(
      markdownIt.render(`\
@@@flexs
@grids
@grid
Inside
@@end
@end
@@@end
@flexs
@flex
Sibling
@end
`),
    ).toBe(`\
<div style="display:flex">
<div style="display:grid">
<div>
<p>Inside
@@end</p>
</div>
</div>
</div>
<div style="display:flex">
<div>
<p>Sibling</p>
</div>
</div>
`);
  });

  it("should ignore directives in fenced code blocks inside nested containers", () => {
    expect(
      markdownIt.render(`\
@@@flexs
@@@flex
Body

\`\`\`md
@flex
@end
\`\`\`
@end
@@@end
@columns
@column
After
@end
`),
    ).toBe(`\
<div style="display:flex">
<div>
<p>Body</p>
<pre><code class="language-md">@flex
@end
</code></pre>
<p>@end</p>
</div>
</div>
<div>
<div>
<p>After</p>
</div>
</div>
`);
  });

  it("should find a following container when a list fence ends early", () => {
    expect(
      markdownIt.render(`\
  @@columns
- text
  ~~~
@flexs
@end
`),
    ).toBe(`\
<div>
<ul>
<li>text<pre><code></code></pre>
</li>
</ul>
<div style="display:flex">
</div>
</div>
`);
  });

  it("should stop a container scan at an outdented fence", () => {
    expect(
      markdownIt.render(`\
- @flexs
  @flex
  A
\`\`\`
code
\`\`\`
`),
    ).toBe(`\
<ul>
<li>
<div style="display:flex">
<div>
<p>A</p>
</div>
</div>
</li>
</ul>
<pre><code>code
</code></pre>
`);
  });

  it("should render a container without classes or utilities in class mode", () => {
    expect(
      mdNoInline.render(`\
@columns
@column
A
@end
`),
    ).toBe(`\
<div>
<div>
<p>A</p>
</div>
</div>
`);
  });
});
