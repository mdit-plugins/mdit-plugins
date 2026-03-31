import { figure } from "@mdit/plugin-figure";
import { katex } from "@mdit/plugin-katex";
import { mark } from "@mdit/plugin-mark";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { attrs } from "../src/index.js";

describe("plugin compatibility", () => {
  it("should work with katex plugin", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(attrs).use(katex);

    expect(markdownIt.render("$a^{3}$")).toBe(
      '<p><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>a</mi><mn>3</mn></msup></mrow><annotation encoding="application/x-tex">a^{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span></span></span></span></span></span></span></span></p>\n',
    );
  });

  describe("should work with mark plugin", () => {
    const markdownIt = MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })
      .use(mark)
      .use(attrs);

    it("should apply inline attrs to mark element via render", () => {
      expect(markdownIt.render("==text=={.desc}")).toBe('<p><mark class="desc">text</mark></p>\n');
    });

    it("should apply inline attrs to link containing mark tokens via render", () => {
      expect(markdownIt.render("[text with ==mark==](url){.c}")).toBe(
        '<p><a href="url" class="c">text with <mark>mark</mark></a></p>\n',
      );
    });

    it("should apply inline attrs to mark element via renderInline", () => {
      expect(markdownIt.renderInline("==text=={.desc}")).toBe('<mark class="desc">text</mark>');
    });

    it("should not throw when using renderInline with softbreak followed by attrs", () => {
      // renderInline produces only one top-level token (the inline token), so
      // getMatchingOpeningToken(tokens, index+1) accesses tokens[1] which is undefined.
      // The null guard in getMatchingOpeningToken prevents a TypeError here.
      // Attrs are silently ignored (no block target) and softbreak+attrs tokens are consumed.
      expect(() => markdownIt.renderInline("==text==\n{.desc}")).not.toThrow();
      expect(markdownIt.renderInline("==text==\n{.desc}")).toBe("<mark>text</mark>");
    });
  });

  describe("should work with figure plugin", () => {
    const markdownIt = MarkdownIt({ html: true }).use(attrs).use(figure);

    it("should add class to image inside figure", () => {
      // attrs processes inline content before figure transforms paragraph to figure
      // so attrs are applied to the image token, which ends up inside the figure
      expect(markdownIt.render(`![image](/logo.svg "caption"){.center}`)).toBe(
        '<figure><img src="/logo.svg" alt="image" class="center" tabindex="0"><figcaption>caption</figcaption></figure>\n',
      );
    });

    it("should add id to image inside figure", () => {
      expect(markdownIt.render(`![image](/logo.svg "caption"){#hero}`)).toBe(
        '<figure><img src="/logo.svg" alt="image" id="hero" tabindex="0"><figcaption>caption</figcaption></figure>\n',
      );
    });

    it("should add attributes to image inside figure", () => {
      expect(markdownIt.render(`![image](/logo.svg "caption"){data-theme=light}`)).toBe(
        '<figure><img src="/logo.svg" alt="image" data-theme="light" tabindex="0"><figcaption>caption</figcaption></figure>\n',
      );
    });

    it("should add multiple attributes to image inside figure", () => {
      expect(
        markdownIt.render(`![image](/logo.svg "caption"){.center #hero data-theme=light}`),
      ).toBe(
        '<figure><img src="/logo.svg" alt="image" class="center" id="hero" data-theme="light" tabindex="0"><figcaption>caption</figcaption></figure>\n',
      );
    });

    it("should work with linked images in figure", () => {
      // Linked images in figure without attrs work correctly
      expect(markdownIt.render(`[![image](/logo.svg)](https://example.com)`)).toBe(
        '<figure><a href="https://example.com"><img src="/logo.svg" alt="image" tabindex="0"></a><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should work with figure disabled focusable", () => {
      const md = MarkdownIt({ html: true }).use(attrs).use(figure, { focusable: false });
      expect(md.render(`![image](/logo.svg "caption"){.center}`)).toBe(
        '<figure><img src="/logo.svg" alt="image" class="center"><figcaption>caption</figcaption></figure>\n',
      );
    });
  });
});
