import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
  describe("inlineStyles option", () => {
    const mdNoInline = new MarkdownIt().use(layout, { inlineStyles: false });

    it("should pass utilities as class names when inlineStyles is false", () => {
      expect(
        mdNoInline.render(`\
@flexs gap-4 items-center
@flex flex-1
Content
@end
`),
      ).toBe(`\
<div style="display:flex" class="gap-4 items-center">
<div class="flex-1">
<p>Content</p>
</div>
</div>
`);
    });

    it("should handle container with class and id selectors", () => {
      expect(
        mdNoInline.render(`\
@grids.gallery#main grid-cols-3
@grid
Item
@end
`),
      ).toBe(`\
<div style="display:grid" class="gallery grid-cols-3" id="main">
<div>
<p>Item</p>
</div>
</div>
`);
    });

    it("should handle column container without base display", () => {
      expect(
        mdNoInline.render(`\
@columns columns-3
@column
Content
@end
`),
      ).toBe(`\
<div class="columns-3">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should handle .span-all on column items as class only", () => {
      expect(
        mdNoInline.render(`\
@columns
@column.span-all
Spanning
@end
`),
      ).toBe(`\
<div>
<div class="span-all">
<p>Spanning</p>
</div>
</div>
`);
    });

    it("should handle item with id", () => {
      expect(
        mdNoInline.render(`\
@flexs
@flex#sidebar
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div id="sidebar">
<p>Content</p>
</div>
</div>
`);
    });
  });

  describe("code blocks", () => {
    it("should not treat @end inside fenced code as a real end", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
\`\`\`md
@end
\`\`\`
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<pre><code class="language-md">@end
</code></pre>
<p>Content</p>
</div>
</div>
`);
    });

    it("should not treat layout directives inside fenced code as real directives", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
\`\`\`md
@flexs
\`\`\`
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<pre><code class="language-md">@flexs
</code></pre>
<p>Content</p>
</div>
</div>
`);
    });

    it("should not treat @end inside tilde fenced code as a real end", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
~~~
@end
~~~
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<pre><code>@end
</code></pre>
<p>Content</p>
</div>
</div>
`);
    });

    it("should keep container content after a fenced code block", () => {
      expect(
        markdownIt.render(`\
@flexs
\`\`\`
@end
\`\`\`
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<pre><code>@end
</code></pre>
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should treat a short marker line as text, not a fence", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
~ab
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>~ab
Content</p>
</div>
</div>
`);
    });

    it("should not treat a backtick fence with a backtick in info as a fence", () => {
      expect(markdownIt.render("@flexs\n@flex\n```a`b\nContent\n@end\n")).toBe(
        '<div style="display:flex">\n<div>\n<p>```a`b\nContent</p>\n</div>\n</div>\n',
      );
    });

    it("should auto-close container when the fence is unclosed", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
~~~js
content
`),
      ).toBe(`\
<div style="display:flex">
<div>
<pre><code class="language-js">content
</code></pre>
</div>
</div>
`);
    });

    it("should keep indented lines inside a fence as code content", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
~~~js
    indented
~~~
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<pre><code class="language-js">    indented
</code></pre>
<p>Content</p>
</div>
</div>
`);
    });

    it("should not close a fence with a shorter marker line", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
~~~~js
~~~
~~~~
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<pre><code class="language-js">~~~
</code></pre>
<p>Content</p>
</div>
</div>
`);
    });

    it("should not close a fence with trailing content", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
~~~~js
~~~~ trailing
~~~~
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<pre><code class="language-js">~~~~ trailing
</code></pre>
<p>Content</p>
</div>
</div>
`);
    });

    it("should not close a fence with an indented marker line", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
~~~js
    ~~~
Content
~~~
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<pre><code class="language-js">    ~~~
Content
</code></pre>
</div>
</div>
`);
    });
  });
});
