import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { layout } from "../src/index.js";

const markdownIt = new MarkdownIt().use(layout);

describe(layout, () => {
  describe("whitespace handling", () => {
    it("should accept a tab as directive boundary", () => {
      expect(
        markdownIt.render(`\
@flexs\titems-center
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex;align-items:center">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should accept a tab after a class selector", () => {
      expect(
        markdownIt.render(`\
@flexs.nav\tgap-4
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex;gap:1rem" class="nav">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should skip a tab between the directive and its utilities", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex \titems-center
A
@end
`),
      ).toBe(`\
<div style="display:flex">
<div style="align-items:center">
<p>A</p>
</div>
</div>
`);
    });

    it("should accept a tab as separator between utilities", () => {
      expect(
        markdownIt.render(`\
@flexs\tgap-4\titems-center
@flex
A
@end
`),
      ).toBe(`\
<div style="display:flex;gap:1rem;align-items:center">
<div>
<p>A</p>
</div>
</div>
`);
    });

    it("should close a container with @end followed by a tab", () => {
      expect(
        markdownIt.render(`\
@flexs
@flex\tflex-1
A
@end\t
`),
      ).toBe(`\
<div style="display:flex">
<div style="flex:1 1 0%">
<p>A</p>
</div>
</div>
`);
    });

    it("should not warn about trailing whitespace after a directive", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(
        markdownIt.render(`\
@flexs
@flex \t
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

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
