import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
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

  describe("syntax", () => {
    it("should not match @flexs inside a word", () => {
      expect(
        markdownIt.render(`\
some@flexs text
`),
      ).toBe(`\
<p>some@flexs text</p>
`);
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

    describe("empty", () => {
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

      it("should not match other items inside flex container", () => {
        expect(
          markdownIt.render(`\
@flexs
@grid
A
@flex
B
@column
C
@end
`),
        ).toBe(`\
<div style="display:flex">
<p>@grid
A</p>
<div>
<p>B
@column
C</p>
</div>
</div>
`);
      });
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
  });
});
