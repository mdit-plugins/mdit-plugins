import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { container } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(container, {
  name: "test",
});

describe("container", () => {
  it("simple container", () => {
    const testCases = [
      [
        `\
::: test
*content*
:::
`,
        `\
<div class="test">
<p><em>content</em></p>
</div>
`,
      ],
      [
        `\
::: test

*content*

:::
`,
        `\
<div class="test">
<p><em>content</em></p>
</div>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
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

  it("ending markers must be the same indent", () => {
    const testCases = [
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
- ::: test
  text

    text
  
      code block
  :::
`,
        `\
<ul>
<li>
<div class="test">
<p>text</p>
<p>text</p>
<pre><code>code block
</code></pre>
</div>
</li>
</ul>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("should not break code fence", () => {
    const testCases = [
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
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("space before name is optional and can be multiple", () => {
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
:::test
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
:::  test
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
:::   test
content
:::
`,
        `\
<div class="test">
<p>content</p>
</div>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("allow other params after container name", () => {
    const testCases = [
      [
        `\
::: test param1 param2
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
        `
::: test a=1 b=2
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
::: test with some spaces and special chars !@#$%^&*()
content
:::
`,
        `\
<div class="test">
<p>content</p>
</div>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("ending marker can not contain params", () => {
    const testCases = [
      [
        `\
::: test
xxx
::: arg=123
`,
        `\
<div class="test">
<p>xxx
::: arg=123</p>
</div>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("container name must be a exact word", () => {
    const testCases = [
      [
        `\
::: testtest
xxx
:::
`,
        `\
<p>::: testtest
xxx
:::</p>
`,
      ],
      [
        `\
:::test1
xxx
:::
`,
        `\
<p>:::test1
xxx
:::</p>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("container should be auto close if it is not closed", () => {
    const testCases = [
      [
        `\
::: test
xxx`,
        `\
<div class="test">
<p>xxx</p>
</div>
`,
      ],
      [
        `\
- ::: test
  xxx
  yyy
`,
        `\
<ul>
<li>
<div class="test">
<p>xxx
yyy</p>
</div>
</li>
</ul>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("should allow empty container", () => {
    const testCases = [
      [
        `\
::: test
:::
`,
        `\
<div class="test"></div>
`,
      ],
      [
        `\
::: test args
:::
`,
        `\
<div class="test"></div>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("container should terminate paragraph", () => {
    const testCases = [
      [
        `\
blah blah
::: test
content
:::
`,
        `\
<p>blah blah</p>
<div class="test">
<p>content</p>
</div>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("negative indent should terminate container", () => {
    const testCases = [
      [
        `\
 ::: test
 content
text
`,

        `\
<div class="test">
<p>content</p>
</div>
<p>text</p>
`,
      ],
      [
        `\
 ::: test
 content
text
 :::
`,

        `\
<div class="test">
<p>content</p>
</div>
<p>text
:::</p>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("nesting with others", () => {
    const testCases = [
      [
        `\
- ::: test
  - xxx
  :::
`,
        `\
<ul>
<li>
<div class="test">
<ul>
<li>xxx</li>
</ul>
</div>
</li>
</ul>
`,
      ],
      [
        `\
> ::: test
> xxx
>> yyy
> zzz
> :::`,
        `\
<blockquote>
<div class="test">
<p>xxx</p>
<blockquote>
<p>yyy
zzz</p>
</blockquote>
</div>
</blockquote>
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

    const testCases = [
      [
        "::: spoiler\n*content*\n:::\n",
        "<details><summary>click me</summary>\n<p><em>content</em></p>\n</details>\n",
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("2 char marker", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(container, {
      name: "spoiler",
      marker: "->",
    });

    const testCases = [
      [
        "->->-> spoiler\n*content*\n->->->\n",
        '<div class="spoiler">\n<p><em>content</em></p>\n</div>\n',
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it("marker should not collide with fence", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(container, {
      name: "spoiler",
      marker: "`",
    });

    const testCases = [
      ["``` spoiler\n*content*\n```\n", '<div class="spoiler">\n<p><em>content</em></p>\n</div>\n'],
      [
        "\n``` not spoiler\n*content*\n```\n",
        '<pre><code class="language-not">*content*\n</code></pre>\n',
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toBe(expected);
    });
  });

  it('should throw if "name" is not provided', () => {
    expect(() => {
      MarkdownIt({ linkify: true }).use(container);
    }).toThrowError("[@mdit/plugin-container]: 'name' option is required.");
    expect(() => {
      MarkdownIt({ linkify: true }).use(container, {});
    }).toThrowError("[@mdit/plugin-container]: 'name' option is required.");
  });

  describe("validator", () => {
    it("should skip rule if return value is falsy", () => {
      const markdownIt = MarkdownIt({ linkify: true }).use(container, {
        name: "name",
        validate: () => false,
      });

      expect(markdownIt.render(":::foo\nbar\n:::\n")).toBe("<p>:::foo\nbar\n:::</p>\n");
    });

    it("should accept rule if return value is true", () => {
      const markdownIt = MarkdownIt({ linkify: true }).use(container, {
        name: "name",
        validate: () => true,
      });

      expect(
        markdownIt.render(`\
:::foo
bar
:::
`),
      ).toBe(`\
<div class="name">
<p>bar</p>
</div>
`);
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

      expect(markdownIt.render(":::\nfoo\n:::\n")).toBe("<p>:::\nfoo\n:::</p>\n");

      expect(markdownIt.render("::::\nfoo\n::::\n")).toBe(
        '<div class="name">\n<p>foo</p>\n</div>\n',
      );
    });
  });
});
