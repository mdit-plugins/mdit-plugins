import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
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
});
