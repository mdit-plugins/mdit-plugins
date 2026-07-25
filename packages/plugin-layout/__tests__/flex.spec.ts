import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
  describe("flex layout", () => {
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
});
