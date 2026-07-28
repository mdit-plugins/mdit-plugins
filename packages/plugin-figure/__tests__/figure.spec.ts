import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { figure } from "../src/index.js";

describe(figure, () => {
  const markdownIt = MarkdownIt({ html: true, linkify: true }).use(figure);

  it("should ignore unrelated content", () => {
    expect(
      markdownIt.render(`\
test

![image](/logo.svg) test

test ![image](/logo.svg)
`),
    ).toBe(
      `\
<p>test</p>
<p><img src="/logo.svg" alt="image"> test</p>
<p>test <img src="/logo.svg" alt="image"></p>
`,
    );
  });

  it("should use alt it no title is found", () => {
    expect(markdownIt.render(`![image](/logo.svg)`)).toBe(
      '<figure><img src="/logo.svg" alt="image" tabindex="0"><figcaption>image</figcaption></figure>\n',
    );
  });

  it("should use title and remove original title on image", () => {
    expect(markdownIt.render(`![image](/logo.svg "A image")`)).toBe(
      '<figure><img src="/logo.svg" alt="image" tabindex="0"><figcaption>A image</figcaption></figure>\n',
    );
  });

  it("should not change inline image", () => {
    expect(markdownIt.render(`A ![image](/logo.svg "A image") in text`)).toBe(
      '<p>A <img src="/logo.svg" alt="image" title="A image"> in text</p>\n',
    );
  });

  it("should support image with links", () => {
    expect(markdownIt.render(`[![image](/logo.svg)](https://example.com)`)).toBe(
      '<figure><a href="https://example.com"><img src="/logo.svg" alt="image" tabindex="0"></a><figcaption>image</figcaption></figure>\n',
    );

    expect(markdownIt.render(`[![image](/logo.svg "A image")](https://example.com)`)).toBe(
      '<figure><a href="https://example.com"><img src="/logo.svg" alt="image" tabindex="0"></a><figcaption>A image</figcaption></figure>\n',
    );
  });

  it("should ignore image in headings or tables", () => {
    expect(markdownIt.render("# ![image](/logo.svg)")).toBe(
      '<h1><img src="/logo.svg" alt="image"></h1>\n',
    );
    expect(markdownIt.render("| ![image](/logo.svg) |\n| --- |")).toContain(
      '<th><img src="/logo.svg" alt="image"></th>',
    );
  });

  it("should not convert images in tight list items", () => {
    expect(
      markdownIt.render(`\
- ![a](1.png "c1")
- ![b](2.png "c2")
`),
    ).toBe(
      `\
<ul>
<li><img src="1.png" alt="a" title="c1"></li>
<li><img src="2.png" alt="b" title="c2"></li>
</ul>
`,
    );
  });

  it("should convert images in loose list items", () => {
    expect(
      markdownIt.render(`\
- ![a](1.png "c1")

- ![b](2.png "c2")
`),
    ).toBe(
      `\
<ul>
<li>
<figure><img src="1.png" alt="a" tabindex="0"><figcaption>c1</figcaption></figure>
</li>
<li>
<figure><img src="2.png" alt="b" tabindex="0"><figcaption>c2</figcaption></figure>
</li>
</ul>
`,
    );
  });

  it("should not add figcaption when caption is empty", () => {
    expect(markdownIt.render("![](/logo.svg)")).toBe(
      '<figure><img src="/logo.svg" alt="" tabindex="0"></figure>\n',
    );

    expect(markdownIt.render("[![](/logo.svg)](https://example.com)")).toBe(
      '<figure><a href="https://example.com"><img src="/logo.svg" alt="" tabindex="0"></a></figure>\n',
    );
  });

  it("should support focusable option", () => {
    const md = new MarkdownIt().use(figure, { focusable: false });

    expect(md.render("![image](/logo.svg)")).toBe(
      '<figure><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
    );
  });

  it("should support linkImage option", () => {
    const md = new MarkdownIt().use(figure, { linkImage: false });

    expect(md.render("![image](/logo.svg)")).toBe(
      '<figure><img src="/logo.svg" alt="image" tabindex="0"><figcaption>image</figcaption></figure>\n',
    );
    expect(md.render(`[![image](/logo.svg)](https://example.com)`)).toBe(
      '<p><a href="https://example.com"><img src="/logo.svg" alt="image"></a></p>\n',
    );
  });

  it("should not covert existing figure tags to markdown-it-figure", () => {
    expect(
      markdownIt.render(`\
<figure>
<img src="/logo.svg" alt="image" tabindex="0"><figcaption>A image</figcaption>
</figure>
`),
    ).toBe(
      `<figure>\n<img src="/logo.svg" alt="image" tabindex="0"><figcaption>A image</figcaption>\n</figure>\n`,
    );

    expect(
      markdownIt.render(`\
<figure>

<img src="/logo.svg" alt="image" tabindex="0">

</figure>
`),
    ).toBe(`<figure>\n<img src="/logo.svg" alt="image" tabindex="0">\n</figure>\n`);
  });
});
