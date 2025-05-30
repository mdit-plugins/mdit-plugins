import { katex } from "@mdit/plugin-katex";
import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { replaceDelimiters } from "./replaceDelimiters.js";
import { getAttrs } from "../src/helper/getAttrs.js";
import type { MarkdownItAttrsOptions } from "../src/index.js";
import { attrs } from "../src/index.js";

describe("rule settings", () => {
  it("should disable all rules when rule option is false", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      rule: false,
    });

    // None of the attrs should be applied when rules are disabled
    const src = "text {.class}";
    const expected = "<p>text {.class}</p>\n";

    expect(markdownIt.render(src)).toBe(expected);
  });

  it("should only enable specific rules when rule is array", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      rule: ["fence", "table"], // Only enable fence and table rules
    });

    // Code block should work (fence rule enabled)
    const codeBlockSrc = "```python {.highlight}\nprint('test')\n```";

    expect(markdownIt.render(codeBlockSrc)).toContain(
      'class="highlight language-python"',
    );

    // Inline attributes should NOT work (inline rule disabled)
    const inlineSrc = "text {.class}";

    expect(markdownIt.render(inlineSrc)).toBe("<p>text {.class}</p>\n");
  });

  it("should filter out invalid rule names", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      rule: ["fence", "invalid-rule", "table", "another-invalid"], // Mix of valid and invalid
    });

    // Should still work for valid rules
    const codeBlockSrc = "```python {.highlight}\nprint('test')\n```";

    expect(markdownIt.render(codeBlockSrc)).toContain(
      'class="highlight language-python"',
    );
  });

  it("should handle empty rule array", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      rule: [], // Empty array should disable all rules
    });

    const src = "text {.class}";
    const expected = "<p>text {.class}</p>\n";

    expect(markdownIt.render(src)).toBe(expected);
  });

  it("should not throw when getting only allowed option", () => {
    const markdownIt = MarkdownIt().use(attrs, {
      allowed: [/^(class|attr)$/],
    });

    expect(markdownIt.render("text {.some-class #some-id attr=allowed}")).toBe(
      '<p class="some-class" attr="allowed">text</p>\n',
    );
  });
});

const describeTestsWithOptions = (
  options: Required<MarkdownItAttrsOptions>,
  postText: string,
): void => {
  describe("markdown-it-attrs.utils" + postText, () => {
    it(
      replaceDelimiters(
        "should parse {.class ..css-module #id key=val .class.with.dot}",
        options,
      ),
      () => {
        const src = "{.red ..mod #head key=val .class.with.dot}";
        const expected = [
          ["class", "red"],
          ["css-module", "mod"],
          ["id", "head"],
          ["key", "val"],
          ["class", "class.with.dot"],
        ];

        expect(getAttrs(replaceDelimiters(src, options), 0, options)).toEqual(
          expected,
        );
      },
    );

    it(
      replaceDelimiters("should parse attributes with = {attr=/id=1}", options),
      () => {
        const src = "{link=/some/page/in/app/id=1}";
        const expected = [["link", "/some/page/in/app/id=1"]];

        expect(getAttrs(replaceDelimiters(src, options), 0, options)).toEqual(
          expected,
        );
      },
    );
  });

  describe("markdown-it-attrs" + postText, () => {
    const markdownIt = MarkdownIt().use(attrs, options);

    it(
      replaceDelimiters(
        "should add attributes when {} in end of last inline",
        options,
      ),
      () => {
        const src = "some text {with=attrs}";
        const expected = '<p with="attrs">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        "should not add attributes when it has too many delimiters {{}}",
        options,
      ),
      () => {
        const src = "some text {{with=attrs}}";
        const expected = "<p>some text {{with=attrs}}</p>\n";

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          replaceDelimiters(expected, options),
        );
      },
    );

    it(
      replaceDelimiters("should add attributes when {} in last line", options),
      () => {
        const src = "some text\n{with=attrs}";
        const expected = '<p with="attrs">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        "should add classes with {.class} dot notation",
        options,
      ),
      () => {
        const src = "some text {.green}";
        const expected = '<p class="green">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        "should add css-modules with {..css-module} double dot notation",
        options,
      ),
      () => {
        const src = "some text {..green}";
        const expected = '<p css-module="green">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        "should add identifiers with {#id} hashtag notation",
        options,
      ),
      () => {
        const src = "some text {#section2}";
        const expected = '<p id="section2">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        "should support classes, css-modules, identifiers and attributes in same {}",
        options,
      ),
      () => {
        const src = "some text {attr=lorem .class ..css-module #id}";
        const expected =
          '<p attr="lorem" class="class" css-module="css-module" id="id">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        'should support attributes inside " {attr="lorem ipsum"}',
        options,
      ),
      () => {
        const src = 'some text {attr="lorem ipsum"}';
        const expected = '<p attr="lorem ipsum">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        'should add classes in same class attribute {.c1 .c2} -> class="c1 c2"',
        options,
      ),
      () => {
        const src = "some text {.c1 .c2}";
        const expected = '<p class="c1 c2">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        'should add css-modules in same css-modules attribute {..c1 ..c2} -> css-module="c1 c2"',
        options,
      ),
      () => {
        const src = "some text {..c1 ..c2}";
        const expected = '<p css-module="c1 c2">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        'should add nested css-modules {..c1.c2} -> css-module="c1.c2"',
        options,
      ),
      () => {
        const src = "some text {..c1.c2}";
        const expected = '<p css-module="c1.c2">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(replaceDelimiters("should support empty inline tokens", options), () => {
      const fn = vi.fn();
      const src = " 1 | 2 \n --|-- \n a | ";

      try {
        markdownIt.render(replaceDelimiters(src, options));
      } catch {
        fn();
      }

      expect(fn).toBeCalledTimes(0);
    });

    it(
      replaceDelimiters("should add classes to inline elements", options),
      () => {
        const src = "paragraph **bold**{.red} asdf";
        const expected =
          '<p>paragraph <strong class="red">bold</strong> asdf</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        "should not add classes to inline elements with too many {{}}",
        options,
      ),
      () => {
        const src = "paragraph **bold**{{.red}} asdf";
        const expected =
          "<p>paragraph <strong>bold</strong>{{.red}} asdf</p>\n";

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          replaceDelimiters(expected, options),
        );
      },
    );

    it(replaceDelimiters("should only remove last {}", options), () => {
      const src = "{{.red}";
      const expected = replaceDelimiters('<p class="red">{</p>\n', options);

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(replaceDelimiters("should add classes for list items", options), () => {
      const src = "- item 1{.red}\n- item 2";

      const expected = `\
<ul>
<li class="red">item 1</li>
<li>item 2</li>
</ul>
`;

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(replaceDelimiters("should add classes in nested lists", options), () => {
      const src = `\
- item 1{.a}
  - nested item {.b}
  {.c}
    1. nested nested item {.d}
    {.e}
`;

      const expected = `\
<ul>
<li class="a">item 1
<ul class="c">
<li class="b">nested item
<ol class="e">
<li class="d">nested nested item</li>
</ol>
</li>
</ul>
</li>
</ul>
`;

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(
      replaceDelimiters("should work with nested inline elements", options),
      () => {
        const src = "- **bold *italics*{.blue}**{.green}";

        const expected = `\
<ul>
<li><strong class="green">bold <em class="blue">italics</em></strong></li>
</ul>
`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters("should add class to inline code block", options),
      () => {
        const src = "bla `click()`{.c}";
        const expected = '<p>bla <code class="c">click()</code></p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters("should not trim unrelated white space", options),
      () => {
        const src = "- **bold** text {.red}";

        const expected = `\
<ul>
<li class="red"><strong>bold</strong> text</li>
</ul>
`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(replaceDelimiters("should not create empty attributes", options), () => {
      const src = "text { .red }";
      const expected = '<p class="red">text</p>\n';

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(
      replaceDelimiters(
        "should add attributes to ul when below last bullet point",
        options,
      ),
      () => {
        const src = "- item1\n- item2\n{.red}";
        const expected =
          '<ul class="red">\n<li>item1</li>\n<li>item2</li>\n</ul>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        "should add classes for both last list item and ul",
        options,
      ),
      () => {
        const src = "- item{.red}\n{.blue}";

        const expected = `\
<ul class="blue">
<li class="red">item</li>
</ul>
`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters('should add class ul after a "soft-break"', options),
      () => {
        const src = "- item\n{.blue}";

        const expected = `\
<ul class="blue">
<li>item</li>
</ul>
`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters(
        'should ignore non-text "attr-like" text after a "soft-break"',
        options,
      ),
      () => {
        const src = "- item\n*{.blue}*";

        const expected = `\
<ul>
<li>item\n<em>{.blue}</em></li>
</ul>
`;

        expect(markdownIt.render(src)).toBe(expected);
      },
    );

    it(replaceDelimiters("should work with ordered lists", options), () => {
      const src = "1. item\n{.blue}";

      const expected = `\
<ol class="blue">
<li>item</li>
</ol>
`;

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(
      replaceDelimiters("should work with typography enabled", options),
      () => {
        const src = 'text {key="val with spaces"}';
        const expected = '<p key="val with spaces">text</p>\n';

        expect(
          markdownIt
            .set({ typographer: true })
            .render(replaceDelimiters(src, options)),
        ).toBe(expected);
      },
    );

    it(replaceDelimiters("should support code blocks", options), () => {
      const src = "```{.c a=1 #ii}\nfor i in range(10):\n```";
      const expected =
        '<pre><code class="c" a="1" id="ii">for i in range(10):\n</code></pre>\n';

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(
      replaceDelimiters(
        "should support code blocks with language defined",
        options,
      ),
      () => {
        const src = "```python {.c a=1 #ii}\nfor i in range(10):\n```";
        const expected =
          '<pre><code class="c language-python" a="1" id="ii">for i in range(10):\n</code></pre>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(replaceDelimiters("should support blockquote", options), () => {
      const src = "> quote\n{.c}";
      const expected = '<blockquote class="c">\n<p>quote</p>\n</blockquote>\n';

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(replaceDelimiters("should support tables", options), () => {
      const src = `\
| h1 | h2 |
| -- | -- |
| c1 | c1 |

{.c}`;

      const expected = `\
<table class="c">
<thead>
<tr>
<th>h1</th>
<th>h2</th>
</tr>
</thead>
<tbody>
<tr>
<td>c1</td>
<td>c1</td>
</tr>
</tbody>
</table>
`;

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(replaceDelimiters("should support nested lists", options), () => {
      const src = `\
- item
  - nested
  {.red}

{.blue}
`;

      const expected = `\
<ul class="blue">
<li>item
<ul class="red">
<li>nested</li>
</ul>
</li>
</ul>
`;

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(replaceDelimiters("should support images", options), () => {
      const src = "![alt](img.png){.a}";
      const expected = '<p><img src="img.png" alt="alt" class="a"></p>\n';

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(
      replaceDelimiters("should not apply inside `code{.red}`", options),
      () => {
        const src = "paragraph `code{.red}`";
        const expected = "<p>paragraph <code>code{.red}</code></p>\n";

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          replaceDelimiters(expected, options),
        );
      },
    );

    it(
      replaceDelimiters(
        "should not apply inside item lists with trailing `code{.red}`",
        options,
      ),
      () => {
        const src = "- item with trailing `code = {.red}`";
        const expected =
          "<ul>\n<li>item with trailing <code>code = {.red}</code></li>\n</ul>\n";

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          replaceDelimiters(expected, options),
        );
      },
    );

    it(
      replaceDelimiters(
        "should not apply inside item lists with trailing non-text, eg *{.red}*",
        options,
      ),
      () => {
        const src = "- item with trailing *{.red}*";
        const expected =
          "<ul>\n<li>item with trailing <em>{.red}</em></li>\n</ul>\n";

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          replaceDelimiters(expected, options),
        );
      },
    );

    it(
      replaceDelimiters(
        "should work with multiple inline code blocks in same paragraph",
        options,
      ),
      () => {
        const src = "bla `click()`{.c} blah `release()`{.cpp}";
        const expected =
          '<p>bla <code class="c">click()</code> blah <code class="cpp">release()</code></p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters("should support {} curlies with length == 3", options),
      () => {
        const src = "text {1}";
        const expected = '<p 1="">text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it(
      replaceDelimiters("should do nothing with empty className {.}", options),
      () => {
        const src = "text {.}";
        const expected = "<p>text {.}</p>\n";

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          replaceDelimiters(expected, options),
        );
      },
    );

    it(
      replaceDelimiters("should do nothing with empty id {#}", options),
      () => {
        const src = "text {#}";
        const expected = "<p>text {#}</p>\n";

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          replaceDelimiters(expected, options),
        );
      },
    );

    it(
      replaceDelimiters("should support horizontal rules ---{#id}", options),
      () => {
        const src = "---{#id}";
        const expected = '<hr id="id">\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );

    it("should restrict attributes by allowed (string)", () => {
      const markdownItWithOptions = MarkdownIt().use(attrs, {
        ...options,
        allowed: ["id", "class"],
      });

      const src = "text {.some-class #some-id attr=notAllowed}";
      const expected = '<p class="some-class" id="some-id">text</p>\n';

      expect(
        markdownItWithOptions.render(replaceDelimiters(src, options)),
      ).toBe(expected);
    });

    it("should restrict attributes by allowed (regex)", () => {
      const markdownItWithOptions = MarkdownIt().use(attrs, {
        ...options,
        allowed: [/^(class|attr)$/],
      });

      const src = "text {.some-class #some-id attr=allowed}";
      const expected = '<p class="some-class" attr="allowed">text</p>\n';

      expect(
        markdownItWithOptions.render(replaceDelimiters(src, options)),
      ).toBe(expected);
    });

    it("should support multiple classes for <hr>", () => {
      const src = "--- {.a .b}";
      const expected = '<hr class="a b">\n';

      expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
    });

    it(
      replaceDelimiters(
        "should not crash on {#ids} in front of list items",
        options,
      ),
      () => {
        const src = "- {#ids} [link](./link)";
        const expected = replaceDelimiters(
          '<ul>\n<li>{#ids} <a href="./link">link</a></li>\n</ul>\n',
          options,
        );

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      },
    );
  });
};

describeTestsWithOptions(
  {
    left: "{",
    right: "}",
    allowed: [],
    rule: "all",
  },
  "",
);

describeTestsWithOptions(
  {
    left: "[",
    right: "]",
    allowed: [],
    rule: "all",
  },
  " with [ ] delimiters",
);

describeTestsWithOptions(
  {
    left: "[[",
    right: "]]",
    allowed: [],
    rule: "all",
  },
  " with [[ ]] delimiters",
);

it("should work with katex plugin", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(attrs).use(katex);

  expect(markdownIt.render("$a^{3}$")).toBe(
    '<p><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>a</mi><mn>3</mn></msup></mrow><annotation encoding="application/x-tex">a^{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span></span></span></span></span></span></span></span></p>\n',
  );
});

it("should handle VuePress line numbers in code blocks", () => {
  const markdownIt = MarkdownIt().use(attrs);

  // Test the VuePress line number regex: /{(?:[\d,-]+)}/
  const src = "```python{1,3-5} {.highlight}\nprint('hello')\n```";
  const result = markdownIt.render(src);

  expect(result).toContain('class="highlight language-python"');
  expect(result).toContain('<code class="highlight language-python">');

  // Test various VuePress line number patterns
  const testCases = [
    "```js{1} {.class}\nconsole.log('test');\n```",
    "```js{1,3-5} {.class}\nconsole.log('test');\n```",
    "```js{1,3-5,7} {.class}\nconsole.log('test');\n```",
  ];

  testCases.forEach((src) => {
    const result = markdownIt.render(src);

    expect(result).toContain('class="class language-js"');
    expect(result).toContain('<code class="class language-js">');
  });
});
