import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = new MarkdownIt().use(layout);

describe(layout, () => {
  describe("indentation", () => {
    it("should keep content inside an item that is not indented", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should keep 0-3 spaces indented content inside the current item", () => {
      expect(
        markdownIt.render(`\
@flexs
   @flex
Content
  Indented content
   @flex
Next
   @end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>Content
Indented content</p>
</div>
<div>
<p>Next</p>
</div>
</div>
`);
    });

    it("should not truncate an item when the next item is indented differently", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
First
  @flex
Second
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>First</p>
</div>
<div>
<p>Second</p>
</div>
</div>
`);
    });

    it("should keep blank lines inside an item", () => {
      expect(
        markdownIt.render(`\
@flexs
  @flex
  First

  Second
@end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>First</p>
<p>Second</p>
</div>
</div>
`);
    });

    it("should close a container with a 0-3 spaces indented @end", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
A
   @end
After
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>A</p>
</div>
</div>
<p>After</p>
`);
    });
  });

  describe("4-space indentation", () => {
    it("should render a 4-space indented @end inside an item as an indented code block", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
A

    @end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>A</p>
<pre><code>@end
</code></pre>
</div>
</div>
`);
    });

    it("should render a 4-space indented @flex inside an item as an indented code block", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex

    @flex
`),
      ).toBe(`\
<div style="display:flex">
<div>
<pre><code>@flex
</code></pre>
</div>
</div>
`);
    });

    it("should render a 4-space indented @flexs as an indented code block", () => {
      expect(
        markdownIt.render(`\
@flexs

    @flexs
`),
      ).toBe(`\
<div style="display:flex">
<pre><code>@flexs
</code></pre>
</div>
`);
    });

    it("should render a 4-space indented @end after a paragraph as lazy continuation", () => {
      expect(
        markdownIt.render(`\
@flexs
text
    @end
`),
      ).toBe(`\
<div style="display:flex">
<p>text
@end</p>
</div>
`);
    });

    it("should render a 4-space indented @end after item content as lazy continuation", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex
A
    @end
`),
      ).toBe(`\
<div style="display:flex">
<div>
<p>A
@end</p>
</div>
</div>
`);
    });
  });
});
