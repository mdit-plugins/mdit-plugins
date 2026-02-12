import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = MarkdownIt().use(layout);

describe(layout, () => {
  describe("classes and id", () => {
    it("should support multiple classes", () => {
      expect(
        markdownIt.render(`\
@flexs.nav.sidebar
@flex
Content
@end
`),
      ).toBe(`\
<div style="display:flex" class="nav sidebar">
<div>
<p>Content</p>
</div>
</div>
`);
    });

    it("should support id on items", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex#main
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div id="main">
<p>Content</p>
</div>
</div>
`);
    });

    it("should support class and id on items", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex.content#main
Content
@end
`),
      ).toBe(`\
<div style="display:flex">
<div class="content" id="main">
<p>Content</p>
</div>
</div>
`);
    });
  });
});
