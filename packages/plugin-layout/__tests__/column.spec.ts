import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
  describe("column layout", () => {
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

    describe("should support break utilities", () => {
      it("should support break-inside values", () => {
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
  });
});
