import { attrs } from "@mdit/plugin-attrs";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { AnchorOptions } from "../src/options.js";
import { anchor } from "../src/plugin.js";

const md = (options?: AnchorOptions): MarkdownIt => MarkdownIt({ html: true }).use(anchor, options);

const mdWithAttrs = (options?: AnchorOptions): MarkdownIt =>
  MarkdownIt({ html: true })
    .use(attrs, { allowed: ["id"] })
    .use(anchor, options);

describe("basic functionality", () => {
  it("should add anchors to headings by default", () => {
    expect(md().render("# H1\n\n## H2")).toBe(
      '<h1 id="h1" tabindex="-1">H1</h1>\n<h2 id="h2" tabindex="-1">H2</h2>\n',
    );
  });

  it("should slugify nested inline elements", () => {
    expect(
      md().render(
        "# H1 [link](link) ![image](link) `code` ~~strike~~ _em_ **strong** <span>inline html</span>",
      ),
    ).toBe(
      '<h1 id="h1-link-code-strike-em-strong-inline-html" tabindex="-1">H1 <a href="link">link</a> <img src="link" alt="image"> <code>code</code> <s>strike</s> <em>em</em> <strong>strong</strong> <span>inline html</span></h1>\n',
    );
  });
});

describe("level option", () => {
  it("should respect level as number", () => {
    expect(md({ level: 2 }).render("# H1\n\n## H2")).toBe(
      '<h1>H1</h1>\n<h2 id="h2" tabindex="-1">H2</h2>\n',
    );
  });

  it("should respect level as array", () => {
    expect(md({ level: [2, 4] }).render("# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5")).toBe(
      '<h1>H1</h1>\n<h2 id="h2" tabindex="-1">H2</h2>\n<h3>H3</h3>\n<h4 id="h4" tabindex="-1">H4</h4>\n<h5>H5</h5>\n',
    );
  });
});

describe("slug options", () => {
  it("should handle duplicate slugs", () => {
    expect(md().render("# Title\n\n## Title")).toBe(
      '<h1 id="title" tabindex="-1">Title</h1>\n<h2 id="title-1" tabindex="-1">Title</h2>\n',
    );
  });

  it("should handle code in headings", () => {
    expect(md().render("#### `options`")).toBe(
      '<h4 id="options" tabindex="-1"><code>options</code></h4>\n',
    );
  });

  it("should support custom slugify", () => {
    expect(
      md({
        slugify: (content: string): string => content.trim().toLowerCase().replaceAll(/\s+/g, "-"),
      }).render("# foo bar"),
    ).toBe('<h1 id="foo-bar" tabindex="-1">foo bar</h1>\n');
  });

  it("should support slugifyWithState", () => {
    const mdInstance = new MarkdownIt({ html: true }).use(anchor, {
      slugifyWithState: (title: string, state) =>
        `${(state.env as Record<string, string>).docId}-${title}`,
    });

    expect(mdInstance.render("# bar", { docId: "foo" })).toBe(
      '<h1 id="foo-bar" tabindex="-1">bar</h1>\n',
    );
  });
});

describe("tabIndex option", () => {
  it("should default to -1", () => {
    expect(md().render("# Title\n\n## Title")).toBe(
      '<h1 id="title" tabindex="-1">Title</h1>\n<h2 id="title-1" tabindex="-1">Title</h2>\n',
    );
  });

  it("should set tabIndex to false to disable", () => {
    expect(md({ tabIndex: false }).render("# H1\n\n## H2")).toBe(
      '<h1 id="h1">H1</h1>\n<h2 id="h2">H2</h2>\n',
    );
  });

  it("should allow custom tabIndex value", () => {
    expect(md({ tabIndex: "0" }).render("# H1\n\n## H2")).toBe(
      '<h1 id="h1" tabindex="0">H1</h1>\n<h2 id="h2" tabindex="0">H2</h2>\n',
    );
  });
});

describe("uniqueSlugStartIndex option", () => {
  it("should start numbering from the given index", () => {
    expect(md({ uniqueSlugStartIndex: 2 }).render("# Lorem\n## Lorem\n### Lorem")).toBe(
      '<h1 id="lorem" tabindex="-1">Lorem</h1>\n<h2 id="lorem-2" tabindex="-1">Lorem</h2>\n<h3 id="lorem-3" tabindex="-1">Lorem</h3>\n',
    );
  });
});

describe("getTokensText option", () => {
  it("should support custom token text extraction", () => {
    expect(
      md({
        getTokensText: (tokens) =>
          tokens
            .filter((token) => ["text", "image"].includes(token.type))
            .map((token) => token.content)
            .join(""),
      }).render("# H1 ![image](link) `code` _em_"),
    ).toBe(
      '<h1 id="h1-image-em" tabindex="-1">H1 <img src="link" alt="image"> <code>code</code> <em>em</em></h1>\n',
    );
  });
});

describe("callback option", () => {
  it("should invoke callback for each heading", () => {
    const calls: { token: { tag: string }; info: { slug: string; title: string } }[] = [];

    md({
      callback: (token, info): void => {
        calls.push({ token, info });
      },
    }).render("# First Heading\n\n## Second Heading");

    expect(calls).toHaveLength(2);
    expect(calls[0].token.tag).toBe("h1");
    expect(calls[0].info.title).toBe("First Heading");
    expect(calls[0].info.slug).toBe("first-heading");
    expect(calls[1].token.tag).toBe("h2");
    expect(calls[1].info.title).toBe("Second Heading");
    expect(calls[1].info.slug).toBe("second-heading");
  });
});

describe("attrs integration", () => {
  it("should preserve pre-set id from attrs plugin", () => {
    expect(mdWithAttrs().render("# H1 {id=custom}\n\n## H2")).toBe(
      '<h1 id="custom" tabindex="-1">H1</h1>\n<h2 id="h2" tabindex="-1">H2</h2>\n',
    );
  });

  it("should throw on duplicate user-defined ids", () => {
    expect(() => {
      mdWithAttrs().render("# H1 {id=dup}\n\n## H2 {id=dup}");
    }).toThrow(
      `User defined "id" attribute "dup" is not unique. Please fix it in your Markdown to continue.`,
    );
  });

  it("should deduplicate when user id conflicts with auto slug", () => {
    expect(mdWithAttrs().render("# H1 {id=h2}\n\n## H2")).toBe(
      '<h1 id="h2" tabindex="-1">H1</h1>\n<h2 id="h2-1" tabindex="-1">H2</h2>\n',
    );
  });
});
