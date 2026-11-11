import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import type { FootnoteOptions } from "../src/index.js";
import { footnote } from "../src/index.js";

const createMarkdown = (options: FootnoteOptions): MarkdownItType =>
  new MarkdownIt().use(footnote, options);

describe("footnote options", () => {
  it("should add refAttrs to footnote references", () => {
    const output = createMarkdown({ refAttrs: { class: "custom-ref", "data-ref": "1" } }).render(
      "text[^1]\n\n[^1]: note",
    );

    expect(output).toContain('<sup class="footnote-ref custom-ref" data-ref="1">');
  });

  it("should add refAttrs to inline footnotes", () => {
    const output = createMarkdown({ refAttrs: { class: "custom-ref" } }).render("text^[note]");

    expect(output).toContain('<sup class="footnote-ref custom-ref">');
  });

  it("should add itemAttrs to footnote items", () => {
    const output = createMarkdown({ itemAttrs: { class: "custom-item", "data-item": "1" } }).render(
      "text[^1]\n\n[^1]: note",
    );

    expect(output).toContain('<li id="footnote1" class="footnote-item custom-item" data-item="1">');
  });

  it("should allow overriding the generated id with itemAttrs", () => {
    const output = createMarkdown({ itemAttrs: { id: "custom" } }).render("text[^1]\n\n[^1]: note");

    expect(output).toContain('<li id="custom" class="footnote-item">');
  });

  it("should add backrefAttrs to back references", () => {
    const output = createMarkdown({
      backrefAttrs: { class: "custom-backref", "aria-label": "back" },
    }).render("text[^1]\n\n[^1]: note");

    expect(output).toContain(
      '<a href="#footnote-ref1" class="footnote-backref custom-backref" aria-label="back">',
    );
  });

  it("should allow overriding the generated back reference href", () => {
    const output = createMarkdown({ backrefAttrs: { href: "#top" } }).render(
      "text[^1]\n\n[^1]: note",
    );

    expect(output).toContain('<a href="#top" class="footnote-backref">');
  });

  it("should add containerAttrs to the footnote section", () => {
    const output = createMarkdown({
      containerAttrs: { class: "custom-section", "data-x": "1", id: "notes" },
    }).render("text[^1]\n\n[^1]: note");

    expect(output).toContain('<section class="footnotes custom-section" data-x="1" id="notes">');
  });

  it("should ignore invalid attribute names", () => {
    const output = createMarkdown({
      refAttrs: { "": "empty", "x onmouseover": 'alert("1")', "data-ok": "1" },
    }).render("text[^1]\n\n[^1]: note");

    expect(output).toContain('<sup class="footnote-ref" data-ok="1">');
    expect(output).not.toContain("onmouseover");
    expect(output).not.toContain('=""');
  });

  it("should ignore empty class values", () => {
    const output = createMarkdown({ refAttrs: { class: "" } }).render("text[^1]\n\n[^1]: note");

    expect(output).toContain('<sup class="footnote-ref">');
  });

  it("should escape attribute values", () => {
    const output = createMarkdown({
      refAttrs: { "data-x": '" <b>' },
      containerAttrs: { id: 'a"b' },
    }).render("text[^1]\n\n[^1]: note");

    expect(output).toContain('<sup class="footnote-ref" data-x="&quot; &lt;b&gt;">');
    expect(output).toContain('<section class="footnotes" id="a&quot;b">');
    expect(output).not.toContain("<b>");
  });
});
