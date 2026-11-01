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

  describe("4-space indented directives", () => {
    it("should not treat directives after the container start as directives", () => {
      expect(
        markdownIt.render(`\
@flexs
    @flex
    @end
`),
      ).toBe(`\
<div style="display:flex">
<pre><code>@flex
@end
</code></pre>
</div>
`);
    });

    it("should treat directives after a paragraph as lazy continuation", () => {
      expect(
        markdownIt.render(`\
@flexs
text
    @flex
    @end
`),
      ).toBe(`\
<div style="display:flex">
<p>text
@flex
@end</p>
</div>
`);
    });

    it("should not treat directives after a blank line as directives", () => {
      expect(
        markdownIt.render(`\
@flexs
text

    @flex
    @end
`),
      ).toBe(`\
<div style="display:flex">
<p>text</p>
<pre><code>@flex
@end
</code></pre>
</div>
`);
    });

    it("should not treat directives after a heading as directives", () => {
      expect(
        markdownIt.render(`\
@flexs
# Heading
    @flexs
    @end
`),
      ).toBe(`\
<div style="display:flex">
<h1>Heading</h1>
<pre><code>@flexs
@end
</code></pre>
</div>
`);
    });

    it("should not treat an indented container as a blockquote terminator", () => {
      expect(
        markdownIt.render(`\
> quote
    @flexs
`),
      ).toBe(`\
<blockquote>
<p>quote
@flexs</p>
</blockquote>
`);
    });

    it("should not treat an indented item as a blockquote terminator", () => {
      expect(
        markdownIt.render(`\
@flexs
> quote
    @flex
`),
      ).toBe(`\
<div style="display:flex">
<blockquote>
<p>quote
@flex</p>
</blockquote>
</div>
`);
    });
  });

  describe("outdented boundaries", () => {
    it("should keep content after an outdented @end", () => {
      expect(
        markdownIt.render(`\
- @flexs
  @flex
  A

@end
After
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
<p>@end
After</p>
`);
    });

    it("should keep outdented trailing content without @end", () => {
      expect(
        markdownIt.render(`\
- @flexs
  @flex
  A

outside
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
<p>outside</p>
`);
    });

    it("should keep blockquote lazy continuations and following content", () => {
      expect(
        markdownIt.render(`\
> @flexs
> Content
lazy
> @end
> after
`),
      ).toBe(`\
<blockquote>
<div style="display:flex">
<p>Content
lazy</p>
</div>
<p>after</p>
</blockquote>
`);
    });

    it("should keep following content after an item boundary in a blockquote", () => {
      expect(
        markdownIt.render(`\
> @flexs
> @flex
> A
lazy
> @end
> after
`),
      ).toBe(`\
<blockquote>
<div style="display:flex">
<div>
<p>A
lazy</p>
</div>
</div>
<p>after</p>
</blockquote>
`);
    });

    it("should keep auto-closed container token maps in bounds", () => {
      const source = `\
@flexs
content
`;
      const tokens = markdownIt.parse(source, {});
      const open = tokens.find((token) => token.type === "layout_container_open");

      expect(open).toBeDefined();
      expect(open?.map).toStrictEqual([0, 2]);
    });

    it("should keep content after a lazy @end", () => {
      const result = markdownIt.render(`\
> @flexs
> \`\`\`
> code
> \`\`\`
@end
> more
`);

      expect(result).toContain("<pre><code>code\n</code></pre>");
      expect(result).toContain("<p>@end</p>");
      expect(result).toContain("<p>more</p>");
    });

    it("should pin maps for explicit ends with trailing content", () => {
      const tokens = markdownIt
        .parse("@flexs\n@flex\nA\n@end\nAfter\n", {})
        .filter((token) => token.type.startsWith("layout"));

      expect(tokens.map((token) => [token.type, token.map])).toStrictEqual([
        ["layout_container_open", [0, 4]],
        ["layout_item_open", [1, 3]],
        ["layout_item_close", null],
        ["layout_container_close", null],
      ]);
    });

    it("should pin the map of an early-stopped container", () => {
      const tokens = markdownIt
        .parse("> @flexs\n> # H\nlazy\n> @end\n> after\n", {})
        .filter((token) => token.type.startsWith("layout"));

      expect(tokens.map((token) => [token.type, token.map])).toStrictEqual([
        ["layout_container_open", [0, 2]],
        ["layout_container_close", null],
      ]);
    });

    it("should pin item maps for an early-stopped container", () => {
      const tokens = markdownIt
        .parse("> @flexs\n> @flex\n> # H\nlazy\n> @flex\n> B\n> @end\n> after\n", {})
        .filter((token) => token.type.startsWith("layout"));

      expect(tokens.map((token) => [token.type, token.map])).toStrictEqual([
        ["layout_container_open", [0, 3]],
        ["layout_item_open", [1, 3]],
        ["layout_item_close", null],
        ["layout_container_close", null],
      ]);
    });

    it("should keep a lazy item marker inside a blockquote item", () => {
      const source = `\
> @flexs
> @flex
> A
@flex
> B
> @end
> after
`;
      const result = markdownIt.render(source);
      const tokens = markdownIt
        .parse(source, {})
        .filter((token) => token.type.startsWith("layout"));

      expect(result).toContain("<p>A\n@flex\nB</p>");
      expect(result).toContain("<p>after</p>");
      expect(tokens.map((token) => [token.type, token.map])).toStrictEqual([
        ["layout_container_open", [0, 6]],
        ["layout_item_open", [1, 5]],
        ["layout_item_close", null],
        ["layout_container_close", null],
      ]);
    });

    it("should handle CRLF blockquote lazy lines", () => {
      const source =
        "> @flexs\r\n> @flex\r\n> # H\r\nlazy\r\n> @flex\r\n> B\r\n> @end\r\n> after\r\n";
      const result = markdownIt.render(source);
      const tokens = markdownIt
        .parse(source, {})
        .filter((token) => token.type.startsWith("layout"));

      expect(result).toContain("<h1>H</h1>");
      expect(result).toContain("<p>lazy</p>");
      expect(result).toContain("@flex");
      expect(result).toContain("after");
      expect(tokens.map((token) => [token.type, token.map])).toStrictEqual([
        ["layout_container_open", [0, 3]],
        ["layout_item_open", [1, 3]],
        ["layout_item_close", null],
        ["layout_container_close", null],
      ]);
    });

    it("should keep content after a lazy @end inside an item", () => {
      const result = markdownIt.render(`\
> @flexs
> @flex
> A
@end
> more
`);

      expect(result).toContain("<p>A\n@end\nmore</p>");
    });

    it("should produce exact token maps for outdented and explicit ends", () => {
      const outdented = markdownIt
        .parse("- @flexs\n  @flex\n  A\n\noutside\n", {})
        .filter((token) => token.type.startsWith("layout"));
      const explicit = markdownIt
        .parse("@flexs\n@flex\nA\n@end\n", {})
        .filter((token) => token.type.startsWith("layout"));

      expect(outdented.map((token) => [token.type, token.map])).toStrictEqual([
        ["layout_container_open", [0, 4]],
        ["layout_item_open", [1, 4]],
        ["layout_item_close", null],
        ["layout_container_close", null],
      ]);
      expect(explicit.map((token) => [token.type, token.map])).toStrictEqual([
        ["layout_container_open", [0, 4]],
        ["layout_item_open", [1, 3]],
        ["layout_item_close", null],
        ["layout_container_close", null],
      ]);
    });

    it("should keep lazy lines when a matching @end is found later", () => {
      const result = markdownIt.render(`\
> @flexs
> # H
lazy
> @end
> after
`);

      expect(result).toContain("<h1>H</h1>");
      expect(result).toContain("<p>lazy</p>");
      expect(result).toContain("@end");
      expect(result).toContain("after");
    });

    it("should not lose a sibling item after a lazy line", () => {
      const result = markdownIt.render(`\
> @flexs
> @flex
> # H
lazy
> @flex
> B
> @end
> after
`);

      expect(result).toContain("<h1>H</h1>");
      expect(result).toContain("<p>lazy</p>");
      expect(result).toContain("@flex");
      expect(result).toContain("B");
      expect(result).toContain("after");
    });

    it("should render an empty container without throwing", () => {
      const result = markdownIt.render("@flexs\n");
      const tokens = markdownIt
        .parse("@flexs\n", {})
        .filter((token) => token.type.startsWith("layout"));

      expect(result).toBe('<div style="display:flex">\n</div>\n');
      expect(tokens.map((token) => [token.type, token.map])).toStrictEqual([
        ["layout_container_open", [0, 1]],
        ["layout_container_close", null],
      ]);
    });
  });
});
