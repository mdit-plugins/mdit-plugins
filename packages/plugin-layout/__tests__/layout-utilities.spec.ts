import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
  describe("utilities", () => {
    describe("gap", () => {
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

    describe("justify", () => {
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

    describe("align", () => {
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

    describe("place", () => {
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

    describe("aspect ratio", () => {
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

    describe("unrecognized", () => {
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

      it("should ignore unrecognized utilities on items in inline mode", () => {
        expect(
          markdownIt.render(`\
@flexs
@flex unknown-item-class
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
  });
});
