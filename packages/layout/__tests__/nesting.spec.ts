import { container } from "@mdit/plugin-container";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
  describe("nesting", () => {
    describe("simple nesting", () => {
      it("should support nesting same type", () => {
        const expected = `\
<div style="display:flex">
<div>
<div style="display:flex">
<div>
<p>Nested content</p>
</div>
</div>
</div>
</div>
`;

        expect(
          markdownIt.render(`\
@flexs
@flex
@flexs
@flex
Nested content
@end
@end
`),
        ).toBe(expected);

        // nested style
        expect(
          markdownIt.render(`\
@flexs
  @flex
    @flexs
      @flex
      Nested content
    @end
@end
`),
        ).toBe(expected);
      });

      it("should support nesting different types", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@grids
@grid
Nested content
@end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:grid">
<div>
<p>Nested content</p>
</div>
</div>
</div>
</div>
`);
      });

      it("should handle multiple levels", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@grids
@grid
@columns
@column
Deep content
@end
@end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:grid">
<div>
<div>
<div>
<p>Deep content</p>
</div>
</div>
</div>
</div>
</div>
</div>
`);
      });

      it("should handle content before nested", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
Some text before
@grids grid-cols-2
@grid
Item A
@grid
Item B
@end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<p>Some text before</p>
<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr))">
<div>
<p>Item A</p>
</div>
<div>
<p>Item B</p>
</div>
</div>
</div>
</div>
`);
      });

      it("should handle content after nested", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@grids
@grid
Inner
@end
After nested
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:grid">
<div>
<p>Inner</p>
</div>
</div>
<p>After nested</p>
</div>
</div>
`);
      });

      it("should handle siblings after nested", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@grids
@grid
Inner
@end
@flex
Outer sibling
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:grid">
<div>
<p>Inner</p>
</div>
</div>
</div>
<div>
<p>Outer sibling</p>
</div>
</div>
`);
      });
    });

    describe("prefix-based nesting", () => {
      it("should support basic @@ nesting", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@@flexs
@@flex
Nested content
@@end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:flex">
<div>
<p>Nested content</p>
</div>
</div>
</div>
</div>
`);
      });

      it("should support @@ nesting with utilities", () => {
        expect(
          markdownIt.render(`\
@flexs gap-4
@flex
@@grids grid-cols-2
@@grid
Item 1
@@grid
Item 2
@@end
@end
`),
        ).toBe(`\
<div style="display:flex;gap:1rem">
<div>
<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr))">
<div>
<p>Item 1</p>
</div>
<div>
<p>Item 2</p>
</div>
</div>
</div>
</div>
`);
      });

      it("should support @@@ deeper nesting", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@@flexs
@@flex
@@@grids
@@@grid
Deep content
@@@end
@@end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:flex">
<div>
<div style="display:grid">
<div>
<p>Deep content</p>
</div>
</div>
</div>
</div>
</div>
</div>
`);
      });

      it("should reject @@ at top level", () => {
        expect(
          markdownIt.render(`\
@@flexs
@@flex
Content
@@end
`),
        ).toBe(`\
<p>@@flexs
@@flex
Content
@@end</p>
`);
      });

      it("should reject depth mismatch (@@@ inside @, skipping @@)", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@@@flexs
@@@end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<p>@@@flexs
@@@end</p>
</div>
</div>
`);
      });

      it("should not confuse @end depths", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@@flexs
@@flex
Inner
@@end
Outer content
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:flex">
<div>
<p>Inner</p>
</div>
</div>
<p>Outer content</p>
</div>
</div>
`);
      });

      it("should support @@ items with class and id selectors", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@@flexs.inner#nested gap-4
@@flex.item flex-1
Content
@@end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:flex;gap:1rem" class="inner" id="nested">
<div style="flex:1 1 0%" class="item">
<p>Content</p>
</div>
</div>
</div>
</div>
`);
      });

      it("should auto-close prefix container at end of document", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@@flexs
@@flex
Content
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:flex">
<div>
<p>Content</p>
</div>
</div>
</div>
</div>
`);
      });

      it("should reject depth-0 inside prefix-mode container", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
@@flexs
@@flex
@grids
@end
@@end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<div style="display:flex">
<div>
<p>@grids
@end</p>
</div>
</div>
</div>
</div>
`);
      });
    });

    describe("nesting inside block elements", () => {
      it("should work inside unordered list", () => {
        const expected = `\
<ul>
<li>item 1<div style="display:flex">
<div>
<p>Flex inside list</p>
</div>
</div>
</li>
</ul>
`;

        expect(
          markdownIt.render(`\
- item 1
  @flexs
  @flex
  Flex inside list
  @end
`),
        ).toBe(expected);

        expect(
          markdownIt.render(`\
-  item 1
   @flexs
   @flex
   Flex inside list
   @end
`),
        ).toBe(expected);
      });

      it("should work inside ordered list", () => {
        const expected = `\
<ol>
<li>item 1<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr))">
<div>
<p>Grid A</p>
</div>
<div>
<p>Grid B</p>
</div>
</div>
</li>
</ol>
`;

        expect(
          markdownIt.render(`\
1. item 1
   @grids grid-cols-2
   @grid
   Grid A
   @grid
   Grid B
   @end
`),
        ).toBe(expected);

        expect(
          markdownIt.render(`\
1.  item 1
    @grids grid-cols-2
    @grid
    Grid A
    @grid
    Grid B
    @end
`),
        ).toBe(expected);
      });

      it("should work inside blockquote", () => {
        expect(
          markdownIt.render(`\
> @flexs
> @flex
> Content in quote
> @end
`),
        ).toBe(`\
<blockquote>
<div style="display:flex">
<div>
<p>Content in quote</p>
</div>
</div>
</blockquote>
`);
      });

      it("should work in nested content inside layout", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex
- item 1
  @flexs
  @flex
  Nested item
  @end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<ul>
<li>item 1<div style="display:flex">
<div>
<p>Nested item</p>
</div>
</div>
</li>
</ul>
</div>
</div>
`);
        expect(
          markdownIt.render(`\
@flexs
@flex
> item 1
> @flexs
> @flex
> Nested item
> @end
@end
`),
        ).toBe(`\
<div style="display:flex">
<div>
<blockquote>
<p>item 1</p>
<div style="display:flex">
<div>
<p>Nested item</p>
</div>
</div>
</blockquote>
</div>
</div>
`);
      });

      it("should work inside other plugins tokens (e.g. container)", () => {
        const mdItWithContainer = MarkdownIt().use(container, { name: "test" }).use(layout);

        expect(
          mdItWithContainer.render(`\
:::: test
@flexs
@flex
Content in container
::: test
@flexs
@flex
content in nested container
@end
:::
@end
::::
`),
        ).toBe(`\
<div class="test">
<div style="display:flex">
<div>
<p>Content in container</p>
<div class="test">
<div style="display:flex">
<div>
<p>content in nested container</p>
</div>
</div>
</div>
</div>
</div>
</div>
`);
      });

      it("should NOT trigger inside fenced code block", () => {
        expect(
          markdownIt.render(`\
\`\`\`markdown
@flexs
@flex
Content
@end
\`\`\`
`),
        ).toBe(`\
<pre><code class="language-markdown">@flexs
@flex
Content
@end
</code></pre>
`);
      });

      it("should NOT trigger inside indented code block", () => {
        expect(
          markdownIt.render(`\
    @flexs
    @flex
    Content
    @end
`),
        ).toBe(`\
<pre><code>@flexs
@flex
Content
@end
</code></pre>
`);
      });
    });
  });

  describe("auto-closing", () => {
    it("should auto-close container at end of document", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
Content
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>Content</p>
</div>
</div>
`);
    });
  });

  describe("empty containers", () => {
    it("should handle empty container", () => {
      expect(
        markdownIt.render(`\
@flexs
@end
`),
      ).toBe(`\
<div style="display:flex">
</div>
`);
    });
  });

  describe("markdown content", () => {
    it("should render markdown inside items", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
### Heading

**Bold** and *italic* text

- List item 1
- List item 2
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<h3>Heading</h3>
<p><strong>Bold</strong> and <em>italic</em> text</p>
<ul>
<li>List item 1</li>
<li>List item 2</li>
</ul>
</div>
</div>
`);
    });
  });

  describe("non-layout content", () => {
    it("should not affect regular markdown", () => {
      expect(
        markdownIt.render(`\
# Heading

Regular paragraph.
`),
      ).toBe(`\
<h1>Heading</h1>
<p>Regular paragraph.</p>
`);
    });

    it("should handle content before and after layout", () => {
      expect(
        markdownIt.render(`\
Before

@flexs
@flex
Content
@end

After
`),
      ).toBe(`\
<p>Before</p>
<div style="display:flex">
<div>
<p>Content</p>
</div>
</div>
<p>After</p>
`);
    });
  });

  describe("break utilities", () => {
    it("should support break-before and break-after", () => {
      expect(
        markdownIt.render(`\
@columns columns-2
@column break-before-column
A
@column break-after-avoid
B
@end
`),
      ).toBe(`\
<div style="columns:2">
<div style="break-before:column">
<p>A</p>
</div>
<div style="break-after:avoid">
<p>B</p>
</div>
</div>
`);
    });
  });

  describe("grid auto flow dense", () => {
    it("should support grid-flow-row-dense and grid-flow-col-dense", () => {
      expect(
        markdownIt.render(`\
@grids grid-flow-row-dense
@grid
A
@end
`),
      ).toBe(`\
<div style="display:grid;grid-auto-flow:row dense">
<div>
<p>A</p>
</div>
</div>
`);
    });
  });

  describe("unrecognized utilities", () => {
    it("should ignore unrecognized utilities in inline mode", () => {
      expect(
        markdownIt.render(`\
@flexs unknown-class
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>A</p>
</div>
</div>
`);
    });
  });

  describe("edge cases", () => {
    it("should not match @flexs inside a word", () => {
      expect(
        markdownIt.render(`\
some@flexs text
`),
      ).toBe(`\
<p>some@flexs text</p>
`);
    });

    it("should handle items without content", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
</div>
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should not match grid items inside flex container", () => {
      expect(
        markdownIt.render(`\
@flexs
@grid
A
@flex
B
@end
`),
      ).toBe(`\
<div style="display:flex">
<p>@grid
A</p>
<div>
<p>B</p>
</div>
</div>
`);
    });

    it("should handle @ followed by unrecognized directive", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
@unknown
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>@unknown
Content</p>
</div>
</div>
`);
    });

    it("should handle trailing spaces on utilities line", () => {
      expect(
        markdownIt.render(`\
@flexs gap-4  
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex;gap:1rem">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should handle container with only one item terminated by @end", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
Only item
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>Only item</p>
</div>
</div>
`);
    });

    it("should handle parameterized utilities with non-numeric values", () => {
      expect(
        markdownIt.render(`\
@flexs gap-abc
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should handle gap-x-px and gap-y-px", () => {
      expect(
        markdownIt.render(`\
@flexs gap-x-px gap-y-px
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex;column-gap:1px;row-gap:1px">
<div>
<p>A</p>
</div>
</div>
`);
    });
  });

  describe("inlineStyles option", () => {
    const mdNoInline = MarkdownIt().use(layout, { inlineStyles: false });

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

  describe("XSS prevention", () => {
    it("should escape special characters in class names", () => {
      expect(
        markdownIt.render(`\
@flexs.foo&bar
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex" class="foo&amp;bar">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should escape special characters in id", () => {
      expect(
        markdownIt.render(`\
@flexs#id&amp
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex" id="id&amp;amp">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should escape special characters in item class and id", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex.cls'quote#id"dquote
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div class="cls&#39;quote" id="id&quot;dquote">
<p>Content</p>
</div>
</div>
`);
    });

    it("should escape class names in noInline mode", () => {
      const mdNoInline = MarkdownIt().use(layout, { inlineStyles: false });

      expect(
        mdNoInline.render(`\
@flexs.foo&bar gap-4
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex" class="foo&amp;bar gap-4">
<div>
<p>Content</p>
</div>
</div>
`);
    });
  });
});
