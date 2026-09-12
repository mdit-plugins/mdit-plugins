import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { advancedLinks } from "../src/index.js";

const createMarkdown = (html = false, breaks = false): MarkdownItType =>
  new MarkdownIt({ linkify: true, html, breaks })
    .use(advancedLinks, {
      name: "video",
      renderer: (link, props): string =>
        `<video src="${link}"${props.autoplay === true ? " autoplay" : ""}></video>`,
    })
    .use(advancedLinks, {
      name: "badge",
      inline: true,
      renderer: (link, props): string => {
        const text = typeof props.text === "string" ? props.text : link;

        return `<span class="badge badge-${link}">${text}</span>`;
      },
    });

const plain = new MarkdownIt({ linkify: true });

// Rendered `badge` / 渲染后的 `badge`
const badge = (link: string, text = link): string =>
  `<span class="badge badge-${link}">${text}</span>`;
// The syntax stays as text and falls back to a normal link / 语法保持为文本，回退为普通链接
const fallback = (name: string, link: string): string => `<p>@<a href="${link}">${name}</a></p>\n`;

describe("inline syntax", () => {
  describe("precedence", () => {
    it("should take precedence over a normal link", () => {
      const md = createMarkdown();

      expect(md.render("a @[badge x](y) b")).toBe(`<p>a ${badge("y")} b</p>\n`);
      // the same source is a normal link without the plugin
      expect(plain.render("a [badge x](y) b")).toBe('<p>a <a href="y">badge x</a> b</p>\n');
    });

    it("should win over the destination of a normal link", () => {
      const md = createMarkdown();

      // the inline rule runs before the `link` rule, so the syntax is parsed first
      expect(md.render("[a](@[badge x](y))")).toBe(`<p>[a](${badge("y")})</p>\n`);
    });

    it("should win over a reference link", () => {
      const md = createMarkdown();

      expect(md.render("@[badge x][y]\n\n[y]: /z")).toBe('<p>@<a href="/z">badge x</a></p>\n');
    });

    it("should let a block-only config fall back to a nested link", () => {
      const md = createMarkdown();

      // a nested link prevents the outer link from being parsed
      expect(md.render("[a @[video x](y) b](z)")).toBe(
        '<p>[a @<a href="y">video x</a> b](z)</p>\n',
      );
      // an inline config consumes its own brackets, so the outer link still works
      expect(md.render("[a @[badge x](y) b](z)")).toBe(
        `<p><a href="z">a ${badge("y")} b</a></p>\n`,
      );
    });
  });

  describe("emphasis boundary", () => {
    it("should leave an unclosed delimiter as a normal link does", () => {
      const md = createMarkdown();

      expect(md.render("**abc @[badge prop](link)")).toBe(`<p>**abc ${badge("link")}</p>\n`);
      expect(plain.render("**abc [xxx prop](link)")).toBe(
        '<p>**abc <a href="link">xxx prop</a></p>\n',
      );
    });

    it("should keep the delimiter literal when the name is unregistered", () => {
      const md = createMarkdown();

      expect(md.render("**abc @[badge** prop](link)")).toBe(
        '<p>**abc @<a href="link">badge** prop</a></p>\n',
      );
      expect(plain.render("**abc [xxx** prop](link)")).toBe(
        '<p>**abc <a href="link">xxx** prop</a></p>\n',
      );
    });

    it("should allow delimiters inside the props", () => {
      const md = createMarkdown();

      expect(md.render("**abc @[badge **prop](link)")).toBe(`<p>**abc ${badge("link")}</p>\n`);
      expect(md.render("*abc @[badge* prop](link)")).toBe(
        '<p>*abc @<a href="link">badge* prop</a></p>\n',
      );
      expect(md.render("_abc @[badge_ prop](link)")).toBe(
        '<p>_abc @<a href="link">badge_ prop</a></p>\n',
      );
    });

    it("should work between delimiters", () => {
      const md = createMarkdown();

      expect(md.render("*a @[badge x](y) b*")).toBe(`<p><em>a ${badge("y")} b</em></p>\n`);
      expect(md.render("**abc** @[badge prop](link)")).toBe(
        `<p><strong>abc</strong> ${badge("link")}</p>\n`,
      );
      expect(md.render("abc @[badge prop](link) **def**")).toBe(
        `<p>abc ${badge("link")} <strong>def</strong></p>\n`,
      );
    });
  });

  describe("link labels", () => {
    it("should render inside a link label", () => {
      const md = createMarkdown();

      expect(md.render("[a @[badge x](y) b](z)")).toBe(
        `<p><a href="z">a ${badge("y")} b</a></p>\n`,
      );
      expect(md.render("[@[badge x](y)](z)")).toBe(`<p><a href="z">${badge("y")}</a></p>\n`);
      expect(md.render("[a @[badge x](a(b)c) b](z)")).toBe(
        `<p><a href="z">a ${badge("a(b)c")} b</a></p>\n`,
      );
    });

    it("should render inside a reference link label", () => {
      const md = createMarkdown();

      expect(md.render("[a @[badge x](y) b][ref]\n\n[ref]: /z")).toBe(
        `<p><a href="/z">a ${badge("y")} b</a></p>\n`,
      );
    });

    it("should not be parsed inside a link title", () => {
      const md = createMarkdown();

      expect(md.render('[a](b "@[badge x](y)")')).toBe(
        '<p><a href="b" title="@[badge x](y)">a</a></p>\n',
      );
    });

    it("should not contribute to the image text", () => {
      const md = createMarkdown();

      expect(md.render("![a @[badge x](y) b](z)")).toBe('<p><img src="z" alt="a  b"></p>\n');
      expect(md.render("![a @[video x](y) b](z)")).toBe(
        '<p><img src="z" alt="a @video x b"></p>\n',
      );
    });
  });

  describe("code spans", () => {
    it("should not render inside a code span", () => {
      const md = createMarkdown();

      expect(md.render("`@[badge x](y)`")).toBe("<p><code>@[badge x](y)</code></p>\n");
      expect(md.render("``a @[badge x](y) b``")).toBe("<p><code>a @[badge x](y) b</code></p>\n");
      expect(md.render("`@[video](a.mp4)`")).toBe("<p><code>@[video](a.mp4)</code></p>\n");
    });
  });

  describe("escaping", () => {
    it("should support escaping the `@`", () => {
      const md = createMarkdown();

      expect(md.render(String.raw`\@[badge x](y)`)).toBe('<p>@<a href="y">badge x</a></p>\n');
      expect(md.render(String.raw`a\@[badge x](y)`)).toBe('<p>a@<a href="y">badge x</a></p>\n');
      expect(md.render(String.raw`\@[video](a.mp4)`)).toBe('<p>@<a href="a.mp4">video</a></p>\n');
    });

    it("should keep an escaped backslash visible", () => {
      const md = createMarkdown();

      expect(md.render(String.raw`\\@[badge x](y)`)).toBe(`<p>\\${badge("y")}</p>\n`);
    });

    it("should support escaping the whole syntax", () => {
      const md = createMarkdown();

      expect(md.render(String.raw`\@\[badge x\]\(y\)`)).toBe("<p>@[badge x](y)</p>\n");
    });
  });

  describe("adjacency", () => {
    it("should not require whitespaces around the syntax", () => {
      const md = createMarkdown();

      expect(md.render("a@[badge x](y)")).toBe(`<p>a${badge("y")}</p>\n`);
      expect(md.render("@[badge x](y)b")).toBe(`<p>${badge("y")}b</p>\n`);
      expect(md.render("a @[badge x](y)@[badge z](w) b")).toBe(
        `<p>a ${badge("y")}${badge("w")} b</p>\n`,
      );
    });

    it("should work next to an autolink and a linkified url", () => {
      const md = createMarkdown();

      expect(md.render("<https://a.com>@[badge x](y)")).toBe(
        `<p><a href="https://a.com">https://a.com</a>${badge("y")}</p>\n`,
      );
      expect(md.render("a https://a.com @[badge x](y)")).toBe(
        `<p>a <a href="https://a.com">https://a.com</a> ${badge("y")}</p>\n`,
      );
    });

    it("should keep the link destination as-is", () => {
      const md = createMarkdown();

      expect(md.render("a @[badge x](https://a.com) b")).toBe(
        `<p>a ${badge("https://a.com")} b</p>\n`,
      );
      expect(md.render("a @[badge x](a(1).mp4) b")).toBe(`<p>a ${badge("a(1).mp4")} b</p>\n`);
    });

    it("should not be affected by following punctuation", () => {
      const md = createMarkdown();

      expect(md.render("@[badge x](y).")).toBe(`<p>${badge("y")}.</p>\n`);
      expect(md.render("a @[badge x](y), b")).toBe(`<p>a ${badge("y")}, b</p>\n`);
    });
  });

  describe("lines", () => {
    it("should be rendered as a block when it is the whole line", () => {
      const md = createMarkdown();

      // no paragraph is generated, and the following line starts a new paragraph
      expect(md.render("a\n@[badge x](y)")).toBe(`<p>a</p>\n${badge("y")}`);
      expect(md.render("@[badge x](y)\na")).toBe(`${badge("y")}<p>a</p>\n`);
      expect(md.render("@[badge x](y)\n@[badge z](w)")).toBe(`${badge("y")}${badge("w")}`);
    });

    it("should mix with paragraphs on adjacent lines", () => {
      const md = createMarkdown();

      expect(md.render("a @[badge x](y)\n@[video](b.mp4)")).toBe(
        `<p>a ${badge("y")}</p>\n<video src="b.mp4"></video>`,
      );
      expect(md.render("@[video](a.mp4)\na @[badge x](y)")).toBe(
        `<video src="a.mp4"></video><p>a ${badge("y")}</p>\n`,
      );
    });

    it("should respect the `breaks` option", () => {
      const md = createMarkdown(false, true);

      expect(md.render("a @[badge x](y)\nb")).toBe(`<p>a ${badge("y")}<br>\nb</p>\n`);
    });
  });

  describe("inline html", () => {
    it("should render inside inline html", () => {
      const md = createMarkdown(true);

      expect(md.render("a <b>@[badge x](y)</b> c")).toBe(`<p>a <b>${badge("y")}</b> c</p>\n`);
      expect(md.render("a <span>@[badge x](y)</span>")).toBe(
        `<p>a <span>${badge("y")}</span></p>\n`,
      );
    });
  });

  describe("props boundary", () => {
    it("should allow brackets and parens inside quoted values", () => {
      const md = createMarkdown();

      expect(md.render('@[badge a="](x)"](y)')).toBe(badge("y"));
      expect(md.render('@[badge a="[b]"](c)')).toBe(badge("c"));
      expect(md.render('@[badge a=")"](y)')).toBe(badge("y"));
    });

    it("should allow escaped quotes inside quoted values", () => {
      const md = createMarkdown();

      expect(md.render(String.raw`@[badge a="x\"y"](z)`)).toBe(badge("z"));
      expect(md.render(String.raw`@[badge text="a\"b"](z)`)).toBe(badge("z", 'a"b'));
    });

    it("should reject unquoted `]` in the props", () => {
      const md = createMarkdown();

      // the `]` closes the syntax early, so the whole thing is unmatched
      expect(md.render("@[badge a=[b]](y)")).toBe(fallback("badge a=[b]", "y"));
      expect(md.render("a @[badge a=[b]](y) b")).toBe('<p>a @<a href="y">badge a=[b]</a> b</p>\n');
    });

    it("should allow `=` and other characters in props", () => {
      const md = createMarkdown();

      expect(md.render("a @[badge a=b=c](y) b")).toBe(`<p>a ${badge("y")} b</p>\n`);
      expect(md.render("a @[badge a/b=1](y) b")).toBe(`<p>a ${badge("y")} b</p>\n`);
      expect(md.render("a @[badge a=x@y](y) b")).toBe(`<p>a ${badge("y")} b</p>\n`);
    });
  });
});
