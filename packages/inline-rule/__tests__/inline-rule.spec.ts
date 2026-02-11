import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { inlineRule } from "../src/index.js";

describe(inlineRule, () => {
  describe("non-nested (linear scan)", () => {
    describe("sup configuration (marker: ^, tag: sup)", () => {
      const md = MarkdownIt({ linkify: true }).use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      it("should render", () => {
        expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
      });

      it("should not render when escape", () => {
        expect(md.render(String.raw`^foo\^`)).toEqual("<p>^foo^</p>\n");
        expect(md.render(String.raw`\^foo^`)).toEqual("<p>^foo^</p>\n");
      });

      it("should not render when having spaces", () => {
        expect(md.render("2^4 + 3^5")).toEqual("<p>2^4 + 3^5</p>\n");
      });

      it("should render when spaces are escaped", () => {
        expect(md.render(String.raw`^foo\ bar\ baz^`)).toEqual("<p><sup>foo bar baz</sup></p>\n");
        expect(md.render(String.raw`^\ foo\ ^`)).toEqual("<p><sup> foo </sup></p>\n");
      });

      it("should render when having other symbols", () => {
        expect(md.render("^foo~bar^baz^bar~foo^")).toEqual(
          "<p><sup>foo~bar</sup>baz<sup>bar~foo</sup></p>\n",
        );
      });

      it(String.raw`should handle multiple '\'`, () => {
        expect(md.render(String.raw`^foo\\\\\\\ bar^`)).toEqual(
          "<p><sup>foo\\\\\\ bar</sup></p>\n",
        );
        expect(md.render(String.raw`^foo\\\\\\ bar^`)).toEqual("<p>^foo\\\\\\ bar^</p>\n");
      });

      it("should work with other marker", () => {
        expect(md.render("**^foo^ bar**")).toEqual("<p><strong><sup>foo</sup> bar</strong></p>\n");
        expect(md.render("*^f")).toEqual("<p>*^f</p>\n");
        expect(md.render("b*^")).toEqual("<p>b*^</p>\n");
      });
    });

    describe("sub configuration (marker: ~, tag: sub)", () => {
      const md = MarkdownIt({ linkify: true }).use(inlineRule, {
        marker: "~",
        tag: "sub",
        token: "sub",
      });

      it("should render", () => {
        expect(md.render("~test~")).toEqual("<p><sub>test</sub></p>\n");
      });

      it("should not render when escape", () => {
        expect(md.render(String.raw`~foo\~`)).toEqual("<p>~foo~</p>\n");
        expect(md.render(String.raw`\~foo~`)).toEqual("<p>~foo~</p>\n");
      });

      it("should not render when having spaces", () => {
        expect(md.render("~foo bar~")).toEqual("<p>~foo bar~</p>\n");
      });

      it("should render when spaces are escaped", () => {
        expect(md.render(String.raw`~foo\ bar\ baz~`)).toEqual("<p><sub>foo bar baz</sub></p>\n");
        expect(md.render(String.raw`~\ foo\ ~`)).toEqual("<p><sub> foo </sub></p>\n");
      });

      it(String.raw`should handle multiple '\'`, () => {
        expect(md.render(String.raw`~foo\\\\\ bar~`)).toEqual("<p><sub>foo\\\\ bar</sub></p>\n");
        expect(md.render(String.raw`~foo\\\\ bar~`)).toEqual("<p>~foo\\\\ bar~</p>\n");
      });

      it("should work with other marker", () => {
        expect(md.render("**~foo~ bar**")).toEqual("<p><strong><sub>foo</sub> bar</strong></p>\n");
        expect(md.render("*~f")).toEqual("<p>*~f</p>\n");
        expect(md.render("b*~")).toEqual("<p>b*~</p>\n");
      });
    });
  });

  describe("nested (delimiter state machine)", () => {
    describe("ins configuration (marker: +, double: true, tag: ins)", () => {
      const md = MarkdownIt({ linkify: true }).use(inlineRule, {
        marker: "+",
        tag: "ins",
        token: "ins",
        double: true,
        nested: true,
        at: "before",
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
        at: "before",
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
        at: "before",
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

  describe("allowSpace option", () => {
    it("should allow spaces when allowSpace is true", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
        allowSpace: true,
      });

      expect(md.render("^foo bar^")).toEqual("<p><sup>foo bar</sup></p>\n");
    });

    it("should disallow spaces when allowSpace is false (default)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^a b^")).toEqual("<p>^a b^</p>\n");
    });
  });

  describe("attrs option", () => {
    it("should apply attrs on non-nested rule", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "span",
        token: "custom",
        attrs: [["class", "custom"]],
      });

      expect(md.render("^test^")).toEqual('<p><span class="custom">test</span></p>\n');
    });

    it("should apply attrs on nested rule", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "span",
        token: "highlight",
        double: true,
        nested: true,
        at: "before",
        attrs: [["class", "highlight"]],
      });

      expect(md.render("==text==")).toEqual('<p><span class="highlight">text</span></p>\n');
    });
  });

  describe("at option (positioning)", () => {
    it("should register before emphasis with at: 'before'", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        double: true,
        nested: true,
        at: "before",
      });

      expect(md.render("==test==")).toEqual("<p><mark>test</mark></p>\n");
    });

    it("should register after emphasis with at: 'after' (default)", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
    });

    it("should register non-nested rule before emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
        at: "before",
      });

      expect(md.render("^test^")).toEqual("<p><sup>test</sup></p>\n");
    });

    it("should register nested rule after emphasis", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        double: true,
        nested: true,
        at: "after",
      });

      expect(md.render("==test==")).toEqual("<p><mark>test</mark></p>\n");
    });
  });

  describe("multiple registrations", () => {
    it("should support multiple different rules on the same instance", () => {
      const md = MarkdownIt({ linkify: true })
        .use(inlineRule, {
          marker: "^",
          tag: "sup",
          token: "sup",
        })
        .use(inlineRule, {
          marker: "~",
          tag: "sub",
          token: "sub",
        });

      expect(md.render("^sup^ and ~sub~")).toEqual("<p><sup>sup</sup> and <sub>sub</sub></p>\n");
    });

    it("should support mixing nested and non-nested rules", () => {
      const md = MarkdownIt({ linkify: true })
        .use(inlineRule, {
          marker: "^",
          tag: "sup",
          token: "sup",
        })
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          double: true,
          nested: true,
          at: "before",
        });

      expect(md.render("==marked ^sup^ text==")).toEqual(
        "<p><mark>marked <sup>sup</sup> text</mark></p>\n",
      );
    });
  });

  describe("nesting behavior", () => {
    it("nested: false should not parse inner inline markup", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "~",
        tag: "sub",
        token: "sub",
        allowSpace: true,
      });

      // inner **bold** should NOT be parsed
      expect(md.render("~sub **bold**~")).toEqual("<p><sub>sub **bold**</sub></p>\n");
    });

    it("nested: true should parse inner inline markup", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "!",
        tag: "span",
        token: "spoiler",
        double: true,
        nested: true,
        at: "before",
        attrs: [["class", "spoiler"]],
      });

      expect(md.render("!!spoiler **bold**!!")).toEqual(
        '<p><span class="spoiler">spoiler <strong>bold</strong></span></p>\n',
      );
    });
  });

  describe("cross-rule interaction", () => {
    it("should support spoiler with mark inside", () => {
      const md = MarkdownIt({ linkify: true })
        .use(inlineRule, {
          marker: "!",
          tag: "span",
          token: "spoiler",
          double: true,
          nested: true,
          at: "before",
          attrs: [["class", "spoiler"]],
        })
        .use(inlineRule, {
          marker: "=",
          tag: "mark",
          token: "mark",
          double: true,
          nested: true,
          at: "before",
        });

      expect(md.render("!!spoiler with ==mark== inside!!")).toEqual(
        '<p><span class="spoiler">spoiler with <mark>mark</mark> inside</span></p>\n',
      );
    });
  });

  describe("edge cases", () => {
    it("should not match unclosed markers", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "!",
        tag: "span",
        token: "spoiler",
        double: true,
        nested: true,
        at: "before",
      });

      expect(md.render("!!not closed")).toEqual("<p>!!not closed</p>\n");
    });

    it("should not match unclosed non-nested markers", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^not closed")).toEqual("<p>^not closed</p>\n");
    });

    it("should handle escaped markers", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render(String.raw`\^not a sup^`)).toEqual("<p>^not a sup^</p>\n");
    });

    it("should not match empty content in non-nested mode", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "^",
        tag: "sup",
        token: "sup",
      });

      expect(md.render("^^")).toEqual("<p>^^</p>\n");
    });

    it("should handle double marker non-nested with no content", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
      });

      expect(md.render("%%%%")).toEqual("<p>%%%%</p>\n");
    });

    it("should not match double marker when second char differs", () => {
      const md = MarkdownIt().use(inlineRule, {
        marker: "%",
        tag: "span",
        token: "custom",
        double: true,
      });

      // Single % followed by text - should not match
      expect(md.render("%test%")).toEqual("<p>%test%</p>\n");
    });

    it("should support nested rule with at: 'after' and tokens_meta", () => {
      // This tests the "after" nested path with token meta processing
      const md = MarkdownIt().use(inlineRule, {
        marker: "=",
        tag: "mark",
        token: "mark",
        double: true,
        nested: true,
        at: "after",
      });

      // Use emphasis that creates token meta entries
      expect(md.render("*==mark==*")).toEqual("<p><em><mark>mark</mark></em></p>\n");

      // Link content creates separate token_meta entries with delimiters
      expect(md.render("[==link==](url)")).toEqual('<p><a href="url"><mark>link</mark></a></p>\n');
    });
  });
});
