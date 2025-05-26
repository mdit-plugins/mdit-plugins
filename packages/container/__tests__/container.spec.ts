import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { container } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(container, {
  name: "test",
});

describe("container", () => {
  it("simple container", () => {
    const content = `\
::: test
*content*
:::

`;

    expect(markdownIt.render(content)).toBe(
      `\
<div class="test">
<p><em>content</em></p>
</div>
`,
    );
  });

  it("should allow block elements in container", () => {
    const content = `\
::: test
### heading

-----------
:::
`;

    expect(markdownIt.render(content)).toBe(
      `\
<div class="test">
<h3>heading</h3>
<hr>
</div>
`,
    );
  });

  it("should allow longer ending marker to close", () => {
    const content = `\
::: test
test
::::

::::: test :::::
  hello world
::::::::::::::::
`;

    expect(markdownIt.render(content)).toBe(
      `\
<div class="test">
<p>test</p>
</div>
<div class="test">
<p>hello world</p>
</div>
`,
    );
  });

  it("support nesting", () => {
    const content = `
::::: test
:::: test
xxx
::::
:::::
`;

    expect(markdownIt.render(content)).toBe(
      `\
<div class="test">
<div class="test">
<p>xxx</p>
</div>
</div>
`,
    );
  });

  it("wrong syntax", () => {
    const content = `\
:::: test
this block is closed with 5 markers below

::::: test
auto-closed block

:::::
::::
`;

    expect(markdownIt.render(content)).toBe(
      `\
<div class="test">
<p>this block is closed with 5 markers below</p>
<div class="test">
<p>auto-closed block</p>
</div>
</div>
<p>::::</p>
`,
    );
  });

  it("ending markers can contain extra indent max to 3", () => {
    const testCases = [
      [
        `\
::: test
content
 :::
`,
        `\
<div class="test">
<p>content</p>
</div>
`,
      ],
      [
        `\
::: test
content
  :::
`,
        `\
<div class="test">
<p>content</p>
</div>
`,
      ],
      [
        `\
::: test
content
   :::
`,
        `\
<div class="test">
<p>content</p>
</div>
`,
      ],
      [
        `\
 ::: test
 content
   :::
`,
        `\
<div class="test">
<p>content</p>
</div>
`,
      ],
      [
        `\
   ::: test
   content
    :::
   :::
`,
        `\
<div class="test">
<p>content
:::</p>
</div>
`,
      ],
      [
        `\
    ::: test
    content
    :::
`,
        `\
<pre><code>::: test
content
:::
</code></pre>
`,
      ],
      [
        `\
  ::: test
   not a code block

    code block
  :::
`,
        `\
<div class="test">
<p>not a code block</p>
<pre><code>code block
</code></pre>
</div>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("renderer", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(container, {
      name: "spoiler",
      openRender: () => "<details><summary>click me</summary>\n",
      closeRender: () => "</details>\n",
    });

    expect(markdownIt.render("::: spoiler\n*content*\n:::\n")).toBe(
      "<details><summary>click me</summary>\n<p><em>content</em></p>\n</details>\n",
    );
  });

  it("2 char marker", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(container, {
      name: "spoiler",
      marker: "->",
    });

    expect(markdownIt.render("->->-> spoiler\n*content*\n->->->\n")).toBe(
      '<div class="spoiler">\n<p><em>content</em></p>\n</div>\n',
    );
  });

  it("marker should not collide with fence", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(container, {
      name: "spoiler",
      marker: "`",
    });

    expect(markdownIt.render("``` spoiler\n*content*\n```\n")).toBe(
      '<div class="spoiler">\n<p><em>content</em></p>\n</div>\n',
    );

    expect(markdownIt.render("\n``` not spoiler\n*content*\n```\n")).toBe(
      '<pre><code class="language-not">*content*\n</code></pre>\n',
    );
  });

  describe("validator", () => {
    it("should skip rule if return value is falsy", () => {
      const markdownIt = MarkdownIt({ linkify: true }).use(container, {
        name: "name",
        validate: () => false,
      });

      expect(markdownIt.render(":::foo\nbar\n:::\n")).toBe(
        "<p>:::foo\nbar\n:::</p>\n",
      );
    });

    it("should accept rule if return value is true", () => {
      const markdownIt = MarkdownIt({ linkify: true }).use(container, {
        name: "name",
        validate: () => true,
      });

      expect(markdownIt.render(":::foo\nbar\n:::\n")).toBe(
        '<div class="name">\n<p>bar</p>\n</div>\n',
      );
    });

    it("rule should call it", () => {
      const spy = vi.fn();
      const markdownIt = MarkdownIt({ linkify: true }).use(container, {
        name: "name",
        validate: spy,
      });

      markdownIt.parse(":\n::\n:::\n::::\n:::::\n", {});
      expect(spy).toBeCalledTimes(6);
    });

    it("should not trim params", () => {
      const markdownIt = MarkdownIt({ linkify: true }).use(container, {
        name: "name",
        validate: (params) => {
          expect(params).toBe(" \tname ");

          return true;
        },
      });

      markdownIt.parse("::: \tname \ncontent\n:::\n", {});
    });

    it("should allow analyze mark", () => {
      const markdownIt = MarkdownIt({ linkify: true }).use(container, {
        name: "name",
        validate: (_, mark) => {
          return mark.length >= 4;
        },
      });

      expect(markdownIt.render(":::\nfoo\n:::\n")).toBe(
        "<p>:::\nfoo\n:::</p>\n",
      );

      expect(markdownIt.render("::::\nfoo\n::::\n")).toBe(
        '<div class="name">\n<p>foo</p>\n</div>\n',
      );
    });
  });
});
