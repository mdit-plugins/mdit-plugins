import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { advancedLinks } from "../src/index.js";

const createMarkdown = (): MarkdownItType =>
  new MarkdownIt()
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

describe(advancedLinks, () => {
  describe("block syntax", () => {
    it("should render block syntax", () => {
      const md = createMarkdown();

      expect(md.render("@[video](a.mp4)")).toBe('<video src="a.mp4"></video>');
      expect(md.render("@[video autoplay](a.mp4)")).toBe('<video src="a.mp4" autoplay></video>');
    });

    it("should allow leading and trailing whitespace", () => {
      const md = createMarkdown();

      expect(md.render("  @[video](a.mp4)  ")).toBe('<video src="a.mp4"></video>');
      expect(md.render("@[video](a.mp4)\t")).toBe('<video src="a.mp4"></video>');
    });

    it("should require the whole line", () => {
      const md = createMarkdown();
      const testCases = [
        "@[video](a.mp4) trailing",
        "leading @[video](a.mp4)",
        "@[video](a.mp4)@[video](b.mp4)",
      ];

      testCases.forEach((input) => {
        expect(md.render(input)).not.toContain("<video");
      });
    });

    it("should interrupt other block elements", () => {
      const md = createMarkdown();
      const testCases = [
        ["abc\n@[video](a.mp4)", "<p>abc</p>"],
        ["- @[video](a.mp4)", "<li>"],
        ["> @[video](a.mp4)", "<blockquote>"],
      ];

      testCases.forEach(([input, expected]) => {
        const result = md.render(input);

        expect(result).toContain(expected);
        expect(result).toContain('<video src="a.mp4"></video>');
      });
    });

    it("should generate block tokens", () => {
      const md = createMarkdown();
      const tokens = md.parse("@[video autoplay](a.mp4)", {});
      const [token] = tokens;

      expect(token.type).toBe("advanced_link_block");
      expect(token.block).toBe(true);
      expect(token.info).toBe("video");
      expect(token.content).toBe("a.mp4");
      expect(token.map).toStrictEqual([0, 1]);
      expect(token.meta).toStrictEqual({ autoplay: true });
    });

    it("should keep the syntax indented as code", () => {
      const md = createMarkdown();

      expect(md.render("    @[video](a.mp4)")).toBe("<pre><code>@[video](a.mp4)\n</code></pre>\n");
    });
  });

  describe("inline syntax", () => {
    it("should render inline syntax", () => {
      const md = createMarkdown();

      expect(md.render("a @[badge primary](x) b")).toBe(
        '<p>a <span class="badge badge-x">x</span> b</p>\n',
      );
    });

    it("should support props in inline syntax", () => {
      const md = createMarkdown();

      expect(md.render("a @[badge primary text='Hi'](x) b")).toBe(
        '<p>a <span class="badge badge-x">Hi</span> b</p>\n',
      );
    });

    it("should render inline syntax as a block when it takes the whole line", () => {
      const md = createMarkdown();

      expect(md.render("@[badge primary](x)")).toBe('<span class="badge badge-x">x</span>');
    });

    it("should keep block-only syntax inline", () => {
      const md = createMarkdown();

      expect(md.render("a @[video](a.mp4) b")).toBe('<p>a @<a href="a.mp4">video</a> b</p>\n');
    });

    it("should render adjacent inline syntax", () => {
      const md = createMarkdown();

      expect(md.render("a @[badge x](1)@[badge y](2) b")).toBe(
        '<p>a <span class="badge badge-1">1</span><span class="badge badge-2">2</span> b</p>\n',
      );
    });

    it("should generate inline tokens", () => {
      const md = createMarkdown();
      const tokens = md.parse("a @[badge primary](x) b", {});
      const token = tokens[1].children?.[1];

      expect(token?.type).toBe("advanced_link_inline");
      expect(token?.info).toBe("badge");
      expect(token?.content).toBe("x");
      expect(token?.meta).toStrictEqual({ primary: true });
    });

    it("should render inside a link label", () => {
      const md = createMarkdown();

      expect(md.render("[go @[badge x](y) now](https://example.com)")).toContain(
        '<span class="badge badge-y">y</span>',
      );
    });
  });

  describe("registration", () => {
    it("should keep configs per instance", () => {
      const md1 = new MarkdownIt().use(advancedLinks, {
        name: "only",
        renderer: (): string => "ONLY",
      });
      const md2 = new MarkdownIt().use(advancedLinks, {
        name: "other",
        renderer: (): string => "OTHER",
      });

      expect(md1.render("@[only](x)")).toBe("ONLY");
      expect(md1.render("@[other](x)")).toContain('<a href="x">other</a>');
      expect(md2.render("@[only](x)")).toContain('<a href="x">only</a>');
    });

    it("should keep the same name isolated between instances", () => {
      const md1 = new MarkdownIt().use(advancedLinks, {
        name: "same",
        renderer: (): string => "FIRST",
      });
      const md2 = new MarkdownIt().use(advancedLinks, {
        name: "same",
        renderer: (): string => "SECOND",
      });

      expect(md1.render("@[same](x)")).toBe("FIRST");
      expect(md2.render("@[same](x)")).toBe("SECOND");
    });

    it("should restore removed renderer rules", () => {
      const md = createMarkdown();
      const countRules = (): [number, number] => [
        md.block.ruler.__rules__.filter((rule) => rule.name === "advanced_link_block").length,
        md.inline.ruler.__rules__.filter((rule) => rule.name === "advanced_link_inline").length,
      ];

      // simulate a rule removed by another plugin
      delete md.renderer.rules.advanced_link_block;
      md.use(advancedLinks, { name: "video", renderer: (): string => "RESTORED" });

      expect(md.render("@[video](a.mp4)")).toBe("RESTORED");

      // `Ruler.before` does not deduplicate, so the parser rules must not be registered again
      md.use(advancedLinks, { name: "video", renderer: (): string => "RESTORED" });
      expect(countRules()).toStrictEqual([1, 1]);
    });

    it("should support adding configs after the first call", () => {
      const md = new MarkdownIt().use(advancedLinks, {
        name: "first",
        renderer: (): string => "FIRST",
      });

      expect(md.render("@[second](x)")).toContain('<a href="x">second</a>');

      md.use(advancedLinks, { name: "second", renderer: (): string => "SECOND" });

      expect(md.render("@[second](x)")).toBe("SECOND");
    });

    it("should support enabling inline after the first call", () => {
      const md = new MarkdownIt().use(advancedLinks, {
        name: "block",
        renderer: (): string => "BLOCK",
      });

      md.use(advancedLinks, { name: "inline", inline: true, renderer: (): string => "INLINE" });

      expect(md.render("x @[inline](y) z")).toBe("<p>x INLINE z</p>\n");
    });

    it("should override the config with the same name", () => {
      const md = new MarkdownIt()
        .use(advancedLinks, { name: "same", renderer: (): string => "FIRST" })
        .use(advancedLinks, { name: "same", renderer: (): string => "SECOND" });

      expect(md.render("@[same](x)")).toBe("SECOND");
    });
  });

  describe("fallback", () => {
    it("should keep unregistered names as-is", () => {
      const md = createMarkdown();

      expect(md.render("@[unknown](x)")).toBe('<p>@<a href="x">unknown</a></p>\n');
      expect(md.render("@[unknown](x)")).not.toContain("<video");
    });

    it("should support escaping the syntax", () => {
      const md = createMarkdown();

      expect(md.render(String.raw`\@[video](a.mp4)`)).toBe('<p>@<a href="a.mp4">video</a></p>\n');
    });

    it("should render nothing for tokens without config", () => {
      const md = createMarkdown();
      const tokens = md.parse("@[video](a.mp4)", {});
      const [token] = tokens;

      // simulate a token created outside of the parser
      token.info = "unknown";

      expect(md.renderer.render(tokens, md.options, {})).toBe("");
    });

    it("should fallback to empty props for tokens without meta", () => {
      const md = new MarkdownIt().use(advancedLinks, {
        name: "test",
        renderer: (_link, props): string => JSON.stringify(props),
      });
      const tokens = md.parse("@[test a=1](link)", {});
      const [token] = tokens;

      // simulate a token created outside of the parser
      token.meta = null;

      expect(md.renderer.render(tokens, md.options, {})).toBe("{}");
    });
  });

  describe("interaction with other markup", () => {
    it("should render inside a table cell", () => {
      const md = createMarkdown();

      expect(md.render("| a @[badge v](x) b |\n| --- |")).toBe(
        '<table>\n<thead>\n<tr>\n<th>a <span class="badge badge-x">x</span> b</th>\n</tr>\n</thead>\n</table>\n',
      );
    });

    it("should ignore inline token in image text", () => {
      const md = createMarkdown();

      // inline tokens are not part of the text used for `alt`
      expect(md.render("![@[badge a](b)](c.png)")).toBe('<p><img src="c.png" alt=""></p>\n');
      expect(md.render("![@[video a](b)](c.png)")).toBe(
        '<p><img src="c.png" alt="@video a"></p>\n',
      );
    });

    it("should not interrupt a setext heading underline", () => {
      const md = createMarkdown();

      // `lheading` runs before the block rule, matching the behavior of other block plugins
      expect(md.render("@[video](a.mp4)\n===")).toBe('<h1>@<a href="a.mp4">video</a></h1>\n');
    });
  });
});
