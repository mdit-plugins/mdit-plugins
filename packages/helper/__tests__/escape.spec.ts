import { describe, expect, it } from "vitest";

import { escapeHtml, escapeRegExp } from "../src/index.js";

describe("escapeHtml", () => {
  it("should escape & to &amp;", () => {
    expect(escapeHtml("&")).toBe("&amp;");
  });

  it("should escape < to &lt;", () => {
    expect(escapeHtml("<")).toBe("&lt;");
  });

  it("should escape > to &gt;", () => {
    expect(escapeHtml(">")).toBe("&gt;");
  });

  it('should escape " to &quot;', () => {
    expect(escapeHtml('"')).toBe("&quot;");
  });

  it("should escape ' to &#39;", () => {
    expect(escapeHtml("'")).toBe("&#39;");
  });

  it("should escape multiple characters", () => {
    expect(escapeHtml('<div class="test">Hello & welcome!</div>')).toBe(
      "&lt;div class=&quot;test&quot;&gt;Hello &amp; welcome!&lt;/div&gt;",
    );
  });
});

describe("escapeRegExp", () => {
  it("should escape special characters for RegExp", () => {
    expect(escapeRegExp("[test]")).toBe("\\[test\\]");
    expect(escapeRegExp("a+b")).toBe("a\\+b");
    expect(escapeRegExp("a*b")).toBe("a\\*b");
    expect(escapeRegExp("a?b")).toBe("a\\?b");
    expect(escapeRegExp("a.b")).toBe("a\\.b");
    expect(escapeRegExp("a(b)c")).toBe("a\\(b\\)c");
    expect(escapeRegExp("a{b}c")).toBe("a\\{b\\}c");
    expect(escapeRegExp("a|b")).toBe("a\\|b");
    expect(escapeRegExp("a^b")).toBe("a\\^b");
    expect(escapeRegExp("a$b")).toBe("a\\$b");
    expect(escapeRegExp("a\\b")).toBe("a\\\\b");
  });
});
