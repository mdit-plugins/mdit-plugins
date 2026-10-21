import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { alert } from "../src/index.js";

describe("alert silent state", () => {
  it("should not leak state when a silent alert is interrupted by another block", () => {
    const src = `\
foo
> [!tip]
> body
# heading

[ref]:
/url

[ref]
`;

    const md = new MarkdownIt().use(alert);

    expect(md.render(src)).toBe(`\
<p>foo</p>
<div class="markdown-alert markdown-alert-tip">
<p class="markdown-alert-title">Tip</p>
<p>body</p>
</div>
<h1>heading</h1>
<p><a href="/url">ref</a></p>
`);
  });

  it("should not leak state when a silent alert is rejected after finding a terminator", () => {
    const src = `\
foo
> [!tip]
- item

[ref]:
/url

[ref]
`;

    const md = new MarkdownIt().use(alert);

    expect(md.render(src)).toBe(`\
<p>foo</p>
<blockquote>
<p>[!tip]</p>
</blockquote>
<ul>
<li>item</li>
</ul>
<p><a href="/url">ref</a></p>
`);
  });
});
