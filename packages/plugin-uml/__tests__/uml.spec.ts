import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { uml } from "../src/index.js";

describe(uml, () => {
  it("should render without options", () => {
    const markdownIt = new MarkdownIt({ linkify: true }).use(uml);

    expect(
      markdownIt.render(`
@start

abc

@end
    `),
    ).toBe(`\
<div class="uml" title="">
abc
</div>\
`);

    expect(
      markdownIt.render(`
text.
@start
abc
@end
    `),
    ).toBe(`\
<p>text.</p>
<div class="uml" title="">abc</div>\
`);

    expect(
      markdownIt.render(`
- @start

  abc

  def

ghi
    `),
    ).toBe(`\
<ul>
<li>
<div class="uml" title="">
abc

def
</div></li>
</ul>
<p>ghi</p>
`);
  });

  it("should not render", () => {
    const markdownIt = new MarkdownIt({ linkify: true }).use(uml);

    expect(
      markdownIt.render(`
start

abc

end
    `),
    ).toBe(`\
<p>start</p>
<p>abc</p>
<p>end</p>
`);

    expect(
      markdownIt.render(`
@star

abc

@end
    `),
    ).toBe(`\
<p>@star</p>
<p>abc</p>
<p>@end</p>
`);
  });

  it("should keep content as is", () => {
    const markdownIt = new MarkdownIt({ linkify: true }).use(uml);

    expect(
      markdownIt.render(`
@start

Text with **bold** and \`code\`.

@end
    `),
    ).toBe(`\
<div class="uml" title="">
Text with **bold** and \`code\`.
</div>\
`);
  });

  it("should escape info in default render", () => {
    const markdownIt = new MarkdownIt({ linkify: true }).use(uml);

    expect(
      markdownIt.render(`
@start" onclick="alert(1)
abc
@end
    `),
    ).toBe(`\
<div class="uml" title="&quot; onclick=&quot;alert(1)">abc</div>\
`);
  });

  it("should escape content in default render", () => {
    const markdownIt = new MarkdownIt({ linkify: true }).use(uml);
    const result = markdownIt.render(`
@start
</div><script>alert(1)</script>
@end
    `);

    expect(result).not.toContain("<script>");
    expect(result).toBe(`\
<div class="uml" title="">&lt;/div&gt;&lt;script&gt;alert(1)&lt;/script&gt;</div>\
`);
  });

  it("should keep raw content in default render when html is enabled", () => {
    const markdownIt = new MarkdownIt({ html: true }).use(uml);

    expect(markdownIt.render("@start\n<b>raw</b>\n@end\n")).toBe(
      '<div class="uml" title=""><b>raw</b></div>',
    );
  });

  it("should escape content in default render when html is disabled", () => {
    const markdownIt = new MarkdownIt({ html: false }).use(uml);

    expect(markdownIt.render("@start\n<b>raw</b>\n@end\n")).toBe(
      '<div class="uml" title="">&lt;b&gt;raw&lt;/b&gt;</div>',
    );
  });

  it("should always escape title regardless of html option", () => {
    const source = '@start"><script>alert(1)</script>\nabc\n@end\n';
    const expected =
      '<div class="uml" title="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;">abc</div>';

    expect(new MarkdownIt({ html: true }).use(uml).render(source)).toBe(expected);
    expect(new MarkdownIt({ html: false }).use(uml).render(source)).toBe(expected);
  });

  it("should keep raw content for custom renderer", () => {
    const markdownIt = new MarkdownIt({ linkify: true }).use(uml, {
      name: "uml",
      open: "start",
      close: "end",
      renderer: (tokens, index): string => tokens[index].content,
    });

    expect(markdownIt.render("@start\n<b>raw</b>\n@end\n")).toBe("<b>raw</b>");
  });

  it("should render with options", () => {
    const markdownIt = new MarkdownIt({ linkify: true }).use(uml, {
      name: "test",
      open: "teststart",
      close: "testend",
      renderer: (tokens, index): string => {
        const token = tokens[index];
        const { content, info, type } = token;

        return `<Test class="${type}" title="${info}">${content}</Test>`;
      },
    });

    expect(
      markdownIt.render(`
@teststart

abc

def

@testend
`),
    ).toBe(`\
<Test class="test" title="">
abc

def
</Test>\
`);
  });
});
