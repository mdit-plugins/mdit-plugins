import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layoutSlim } from "../src/index.js";

const markdownIt = MarkdownIt().use(layoutSlim);

describe(layoutSlim, () => {
  describe("flexbox layout", () => {
    it("should render flex container with utilities as classes", () => {
      expect(
        markdownIt.render(`\
@flexs gap-4 items-center
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex" class="gap-4 items-center">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should render flex items with utilities as classes", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex flex-1
Content A
@flex flex-none
Content B
@end
`),
      ).toBe(`\
<div style="display:flex">
<div class="flex-1">
<p>Content A</p>
</div>
<div class="flex-none">
<p>Content B</p>
</div>
</div>
`);
    });

    it("should render flex container with class and id selectors", () => {
      expect(
        markdownIt.render(`\
@flexs.nav#top gap-4
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex" class="nav gap-4" id="top">
<div>
<p>Content</p>
</div>
</div>
`);
    });
  });

  describe("grid layout", () => {
    it("should render grid container with utilities as classes", () => {
      expect(
        markdownIt.render(`\
@grids grid-cols-3 gap-8
@grid
Item
@end
`),
      ).toBe(`\
<div style="display:grid" class="grid-cols-3 gap-8">
<div>
<p>Item</p>
</div>
</div>
`);
    });

    it("should render grid items with utilities as classes", () => {
      expect(
        markdownIt.render(`\
@grids
@grid col-span-2
Wide item
@grid
Normal
@end
`),
      ).toBe(`\
<div style="display:grid">
<div class="col-span-2">
<p>Wide item</p>
</div>
<div>
<p>Normal</p>
</div>
</div>
`);
    });
  });

  describe("multi-column layout", () => {
    it("should render column container without base display", () => {
      expect(
        markdownIt.render(`\
@columns columns-3 gap-6
@column
Content
@end
`),
      ).toBe(`\
<div class="columns-3 gap-6">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should handle .span-all on column items as class only", () => {
      expect(
        markdownIt.render(`\
@columns
@column.span-all
Spanning content
@end
`),
      ).toBe(`\
<div>
<div class="span-all">
<p>Spanning content</p>
</div>
</div>
`);
    });
  });

  describe("nesting", () => {
    it("should support nested containers", () => {
      expect(
        markdownIt.render(`\
@grids grid-cols-2
@grid
  @flexs flex-col
  @flex
  Nested
  @end
@end
`),
      ).toBe(`\
<div style="display:grid" class="grid-cols-2">
<div>
<div style="display:flex" class="flex-col">
<div>
<p>Nested</p>
</div>
</div>
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
  });
});
