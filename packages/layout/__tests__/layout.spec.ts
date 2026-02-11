import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { parseAttributes } from "../src/directive.js";
import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
  describe("flexbox layout", () => {
    it("should render basic flex container with items", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
Content A
@flex
Content B
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>Content A</p>
</div>
<div>
<p>Content B</p>
</div>
</div>
`);
    });

    it("should render flex container with utilities", () => {
      expect(
        markdownIt.render(`\
@flexs gap-4 items-center
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex;gap:1rem;align-items:center">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should render flex container with class and id selectors", () => {
      expect(
        markdownIt.render(`\
@flexs.nav#top
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex" class="nav" id="top">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should render flex container with class, id, and utilities", () => {
      expect(
        markdownIt.render(`\
@flexs.nav#top gap-4 items-center
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex;gap:1rem;align-items:center" class="nav" id="top">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should render flex items with utilities", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex.sidebar
Content A
@flex flex-none
Content B
@end
`),
      ).toBe(`\
<div style="display:flex">
<div class="sidebar">
<p>Content A</p>
</div>
<div style="flex:none">
<p>Content B</p>
</div>
</div>
`);
    });

    it("should support flex direction utilities", () => {
      expect(
        markdownIt.render(`\
@flexs flex-col
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex;flex-direction:column">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should support flex wrap utilities", () => {
      expect(
        markdownIt.render(`\
@flexs flex-wrap
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex;flex-wrap:wrap">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should support flex shorthand utilities on items", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex flex-1
A
@flex flex-auto
B
@flex flex-initial
C
@end
`),
      ).toBe(`\
<div style="display:flex">
<div style="flex:1 1 0%">
<p>A</p>
</div>
<div style="flex:1 1 auto">
<p>B</p>
</div>
<div style="flex:0 1 auto">
<p>C</p>
</div>
</div>
`);
    });

    it("should support grow and shrink utilities", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex grow
A
@flex grow-0
B
@flex shrink
C
@flex shrink-0
D
@end
`),
      ).toBe(`\
<div style="display:flex">
<div style="flex-grow:1">
<p>A</p>
</div>
<div style="flex-grow:0">
<p>B</p>
</div>
<div style="flex-shrink:1">
<p>C</p>
</div>
<div style="flex-shrink:0">
<p>D</p>
</div>
</div>
`);
    });

    it("should support order utilities", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex order-first
A
@flex order-last
B
@flex order-none
C
@flex order-2
D
@end
`),
      ).toBe(`\
<div style="display:flex">
<div style="order:-9999">
<p>A</p>
</div>
<div style="order:9999">
<p>B</p>
</div>
<div style="order:0">
<p>C</p>
</div>
<div style="order:2">
<p>D</p>
</div>
</div>
`);
    });
  });

  describe("grid layout", () => {
    it("should render basic grid container with items", () => {
      expect(
        markdownIt.render(`\
@grids
@grid
Content A
@grid
Content B
@end
`),
      ).toBe(`\
<div style="display:grid">
<div>
<p>Content A</p>
</div>
<div>
<p>Content B</p>
</div>
</div>
`);
    });

    it("should render grid container with grid-cols utility", () => {
      expect(
        markdownIt.render(`\
@grids grid-cols-3 gap-8
@grid
Item 1
@grid
Item 2
@grid
Item 3
@end
`),
      ).toBe(`\
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2rem">
<div>
<p>Item 1</p>
</div>
<div>
<p>Item 2</p>
</div>
<div>
<p>Item 3</p>
</div>
</div>
`);
    });

    it("should support col-span utility on grid items", () => {
      expect(
        markdownIt.render(`\
@grids grid-cols-3
@grid col-span-2
Wide item
@grid
Normal item
@end
`),
      ).toBe(`\
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr))">
<div style="grid-column:span 2 / span 2">
<p>Wide item</p>
</div>
<div>
<p>Normal item</p>
</div>
</div>
`);
    });

    it("should support grid-rows utility", () => {
      expect(
        markdownIt.render(`\
@grids grid-rows-2
@grid
A
@end
`),
      ).toBe(`\
<div style="display:grid;grid-template-rows:repeat(2,minmax(0,1fr))">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should support col-span-full and row-span-full", () => {
      expect(
        markdownIt.render(`\
@grids grid-cols-3
@grid col-span-full
Full width
@grid row-span-full
Full height
@end
`),
      ).toBe(`\
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr))">
<div style="grid-column:1 / -1">
<p>Full width</p>
</div>
<div style="grid-row:1 / -1">
<p>Full height</p>
</div>
</div>
`);
    });

    it("should support col-start and col-end utilities", () => {
      expect(
        markdownIt.render(`\
@grids grid-cols-4
@grid col-start-2 col-end-4
Content
@end
`),
      ).toBe(`\
<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr))">
<div style="grid-column-start:2;grid-column-end:4">
<p>Content</p>
</div>
</div>
`);
    });

    it("should support row-start and row-end utilities", () => {
      expect(
        markdownIt.render(`\
@grids
@grid row-start-1 row-end-3
Content
@end
`),
      ).toBe(`\
<div style="display:grid">
<div style="grid-row-start:1;grid-row-end:3">
<p>Content</p>
</div>
</div>
`);
    });

    it("should support row-span utility", () => {
      expect(
        markdownIt.render(`\
@grids
@grid row-span-2
Content
@end
`),
      ).toBe(`\
<div style="display:grid">
<div style="grid-row:span 2 / span 2">
<p>Content</p>
</div>
</div>
`);
    });

    it("should support grid auto flow utilities", () => {
      expect(
        markdownIt.render(`\
@grids grid-flow-col
@grid
A
@end
`),
      ).toBe(`\
<div style="display:grid;grid-auto-flow:column">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should support grid auto columns and rows utilities", () => {
      expect(
        markdownIt.render(`\
@grids auto-cols-fr auto-rows-min
@grid
A
@end
`),
      ).toBe(`\
<div style="display:grid;grid-auto-columns:minmax(0,1fr);grid-auto-rows:min-content">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should support grid-cols-none and grid-rows-none", () => {
      expect(
        markdownIt.render(`\
@grids grid-cols-none grid-rows-none
@grid
A
@end
`),
      ).toBe(`\
<div style="display:grid;grid-template-columns:none;grid-template-rows:none">
<div>
<p>A</p>
</div>
</div>
`);
    });
  });

  describe("multi-column layout", () => {
    it("should render basic column container with items", () => {
      expect(
        markdownIt.render(`\
@columns
@column
Content A
@column
Content B
@end
`),
      ).toBe(`\
<div>
<div>
<p>Content A</p>
</div>
<div>
<p>Content B</p>
</div>
</div>
`);
    });

    it("should render column container with columns utility", () => {
      expect(
        markdownIt.render(`\
@columns columns-3 gap-6
@column
Content A
@column
Content B
@end
`),
      ).toBe(`\
<div style="columns:3;gap:1.5rem">
<div>
<p>Content A</p>
</div>
<div>
<p>Content B</p>
</div>
</div>
`);
    });

    it("should handle .span-all on column items", () => {
      expect(
        markdownIt.render(`\
@columns columns-3
@column
Normal content
@column.span-all
Spanning content
@end
`),
      ).toBe(`\
<div style="columns:3">
<div>
<p>Normal content</p>
</div>
<div style="column-span:all" class="span-all">
<p>Spanning content</p>
</div>
</div>
`);
    });

    it("should support break utilities", () => {
      expect(
        markdownIt.render(`\
@columns columns-3
@column break-inside-avoid
Content
@end
`),
      ).toBe(`\
<div style="columns:3">
<div style="break-inside:avoid">
<p>Content</p>
</div>
</div>
`);
    });
  });

  describe("gap utilities", () => {
    it("should support gap-x and gap-y", () => {
      expect(
        markdownIt.render(`\
@grids gap-x-4 gap-y-2
@grid
A
@end
`),
      ).toBe(`\
<div style="display:grid;column-gap:1rem;row-gap:0.5rem">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should support gap-px, gap-x-px, gap-y-px", () => {
      expect(
        markdownIt.render(`\
@flexs gap-px
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex;gap:1px">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should support gap-0", () => {
      expect(
        markdownIt.render(`\
@flexs gap-0
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex;gap:0rem">
<div>
<p>A</p>
</div>
</div>
`);
    });
  });

  describe("justify utilities", () => {
    it("should support all justify-content values", () => {
      const values = [
        ["justify-start", "justify-content:flex-start"],
        ["justify-end", "justify-content:flex-end"],
        ["justify-center", "justify-content:center"],
        ["justify-between", "justify-content:space-between"],
        ["justify-around", "justify-content:space-around"],
        ["justify-evenly", "justify-content:space-evenly"],
        ["justify-stretch", "justify-content:stretch"],
      ];

      for (const [utility, style] of values) {
        expect(
          markdownIt.render(`\
@flexs ${utility}
@flex
A
@end
`),
        ).toBe(`\
<div style="display:flex;${style}">
<div>
<p>A</p>
</div>
</div>
`);
      }
    });

    it("should support justify-items and justify-self", () => {
      expect(
        markdownIt.render(`\
@grids justify-items-center
@grid justify-self-end
A
@end
`),
      ).toBe(`\
<div style="display:grid;justify-items:center">
<div style="justify-self:end">
<p>A</p>
</div>
</div>
`);
    });
  });

  describe("align utilities", () => {
    it("should support align-content values", () => {
      expect(
        markdownIt.render(`\
@flexs content-center
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex;align-content:center">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should support align-self values", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex self-center
A
@end
`),
      ).toBe(`\
<div style="display:flex">
<div style="align-self:center">
<p>A</p>
</div>
</div>
`);
    });
  });

  describe("place utilities", () => {
    it("should support place-content, place-items, place-self", () => {
      expect(
        markdownIt.render(`\
@grids place-content-center place-items-start
@grid place-self-end
A
@end
`),
      ).toBe(`\
<div style="display:grid;place-content:center;place-items:start">
<div style="place-self:end">
<p>A</p>
</div>
</div>
`);
    });
  });

  describe("aspect ratio utilities", () => {
    it("should support aspect ratio values", () => {
      expect(
        markdownIt.render(`\
@grids
@grid aspect-video
A
@grid aspect-square
B
@end
`),
      ).toBe(`\
<div style="display:grid">
<div style="aspect-ratio:16 / 9">
<p>A</p>
</div>
<div style="aspect-ratio:1 / 1">
<p>B</p>
</div>
</div>
`);
    });
  });

  describe("multiple classes and id", () => {
    it("should support multiple classes", () => {
      expect(
        markdownIt.render(`\
@flexs.nav.sidebar
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex" class="nav sidebar">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should support id on items", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex#main
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div id="main">
<p>Content</p>
</div>
</div>
`);
    });

    it("should support class and id on items", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex.content#main
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div class="content" id="main">
<p>Content</p>
</div>
</div>
`);
    });
  });

  describe("zero-indent nesting", () => {
    it("should support zero-indent nesting (same level)", () => {
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

    it("should handle multiple levels of zero-indent nesting", () => {
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

    it("should handle content before nested container", () => {
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

    it("should handle content after nested container", () => {
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

    it("should handle multiple siblings after nested container", () => {
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

  describe("prefix-based nesting (@@)", () => {
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
      expect(
        markdownIt.render(`\
- item 1
  @flexs
  @flex
  Flex inside list
  @end
`),
      ).toBe(`\
<ul>
<li>item 1<div style="display:flex">
<div>
<p>Flex inside list</p>
</div>
</div>
</li>
</ul>
`);
    });

    it("should work inside ordered list", () => {
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
      ).toBe(`\
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
`);
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

    it("should work in nested list inside layout", () => {
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

describe(parseAttributes, () => {
  it("should stop parsing on unexpected character", () => {
    const result = parseAttributes("!unexpected", 0, 11);

    expect(result).toEqual({ classes: [], id: "", utilities: [] });
  });
});
