import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { advancedLinks } from "../src/index.js";

const createMarkdown = (html = false): MarkdownItType =>
  new MarkdownIt({ linkify: true, html })
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

// Rendered `video` block / 渲染后的 `video` 块
const video = (link: string): string => `<video src="${link}"></video>`;
// Rendered `badge` / 渲染后的 `badge`
const badge = (link: string): string => `<span class="badge badge-${link}">${link}</span>`;
// Rendered `badge` with a custom text / 使用自定义文本渲染的 `badge`
const badgeText = (text: string, link = "y"): string =>
  `<span class="badge badge-${link}">${text}</span>`;
// The syntax stays as text and falls back to a normal link / 语法保持为文本，回退为普通链接
const fallback = (name: string, link: string, suffix = ""): string =>
  `<p>@<a href="${link}">${name}</a>${suffix}</p>\n`;

describe("block syntax", () => {
  describe("indentation", () => {
    it("should ignore up to three leading spaces", () => {
      const md = createMarkdown();

      expect(md.render("  @[video](a.mp4)")).toBe(video("a.mp4"));
      expect(md.render("   @[video](a.mp4)")).toBe(video("a.mp4"));
      // an inline config occupying the whole line is still rendered as a block
      expect(md.render("   @[badge x](y)")).toBe(badge("y"));
    });

    it("should treat four leading spaces as an indented code block", () => {
      const md = createMarkdown();

      expect(md.render("    @[video](a.mp4)")).toBe("<pre><code>@[video](a.mp4)\n</code></pre>\n");
      expect(md.render("     @[video](a.mp4)")).toBe(
        "<pre><code> @[video](a.mp4)\n</code></pre>\n",
      );
      expect(md.render("\t@[video](a.mp4)")).toBe("<pre><code>@[video](a.mp4)\n</code></pre>\n");
      expect(md.render("    @[badge x](y)")).toBe("<pre><code>@[badge x](y)\n</code></pre>\n");
    });

    it("should count the indentation relative to the blockquote marker", () => {
      const md = createMarkdown();

      expect(md.render(">     @[video](a.mp4)")).toBe(
        `<blockquote>\n<pre><code>@[video](a.mp4)\n</code></pre>\n</blockquote>\n`,
      );
      expect(md.render(">    @[video](a.mp4)")).toBe(
        `<blockquote>\n${video("a.mp4")}</blockquote>\n`,
      );
    });

    it("should count the indentation relative to the list item content", () => {
      const md = createMarkdown();

      // the content indent of `- a` is two columns
      expect(md.render("- a\n  @[video](b.mp4)")).toBe(
        `<ul>\n<li>a${video("b.mp4")}</li>\n</ul>\n`,
      );
      expect(md.render("- a\n    @[video](b.mp4)")).toBe(
        `<ul>\n<li>a${video("b.mp4")}</li>\n</ul>\n`,
      );
    });

    it("should not match when the line is indented as code in a paragraph", () => {
      const md = createMarkdown();

      // six columns minus two columns of content indent is four, so the line is a lazy continuation
      expect(md.render("- a\n      @[video](b.mp4)")).toBe(
        `<ul>\n<li>a\n@<a href="b.mp4">video</a></li>\n</ul>\n`,
      );
      // the paragraph ends before the indented code block
      expect(md.render("- a\n\n      @[video](b.mp4)")).toBe(
        `<ul>\n<li>\n<p>a</p>\n<pre><code>@[video](b.mp4)\n</code></pre>\n</li>\n</ul>\n`,
      );
    });

    it("should end the list when the indentation is not enough", () => {
      const md = createMarkdown();

      expect(md.render("- a\n @[video](b.mp4)")).toBe(`<ul>\n<li>a</li>\n</ul>\n${video("b.mp4")}`);
    });
  });

  describe("containers", () => {
    it("should render inside a blockquote", () => {
      const md = createMarkdown();

      expect(md.render("> @[video](a.mp4)")).toBe(`<blockquote>\n${video("a.mp4")}</blockquote>\n`);
      expect(md.render("> > @[video](a.mp4)")).toBe(
        `<blockquote>\n<blockquote>\n${video("a.mp4")}</blockquote>\n</blockquote>\n`,
      );
    });

    it("should render without a paragraph wrapper inside a container", () => {
      const md = createMarkdown();

      expect(md.render("> @[badge x](y)")).toBe(`<blockquote>\n${badge("y")}</blockquote>\n`);
      expect(md.render("- @[badge x](y)")).toBe(`<ul>\n<li>\n${badge("y")}</li>\n</ul>\n`);
      expect(md.render("- @[video](a.mp4)")).toBe(`<ul>\n<li>\n${video("a.mp4")}</li>\n</ul>\n`);
      expect(md.render("1.  @[video](a.mp4)")).toBe(`<ol>\n<li>\n${video("a.mp4")}</li>\n</ol>\n`);
    });

    it("should interrupt a paragraph inside a container", () => {
      const md = createMarkdown();

      expect(md.render("> a\n> @[video](b.mp4)")).toBe(
        `<blockquote>\n<p>a</p>\n${video("b.mp4")}</blockquote>\n`,
      );
      expect(md.render("- a\n  @[badge x](y)")).toBe(`<ul>\n<li>a${badge("y")}</li>\n</ul>\n`);
      expect(md.render("- a\n\n  @[video](b.mp4)")).toBe(
        `<ul>\n<li>\n<p>a</p>\n${video("b.mp4")}</li>\n</ul>\n`,
      );
    });

    it("should terminate a paragraph instead of lazily continuing", () => {
      const md = createMarkdown();

      // the block rule can interrupt a paragraph, so the lazy continuation is not used
      expect(md.render("> a\n@[video](b.mp4)")).toBe(
        `<blockquote>\n<p>a</p>\n</blockquote>\n${video("b.mp4")}`,
      );
      expect(md.render("- a\n@[video](b.mp4)")).toBe(`<ul>\n<li>a</li>\n</ul>\n${video("b.mp4")}`);
      // the following line is no longer a lazy continuation of the block syntax
      expect(md.render("> @[video](a.mp4)\ncontinued")).toBe(
        `<blockquote>\n${video("a.mp4")}</blockquote>\n<p>continued</p>\n`,
      );
    });

    it("should render inside nested lists", () => {
      const md = createMarkdown();

      expect(md.render("- a\n  - @[video](b.mp4)")).toBe(
        `<ul>\n<li>a\n<ul>\n<li>\n${video("b.mp4")}</li>\n</ul>\n</li>\n</ul>\n`,
      );
      expect(md.render("- a\n  - b\n    @[video](c.mp4)")).toBe(
        `<ul>\n<li>a\n<ul>\n<li>b${video("c.mp4")}</li>\n</ul>\n</li>\n</ul>\n`,
      );
      expect(md.render("- > @[video](a.mp4)")).toBe(
        `<ul>\n<li>\n<blockquote>\n${video("a.mp4")}</blockquote>\n</li>\n</ul>\n`,
      );
    });

    it("should keep the following list items", () => {
      const md = createMarkdown();

      expect(md.render("- @[video](a.mp4)\n\n- b")).toBe(
        `<ul>\n<li>\n${video("a.mp4")}</li>\n<li>\n<p>b</p>\n</li>\n</ul>\n`,
      );
      expect(md.render("1)  @[video](a.mp4)")).toBe(`<ol>\n<li>\n${video("a.mp4")}</li>\n</ol>\n`);
    });

    it("should keep the blocks after the list item", () => {
      const md = createMarkdown();

      expect(md.render("- @[badge x](y)\n\n  more")).toBe(
        `<ul>\n<li>\n${badge("y")}<p>more</p>\n</li>\n</ul>\n`,
      );
      expect(md.render("> @[video](a.mp4)\n>\n> next")).toBe(
        `<blockquote>\n${video("a.mp4")}<p>next</p>\n</blockquote>\n`,
      );
    });
  });

  describe("code", () => {
    it("should not render inside fenced code", () => {
      const md = createMarkdown();

      expect(md.render("```\n@[video](a.mp4)\n```")).toBe(
        "<pre><code>@[video](a.mp4)\n</code></pre>\n",
      );
      expect(md.render("~~~\n@[video](a.mp4)\n~~~")).toBe(
        "<pre><code>@[video](a.mp4)\n</code></pre>\n",
      );
      expect(md.render("````\n```\n@[video](a.mp4)\n```\n````")).toBe(
        "<pre><code>```\n@[video](a.mp4)\n```\n</code></pre>\n",
      );
      expect(md.render("```\n@[badge x](y)\n```")).toBe(
        "<pre><code>@[badge x](y)\n</code></pre>\n",
      );
    });

    it("should not render inside fenced code of a container", () => {
      const md = createMarkdown();

      expect(md.render("- ```\n  @[video](a.mp4)\n  ```")).toBe(
        "<ul>\n<li>\n<pre><code>@[video](a.mp4)\n</code></pre>\n</li>\n</ul>\n",
      );
      expect(md.render("> ```\n> @[video](a.mp4)\n> ```")).toBe(
        "<blockquote>\n<pre><code>@[video](a.mp4)\n</code></pre>\n</blockquote>\n",
      );
    });

    it("should not render inside a code span", () => {
      const md = createMarkdown();

      expect(md.render("`@[video](a.mp4)`")).toBe("<p><code>@[video](a.mp4)</code></p>\n");
      expect(md.render("`@[badge x](y)`")).toBe("<p><code>@[badge x](y)</code></p>\n");
      expect(md.render("``@[badge x](y)``")).toBe("<p><code>@[badge x](y)</code></p>\n");
      expect(md.render("``a @[badge x](y) b``")).toBe("<p><code>a @[badge x](y) b</code></p>\n");
    });
  });

  describe("whole line requirement", () => {
    it("should require the syntax to be the only content", () => {
      const md = createMarkdown();

      expect(md.render("@[video](a.mp4) trailing")).toBe(fallback("video", "a.mp4", " trailing"));
      expect(md.render("leading @[video](a.mp4)")).toBe(
        '<p>leading @<a href="a.mp4">video</a></p>\n',
      );
      expect(md.render("@[video](a.mp4).")).toBe(fallback("video", "a.mp4", "."));
      expect(md.render("@[video](a.mp4)@[video](b.mp4)")).toBe(
        '<p>@<a href="a.mp4">video</a>@<a href="b.mp4">video</a></p>\n',
      );
    });

    it("should require the whole line inside a container", () => {
      const md = createMarkdown();

      expect(md.render("- @[video](a.mp4) trailing")).toBe(
        `<ul>\n<li>@<a href="a.mp4">video</a> trailing</li>\n</ul>\n`,
      );
      expect(md.render("> @[video](a.mp4) trailing")).toBe(
        `<blockquote>\n<p>@<a href="a.mp4">video</a> trailing</p>\n</blockquote>\n`,
      );
    });

    it("should allow trailing whitespaces", () => {
      const md = createMarkdown();

      expect(md.render("  @[video](a.mp4)  ")).toBe(video("a.mp4"));
      expect(md.render("@[video](a.mp4)\t")).toBe(video("a.mp4"));
      // a hard break cannot happen in a block syntax
      expect(md.render("@[video](a.mp4)  \nnext")).toBe(`${video("a.mp4")}<p>next</p>\n`);
      expect(md.render("a  \n@[video](a.mp4)")).toBe(`<p>a</p>\n${video("a.mp4")}`);
      expect(md.render("@[badge x](y)  ")).toBe(badge("y"));
    });
  });

  describe("other block markup", () => {
    it("should not take over a heading", () => {
      const md = createMarkdown();

      expect(md.render("# @[video](a.mp4)")).toBe('<h1>@<a href="a.mp4">video</a></h1>\n');
      expect(md.render("## @[badge x](y)")).toBe(`<h2>${badge("y")}</h2>\n`);
      expect(md.render("#@[video](a.mp4)")).toBe('<p>#@<a href="a.mp4">video</a></p>\n');
    });

    it("should let a setext heading underline take over", () => {
      const md = createMarkdown();

      // `lheading` runs before the block rule, matching the behavior of other block plugins
      expect(md.render("@[video](a.mp4)\n===")).toBe('<h1>@<a href="a.mp4">video</a></h1>\n');
      expect(md.render("@[video](a.mp4)\n---")).toBe('<h2>@<a href="a.mp4">video</a></h2>\n');
    });

    it("should render before a thematic break", () => {
      const md = createMarkdown();

      expect(md.render("@[video](a.mp4)\n***")).toBe(`${video("a.mp4")}<hr>\n`);
      expect(md.render("@[video](a.mp4)\n\n---")).toBe(`${video("a.mp4")}<hr>\n`);
    });

    it("should render next to an html block", () => {
      const md = createMarkdown(true);

      expect(md.render("<div>\n\n@[video](a.mp4)\n\n</div>")).toBe(
        `<div>\n${video("a.mp4")}</div>`,
      );
    });

    it("should not take over a table cell", () => {
      const md = createMarkdown();

      // the block rule never runs inside a table cell
      expect(md.render("| @[video](a.mp4) |\n| --- |")).toBe(
        `<table>\n<thead>\n<tr>\n<th>@<a href="a.mp4">video</a></th>\n</tr>\n</thead>\n</table>\n`,
      );
      expect(md.render("| @[badge x](y) |\n| --- |")).toBe(
        `<table>\n<thead>\n<tr>\n<th>${badge("y")}</th>\n</tr>\n</thead>\n</table>\n`,
      );
    });

    it("should not be affected by a following reference definition", () => {
      const md = createMarkdown();

      expect(md.render("@[badge x](y)\n\n[badge x]: /z")).toBe(badge("y"));
      expect(md.render("[ref]: /z\n@[video](a.mp4)")).toBe(video("a.mp4"));
    });
  });

  describe("props", () => {
    it("should support escaped and quoted brackets", () => {
      const md = createMarkdown();

      expect(md.render(String.raw`@[badge text=a\]b](y)`)).toBe(badgeText("a]b"));
      expect(md.render(String.raw`@[badge text="a]b"](y)`)).toBe(badgeText("a]b"));
      expect(md.render(String.raw`@[badge text=x\ y](y)`)).toBe(badgeText("x y"));
      expect(md.render(String.raw`@[video a=b\]c](x.mp4)`)).toBe(video("x.mp4"));
    });

    it("should reject malformed props of a block", () => {
      const md = createMarkdown();

      // the line no longer matches the block syntax, so it stays a paragraph
      expect(md.render(String.raw`@[video a=\](x.mp4)`)).toBe("<p>@[video a=](x.mp4)</p>\n");
      expect(md.render("@[video a=x\\")).toBe(`${String.raw`<p>@[video a=x\</p>`}\n`);
    });
  });

  describe("line endings", () => {
    it("should support CRLF and CR", () => {
      const md = createMarkdown();

      expect(md.render("@[video](a.mp4)\r\n")).toBe(video("a.mp4"));
      expect(md.render("@[video](a.mp4)\r")).toBe(video("a.mp4"));
      expect(md.render("a\r\n@[video](a.mp4)\r\n")).toBe(`<p>a</p>\n${video("a.mp4")}`);
    });

    it("should ignore incomplete and blank lines", () => {
      const md = createMarkdown();

      expect(md.render("@[video](a.mp4)\n\n@[video](b.mp4)")).toBe(
        `${video("a.mp4")}${video("b.mp4")}`,
      );
      expect(md.render("\t")).toBe("");
      expect(md.render("@")).toBe("<p>@</p>\n");
      expect(md.render("@[")).toBe("<p>@[</p>\n");
      expect(md.render("@[badge")).toBe("<p>@[badge</p>\n");
    });
  });

  describe("tokens", () => {
    it("should create a block token with the block metadata", () => {
      const md = createMarkdown();
      const tokens = md.parse("- @[video autoplay](a.mp4)", {});
      const token = tokens.at(2);

      expect(token?.type).toBe("advanced_link_block");
      expect(token?.block).toBe(true);
      expect(token?.level).toBe(2);
      expect(token?.info).toBe("video");
      expect(token?.content).toBe("a.mp4");
      expect(token?.markup).toBe("@[...](...)");
      expect(token?.map).toStrictEqual([0, 1]);
      expect(token?.meta).toStrictEqual({ autoplay: true });
    });

    it("should create a block token for an inline config on its own line", () => {
      const md = createMarkdown();
      const tokens = md.parse("@[badge primary](y)", {});
      const [token] = tokens;

      expect(token.type).toBe("advanced_link_block");
      expect(token.block).toBe(true);
      expect(token.level).toBe(0);
      expect(token.info).toBe("badge");
      expect(token.content).toBe("y");
      expect(token.meta).toStrictEqual({ primary: true });
    });

    it("should keep the syntax as text when the name is unregistered", () => {
      const md = createMarkdown();
      const tokens = md.parse("@[unknown](x)", {});

      expect(tokens.map((token) => token.type)).toStrictEqual([
        "paragraph_open",
        "inline",
        "paragraph_close",
      ]);
    });
  });
});
