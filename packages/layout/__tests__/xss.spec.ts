import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
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
