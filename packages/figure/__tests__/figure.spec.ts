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
    ).toEqual(
      `\
<p>test</p>
<p><img src="/logo.svg" alt="image"> test</p>
<p>test <img src="/logo.svg" alt="image"></p>
`,
    );
  });

  it("should use alt it no title is found", () => {
    expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
      '<figure><img src="/logo.svg" alt="image" tabindex="0"><figcaption>image</figcaption></figure>\n',
    );
  });

  it("should use title and remove original title on image", () => {
    expect(markdownIt.render(`![image](/logo.svg "A image")`)).toEqual(
      '<figure><img src="/logo.svg" alt="image" tabindex="0"><figcaption>A image</figcaption></figure>\n',
    );
  });

  it("should not change inline image", () => {
    expect(markdownIt.render(`A ![image](/logo.svg "A image") in text`)).toEqual(
      '<p>A <img src="/logo.svg" alt="image" title="A image"> in text</p>\n',
    );
  });

  it("should support image with links", () => {
    expect(markdownIt.render(`[![image](/logo.svg)](https://example.com)`)).toEqual(
      '<figure><a href="https://example.com"><img src="/logo.svg" alt="image" tabindex="0"></a><figcaption>image</figcaption></figure>\n',
    );

    expect(markdownIt.render(`[![image](/logo.svg "A image")](https://example.com)`)).toEqual(
      '<figure><a href="https://example.com"><img src="/logo.svg" alt="image" tabindex="0"></a><figcaption>A image</figcaption></figure>\n',
    );
  });

  it("should ignore image in headings or tables", () => {
    expect(markdownIt.render("# ![image](/logo.svg)")).toEqual(
      '<h1><img src="/logo.svg" alt="image"></h1>\n',
    );
    expect(markdownIt.render("| ![image](/logo.svg) |\n| --- |")).toContain(
      '<th><img src="/logo.svg" alt="image"></th>',
    );
  });

  it("should handle empty caption", () => {
    expect(markdownIt.render("![](/logo.svg)")).toEqual(
      '<figure><img src="/logo.svg" alt="" tabindex="0"><figcaption></figcaption></figure>\n',
    );
  });

  it("should support focusable option", () => {
    const md = new MarkdownIt().use(figure, { focusable: false });

    expect(md.render("![image](/logo.svg)")).toEqual(
      '<figure><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
    );
  });

  it("should not covert existing figure tags to markdown-it-figure", () => {
    expect(
      markdownIt.render(`\
<figure>
<img src="/logo.svg" alt="image" tabindex="0"><figcaption>A image</figcaption>
</figure>
`),
    ).toEqual(
      `<figure>\n<img src="/logo.svg" alt="image" tabindex="0"><figcaption>A image</figcaption>\n</figure>\n`,
    );

    expect(
      markdownIt.render(`\
<figure>

<img src="/logo.svg" alt="image" tabindex="0">

</figure>
`),
    ).toEqual(`<figure>\n<img src="/logo.svg" alt="image" tabindex="0">\n</figure>\n`);
  });
});
