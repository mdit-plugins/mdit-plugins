import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

describe(layout, () => {
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
});
