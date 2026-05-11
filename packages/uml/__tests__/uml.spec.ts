import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { uml } from "../src/index.js";

describe(uml, () => {
  it("should render without options", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(uml);

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
    const markdownIt = MarkdownIt({ linkify: true }).use(uml);

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
    const markdownIt = MarkdownIt({ linkify: true }).use(uml);

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

  it("should render with options", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(uml, {
      name: "test",
      open: "teststart",
      close: "testend",
      render: (tokens, index): string => {
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
