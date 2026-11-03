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

// Rendered `badge` / 渲染后的 `badge`
const badge = (link: string): string => `<span class="badge badge-${link}">${link}</span>`;

describe("repeated candidates", () => {
  // A failed candidate is remembered for the rest of the line, so the shapes below are the ones that
  // used to rescan the whole tail. They must stay literal (except for the last match), no matter how
  // many candidates share the tail.
  // 失败的候选会被记录到行尾，因此下面的形状正是过去会重复扫描整段内容的形状。无论有多少候选共享同一段内容，
  // 它们都必须保持为原文本（最后一个匹配除外）。

  it("should keep candidates without a closing `]` literal", () => {
    const md = createMarkdown();
    const source = "@[video a=1 ".repeat(200);

    expect(md.render(source)).toBe(`<p>${source.trimEnd()}</p>\n`);
  });

  it("should keep candidates sharing a `]` that is not followed by `(` literal", () => {
    const md = createMarkdown();
    const source = `${"@[video a=1 ".repeat(200)}]x`;

    expect(md.render(source)).toBe(`<p>${source.trimEnd()}</p>\n`);
  });

  it("should keep candidates with an unterminated quoted value literal", () => {
    const md = createMarkdown();
    const source = '@[video a="x '.repeat(200);

    expect(md.render(source)).toBe(`<p>${source.trimEnd().replaceAll('"', "&quot;")}</p>\n`);
  });

  it("should keep candidates whose closing `)` is missing literal", () => {
    const md = createMarkdown();

    expect(md.render("@[badge a=1 ](x")).toBe("<p>@[badge a=1 ](x</p>\n");
  });

  it("should match a later candidate on the same line", () => {
    const md = createMarkdown();

    // the failed candidates must not reject the ones that follow
    expect(md.render("x @[video a=1 @[badge ](x)")).toBe(`<p>x @[video a=1 ${badge("x")}</p>\n`);
    expect(md.render("x @[video a=1 @[video a=1 @[badge a=1 ](x)")).toBe(
      `<p>x @[video a=1 @[video a=1 ${badge("x")}</p>\n`,
    );
    expect(md.render('x @[video a=1 @[badge text="y" ](x)')).toBe(
      `<p>x @[video a=1 <span class="badge badge-x">y</span></p>\n`,
    );
  });

  it("should scan a candidate hidden in the props of a failed candidate again", () => {
    const md = createMarkdown();

    // the quoted props of `video` are unterminated, but their whitespaces and `]` are hidden inside
    // the quote, so the `@[badge` candidate inside them is still scanned on its own
    expect(md.render('@[video a="x @[badge ](y)')).toBe(`<p>@[video a=&quot;x ${badge("y")}</p>\n`);
    // the same holds when the quote of a failed candidate swallows a `]`
    expect(md.render('@[video a="@[badge a="]"]()')).toBe(`<p>@[video a=&quot;${badge("")}</p>\n`);
  });

  it("should keep the candidates of the following lines independent", () => {
    const md = createMarkdown();

    // the failed candidates of one line must not reject the candidates of the next line, even
    // though both lines belong to the same inline block
    expect(md.render("a @[video a=1\nb @[badge ](c)")).toBe(
      `<p>a @[video a=1\nb ${badge("c")}</p>\n`,
    );
    expect(md.render("a @[video a=1\nb @[video a=2\nc @[badge ](d)")).toBe(
      `<p>a @[video a=1\nb @[video a=2\nc ${badge("d")}</p>\n`,
    );
  });

  it("should keep a block-level candidate on the whole line", () => {
    const md = createMarkdown();

    // the line is matched as a block, so the candidate of the previous line stays literal
    expect(md.render(`${"@[video a=1 ".repeat(3)}\n@[badge ](y)`)).toBe(
      `<p>${"@[video a=1 ".repeat(3).trimEnd()}</p>\n${badge("y")}`,
    );
  });

  it("should match candidates inside a link label", () => {
    const md = createMarkdown();

    // markdown-it tokenizes the label again with a smaller bound, which must not leak the memo of
    // the outer scan
    expect(md.render("[a @[badge ](x) b](/z)")).toBe(`<p><a href="/z">a ${badge("x")} b</a></p>\n`);
    expect(md.render("[@[video a=1 @[badge ](x)](/z)")).toBe(
      `<p>[@<a href="/z">video a=1 ${badge("x")}</a></p>\n`,
    );
  });
});

describe("link cache", () => {
  it("should keep matching the same valid link", () => {
    const md = createMarkdown();
    const links = Array.from({ length: 100 }, (_, index) => `/l${index}`);
    const source = `x ${links.map((link) => `@[badge ](${link})`).join(" ")}`;
    const expected = links.map((link) => badge(link)).join(" ");

    // more links than the cache holds, so the cache is reset in between
    expect(md.render(source)).toBe(`<p>x ${expected}</p>\n`);
    expect(md.render("x @[badge ](/x) @[badge ](/x)")).toBe(
      `<p>x ${badge("/x")} ${badge("/x")}</p>\n`,
    );
  });

  it("should keep rejecting the same invalid link", () => {
    const md = createMarkdown();

    expect(md.render("x @[badge ](javascript:x) @[badge ](javascript:x) @[badge ](ok)")).toBe(
      `<p>x @[badge ](javascript:x) @[badge ](javascript:x) ${badge("ok")}</p>\n`,
    );
  });

  it("should not cache between renders", () => {
    const md = createMarkdown();

    expect(md.render("x @[badge ](/x)")).toBe(`<p>x ${badge("/x")}</p>\n`);

    // the cache belongs to one render, so overriding the normalizer is picked up by the next one
    md.normalizeLink = (url: string): string => `/base/${url}`;

    expect(md.render("x @[badge ](/x)")).toBe(`<p>x ${badge("/base//x")}</p>\n`);
  });
});
