import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { footnote } from "../src/index.js";

describe("footnote security", () => {
  it("should escape env.docId in generated ids and hrefs", () => {
    const docId = '"><script>alert(1)</script>';
    const output = new MarkdownIt().use(footnote).render("ref[^1]\n\n[^1]: note", { docId });

    expect(output).not.toContain("<script>");
    expect(output).not.toContain('docId="');
    expect(output).toContain("&lt;script&gt;");
    expect(output).toContain("#footnote-&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;-1");
    expect(output).toContain('id="footnote-&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;-1"');
  });

  it("should keep normal docId output unchanged", () => {
    const output = new MarkdownIt()
      .use(footnote)
      .render("ref[^1]\n\n[^1]: note", { docId: "test-doc-id" });

    expect(output).toContain('href="#footnote-test-doc-id-1"');
    expect(output).toContain('id="footnote-test-doc-id-1"');
  });
});
