import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { footnote } from "../src/index.js";

const source = "A[^a]\n\n[^a]: note";

const render = (options: Parameters<typeof footnote>[1]): string =>
  new MarkdownIt().use(footnote, options).render(source);

describe("footnote options", () => {
  it("should apply refAttrs to the reference marker", () => {
    const output = render({ refAttrs: { class: "custom-ref", "data-kind": "reference" } });

    expect(output).toContain('<sup class="footnote-ref custom-ref" data-kind="reference">');
  });

  it("should apply itemAttrs to footnote items", () => {
    const output = render({ itemAttrs: { class: "custom-item", "data-kind": "item" } });

    expect(output).toContain(
      '<li id="footnote1" class="footnote-item custom-item" data-kind="item">',
    );
  });

  it("should apply backrefAttrs to back-reference links", () => {
    const output = render({ backrefAttrs: { class: "custom-backref", "aria-label": "back" } });

    expect(output).toContain(
      '<a href="#footnote-ref1" class="footnote-backref custom-backref" aria-label="back">',
    );
  });

  it("should apply containerAttrs to the footnote container", () => {
    const output = render({ containerAttrs: { class: "custom-container", "aria-label": "notes" } });

    expect(output).toContain('<section class="footnotes custom-container" aria-label="notes">');
  });

  it("should apply refAttrs to every reference marker", () => {
    const output = new MarkdownIt()
      .use(footnote, { refAttrs: { class: "custom-ref" } })
      .render("A[^a] B[^a]\n\n[^a]: note");

    expect(output.match(/class="footnote-ref custom-ref"/g)).toHaveLength(2);
  });

  it("should apply itemAttrs to every footnote item", () => {
    const output = new MarkdownIt()
      .use(footnote, { itemAttrs: { class: "custom-item" } })
      .render("A[^a] B[^b]\n\n[^a]: one\n\n[^b]: two");

    expect(output.match(/class="footnote-item custom-item"/g)).toHaveLength(2);
  });

  it("should apply backrefAttrs to every back-reference", () => {
    const output = new MarkdownIt()
      .use(footnote, { backrefAttrs: { class: "custom-backref" } })
      .render("A[^a] B[^a]\n\n[^a]: note");

    expect(output.match(/class="footnote-backref custom-backref"/g)).toHaveLength(2);
  });

  it("should allow overriding the generated back-reference href", () => {
    const output = render({ backrefAttrs: { href: "#custom-backref" } });

    expect(output).toContain('href="#custom-backref"');
    expect(output).not.toContain('href="#footnote-ref1"');
  });

  it("should escape option attribute values", () => {
    const payload = '"><script>alert(1)</script>';
    const output = render({ refAttrs: { "data-payload": payload } });

    expect(output).not.toContain("<script>");
    expect(output).toContain('data-payload="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"');
  });

  it("should allow generated attributes to be overridden", () => {
    const output = render({
      refAttrs: { "data-kind": "reference" },
      itemAttrs: { id: "custom-item" },
    });

    expect(output).toContain('<li id="custom-item" class="footnote-item">');
  });

  it("should ignore an empty class value", () => {
    const output = render({ refAttrs: { class: "" } });

    expect(output).toContain('<sup class="footnote-ref">');
    expect(output).not.toContain('class="footnote-ref "');
  });
});
