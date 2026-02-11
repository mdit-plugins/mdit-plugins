import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

describe(inlineRule, () => {
  describe("nested (delimiter state machine)", () => {
    describe("ins configuration (marker: +, double: true, tag: ins)", () => {
      const md = MarkdownIt({ linkify: true }).use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        double: true,
        nested: true,
        placement: "before-emphasis",
      });

      it("should render", () => {
        expect(md.render("++Insert++")).toEqual("<p><ins>Insert</ins></p>\n");
      });

      it("Can nested", () => {
        const testCases = [
          ["x ++++foo++ bar++", "<p>x <ins><ins>foo</ins> bar</ins></p>\n"],
          ["x ++foo ++bar++++", "<p>x <ins>foo <ins>bar</ins></ins></p>\n"],
          ["x ++++foo++++", "<p>x <ins><ins>foo</ins></ins></p>\n"],
          ["++foo ++bar++ baz++", "<p><ins>foo <ins>bar</ins> baz</ins></p>\n"],
          [
            "++f **o ++o b++ a** r++",
            "<p><ins>f <strong>o <ins>o b</ins> a</strong> r</ins></p>\n",
          ],
        ];

        testCases.forEach(([input, expected]) => {
          expect(md.render(input)).toEqual(expected);
        });
      });

      it("should handle multiple '+'", () => {
        expect(md.render("x +++foo+++")).toEqual("<p>x +<ins>foo</ins>+</p>\n");
      });

      it("Have the same priority as emphases", () => {
        expect(md.render("**++test**++")).toEqual("<p><strong>++test</strong>++</p>\n");
        expect(md.render("++**test++**")).toEqual("<p><ins>**test</ins>**</p>\n");
      });

      it("Have the same priority as emphases with respect to links", () => {
        expect(md.render("[++link]()++")).toEqual('<p><a href="">++link</a>++</p>\n');
        expect(md.render("++[link++]()")).toEqual('<p>++<a href="">link++</a></p>\n');
      });

      it("Have the same priority as emphases with respect to backticks", () => {
        expect(md.render("++`code++`")).toEqual("<p>++<code>code++</code></p>\n");
        expect(md.render("` ++ code`++")).toEqual("<p><code> ++ code</code>++</p>\n");
      });

      it('should not render with single "+"', () => {
        expect(md.render("+Insert+")).toEqual("<p>+Insert+</p>\n");
      });

      it("should not render with empty content", () => {
        expect(md.render("++++")).toEqual("<p>++++</p>\n");
        expect(md.render("++++ a")).toEqual("<p>++++ a</p>\n");
        expect(md.render("a ++++")).toEqual("<p>a ++++</p>\n");
        expect(md.render("a ++++ a")).toEqual("<p>a ++++ a</p>\n");
      });

      it("should not render a whitespace or newline between text and '++'", () => {
        expect(md.render("foo ++ bar ++ baz")).toEqual("<p>foo ++ bar ++ baz</p>\n");
        expect(md.render("++test\n++ a\n")).toEqual("<p>++test\n++ a</p>\n");
        expect(md.render("++\ntest++\n")).toEqual("<p>++\ntest++</p>\n");
      });
    });

    describe("mark configuration (marker: =, double: true, tag: mark)", () => {
      const md = MarkdownIt({ linkify: true }).use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        double: true,
        nested: true,
        placement: "before-emphasis",
      });

      it("should render", () => {
        expect(md.render("==Mark==")).toEqual("<p><mark>Mark</mark></p>\n");
      });

      it("Can nested", () => {
        const testCases = [
          ["x ====foo== bar==", "<p>x <mark><mark>foo</mark> bar</mark></p>\n"],
          ["x ==foo ==bar====", "<p>x <mark>foo <mark>bar</mark></mark></p>\n"],
          ["x ====foo====", "<p>x <mark><mark>foo</mark></mark></p>\n"],
          ["==foo ==bar== baz==", "<p><mark>foo <mark>bar</mark> baz</mark></p>\n"],
          [
            "==f **o ==o b== a** r==",
            "<p><mark>f <strong>o <mark>o b</mark> a</strong> r</mark></p>\n",
          ],
        ];

        testCases.forEach(([input, expected]) => {
          expect(md.render(input)).toEqual(expected);
        });
      });

      it("should handle multiple '='", () => {
        expect(md.render("x ===foo===")).toEqual("<p>x =<mark>foo</mark>=</p>\n");
      });

      it("Have the same priority as emphases", () => {
        expect(md.render("**==test**==")).toEqual("<p><strong>==test</strong>==</p>\n");
        expect(md.render("==**test==**")).toEqual("<p><mark>**test</mark>**</p>\n");
      });

      it("Have the same priority as emphases with respect to links", () => {
        expect(md.render("[==link]()==")).toEqual('<p><a href="">==link</a>==</p>\n');
        expect(md.render("==[link==]()")).toEqual('<p>==<a href="">link==</a></p>\n');
      });

      it("Have the same priority as emphases with respect to backticks", () => {
        expect(md.render("==`code==`")).toEqual("<p>==<code>code==</code></p>\n");
        expect(md.render("` == code`==")).toEqual("<p><code> == code</code>==</p>\n");
      });

      it('should not render with single "="', () => {
        expect(md.render("=mark=")).toEqual("<p>=mark=</p>\n");
      });

      it("should not render with empty content", () => {
        expect(md.render("====")).toEqual("<p>====</p>\n");
        expect(md.render("==== a")).toEqual("<p>==== a</p>\n");
        expect(md.render("a ====")).toEqual("<p>a ====</p>\n");
        expect(md.render("a ==== a")).toEqual("<p>a ==== a</p>\n");
      });

      it("should not render a whitespace or newline between text and '=='", () => {
        expect(md.render("foo == bar == baz")).toEqual("<p>foo == bar == baz</p>\n");
        expect(md.render("==test\n== a\n")).toEqual("<p>==test\n== a</p>\n");
        expect(md.render("==\ntest==\n")).toEqual("<p>==\ntest==</p>\n");
        expect(md.render("==\ntest\n==\n")).toEqual("<h1>==\ntest</h1>\n");
      });
    });

    describe("spoiler configuration (marker: !, double: true, tag: span, attrs)", () => {
      const md = MarkdownIt({ linkify: true }).use(inlineRule, {
        marker: "!",
        tag: "span",
        token: "spoiler",
        double: true,
        nested: true,
        placement: "before-emphasis",
        attrs: [
          ["class", "spoiler"],
          ["tabindex", "-1"],
        ],
      });

      it("should render", () => {
        expect(md.render("!!Mark!!")).toEqual(
          '<p><span class="spoiler" tabindex="-1">Mark</span></p>\n',
        );
      });

      it("Can nested", () => {
        const testCases = [
          [
            "x !!!!foo!! bar!!",
            '<p>x <span class="spoiler" tabindex="-1"><span class="spoiler" tabindex="-1">foo</span> bar</span></p>\n',
          ],
          [
            "x !!foo !!bar!!!!",
            '<p>x <span class="spoiler" tabindex="-1">foo <span class="spoiler" tabindex="-1">bar</span></span></p>\n',
          ],
          [
            "x !!!!foo!!!!",
            '<p>x <span class="spoiler" tabindex="-1"><span class="spoiler" tabindex="-1">foo</span></span></p>\n',
          ],
          [
            "!!foo !!bar!! baz!!",
            '<p><span class="spoiler" tabindex="-1">foo <span class="spoiler" tabindex="-1">bar</span> baz</span></p>\n',
          ],
          [
            "!!f **o !!o b!! a** r!!",
            '<p><span class="spoiler" tabindex="-1">f <strong>o <span class="spoiler" tabindex="-1">o b</span> a</strong> r</span></p>\n',
          ],
        ];

        testCases.forEach(([input, expected]) => {
          expect(md.render(input)).toEqual(expected);
        });
      });

      it("should handle multiple '!'", () => {
        expect(md.render("x !!!foo!!!")).toEqual(
          '<p>x !<span class="spoiler" tabindex="-1">foo</span>!</p>\n',
        );
      });

      it("Have the same priority as emphases", () => {
        expect(md.render("**!!test**!!")).toEqual("<p><strong>!!test</strong>!!</p>\n");
        expect(md.render("!!**test!!**")).toEqual(
          '<p><span class="spoiler" tabindex="-1">**test</span>**</p>\n',
        );
      });

      it("Have the same priority as emphases with respect to links", () => {
        expect(md.render("[!!link]()!!")).toEqual('<p><a href="">!!link</a>!!</p>\n');
        expect(md.render("!![link!!]()")).toEqual('<p>!!<a href="">link!!</a></p>\n');
      });

      it('should not render with single "!"', () => {
        expect(md.render("!text!")).toEqual("<p>!text!</p>\n");
      });

      it("should not render with empty content", () => {
        expect(md.render("!!!!")).toEqual("<p>!!!!</p>\n");
        expect(md.render("!!!! a")).toEqual("<p>!!!! a</p>\n");
        expect(md.render("a !!!!")).toEqual("<p>a !!!!</p>\n");
        expect(md.render("a !!!! a")).toEqual("<p>a !!!! a</p>\n");
      });

      it("Have the same priority as emphases with respect to backticks", () => {
        expect(md.render("!!`code!!`")).toEqual("<p>!!<code>code!!</code></p>\n");
        expect(md.render("` !! code`!!")).toEqual("<p><code> !! code</code>!!</p>\n");
      });

      it("should not render a whitespace or newline between text and '!!'", () => {
        expect(md.render("foo !! bar !! baz")).toEqual("<p>foo !! bar !! baz</p>\n");
        expect(md.render("!!test\n!! a\n")).toEqual("<p>!!test\n!! a</p>\n");
        expect(md.render("!!\ntest!!\n")).toEqual("<p>!!\ntest!!</p>\n");
      });
    });
  });
});
