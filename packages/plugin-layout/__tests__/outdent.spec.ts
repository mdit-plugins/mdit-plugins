import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = new MarkdownIt().use(layout);

describe(layout, () => {
  describe("item outdent", () => {
    it("should return outdented content to the container instead of dropping it", () => {
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
</div>
<p>Content</p>
</div>
`);
    });

    it("should keep content after an outdented line when the next item is indented", () => {
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
</div>
<p>Second</p>
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
  });
});
