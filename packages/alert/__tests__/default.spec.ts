import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { alert } from "../src/index.js";

const markdownIt = new MarkdownIt({ html: true }).use(alert);
const markdownItDefault = new MarkdownIt({ html: true });

describe("constant default behavior", () => {
  it("should not break blockquote", () => {
    // CommonMark spec blockquote test cases (examples 228-252)
    const testCases = [
      // Example 228
      ["> # Foo\n> bar\n> baz\n", "<blockquote>\n<h1>Foo</h1>\n<p>bar\nbaz</p>\n</blockquote>\n"],
      // Example 229
      ["># Foo\n>bar\n> baz\n", "<blockquote>\n<h1>Foo</h1>\n<p>bar\nbaz</p>\n</blockquote>\n"],
      // Example 230
      [
        "   > # Foo\n   > bar\n > baz\n",
        "<blockquote>\n<h1>Foo</h1>\n<p>bar\nbaz</p>\n</blockquote>\n",
      ],
      // Example 231
      [
        "    > # Foo\n    > bar\n    > baz\n",
        "<pre><code>&gt; # Foo\n&gt; bar\n&gt; baz\n</code></pre>\n",
      ],
      // Example 232
      ["> # Foo\n> bar\nbaz\n", "<blockquote>\n<h1>Foo</h1>\n<p>bar\nbaz</p>\n</blockquote>\n"],
      // Example 233
      ["> bar\nbaz\n> foo\n", "<blockquote>\n<p>bar\nbaz\nfoo</p>\n</blockquote>\n"],
      // Example 234
      ["> foo\n---\n", "<blockquote>\n<p>foo</p>\n</blockquote>\n<hr>\n"],
      // Example 235
      [
        "> - foo\n- bar\n",
        "<blockquote>\n<ul>\n<li>foo</li>\n</ul>\n</blockquote>\n<ul>\n<li>bar</li>\n</ul>\n",
      ],
      // Example 236
      [
        ">     foo\n    bar\n",
        "<blockquote>\n<pre><code>foo\n</code></pre>\n</blockquote>\n<pre><code>bar\n</code></pre>\n",
      ],
      // Example 237
      [
        "> ```\nfoo\n```\n",
        "<blockquote>\n<pre><code></code></pre>\n</blockquote>\n<p>foo</p>\n<pre><code></code></pre>\n",
      ],
      // Example 238
      ["> foo\n    - bar\n", "<blockquote>\n<p>foo\n- bar</p>\n</blockquote>\n"],
      // Example 239
      [">\n", "<blockquote></blockquote>\n"],
      // Example 240
      [">\n>  \n> \n", "<blockquote></blockquote>\n"],
      // Example 241
      [">\n> foo\n>  \n", "<blockquote>\n<p>foo</p>\n</blockquote>\n"],
      // Example 242
      [
        "> foo\n\n> bar\n",
        "<blockquote>\n<p>foo</p>\n</blockquote>\n<blockquote>\n<p>bar</p>\n</blockquote>\n",
      ],
      // Example 243
      ["> foo\n> bar\n", "<blockquote>\n<p>foo\nbar</p>\n</blockquote>\n"],
      // Example 244
      ["> foo\n>\n> bar\n", "<blockquote>\n<p>foo</p>\n<p>bar</p>\n</blockquote>\n"],
      // Example 245
      ["foo\n> bar\n", "<p>foo</p>\n<blockquote>\n<p>bar</p>\n</blockquote>\n"],
      // Example 246
      [
        "> aaa\n***\n> bbb\n",
        "<blockquote>\n<p>aaa</p>\n</blockquote>\n<hr>\n<blockquote>\n<p>bbb</p>\n</blockquote>\n",
      ],
      // Example 247
      ["> bar\nbaz\n", "<blockquote>\n<p>bar\nbaz</p>\n</blockquote>\n"],
      // Example 248
      ["> bar\n\nbaz\n", "<blockquote>\n<p>bar</p>\n</blockquote>\n<p>baz</p>\n"],
      // Example 249
      ["> bar\n>\nbaz\n", "<blockquote>\n<p>bar</p>\n</blockquote>\n<p>baz</p>\n"],
      // Example 250
      [
        "> > > foo\nbar\n",
        "<blockquote>\n<blockquote>\n<blockquote>\n<p>foo\nbar</p>\n</blockquote>\n</blockquote>\n</blockquote>\n",
      ],
      // Example 251
      [
        ">>> foo\n> bar\n>>baz\n",
        "<blockquote>\n<blockquote>\n<blockquote>\n<p>foo\nbar\nbaz</p>\n</blockquote>\n</blockquote>\n</blockquote>\n",
      ],
      // Example 252
      [
        ">     code\n\n>    not code\n",
        "<blockquote>\n<pre><code>code\n</code></pre>\n</blockquote>\n<blockquote>\n<p>not code</p>\n</blockquote>\n",
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItDefault.render(input)).toEqual(output);
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should not break blockquote in lists", () => {
    // CommonMark spec list with blockquote test cases (examples 320-321 from Lists section)
    const testCases = [
      // Example 320
      [
        "* a\n  > b\n  >\n* c\n",
        "<ul>\n<li>a\n<blockquote>\n<p>b</p>\n</blockquote>\n</li>\n<li>c</li>\n</ul>\n",
      ],
      // Example 321
      [
        "- a\n  > b\n  ```\n  c\n  ```\n- d\n",
        "<ul>\n<li>a\n<blockquote>\n<p>b</p>\n</blockquote>\n<pre><code>c\n</code></pre>\n</li>\n<li>d</li>\n</ul>\n",
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItDefault.render(input)).toEqual(output);
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should not break blockquote in complex list items", () => {
    // Additional CommonMark spec test cases for blockquotes in complex scenarios
    const testCases = [
      // Example 288 - List items with blockquotes
      [
        "   1.  A paragraph\n       with two lines.\n\n           indented code\n\n       > A block quote.\n",
        "<ol>\n<li>\n<p>A paragraph\nwith two lines.</p>\n<pre><code>indented code\n</code></pre>\n<blockquote>\n<p>A block quote.</p>\n</blockquote>\n</li>\n</ol>\n",
      ],
      // Example 289 - Indented code block (should not be a list)
      [
        "    1.  A paragraph\n        with two lines.\n\n            indented code\n\n        > A block quote.\n",
        "<pre><code>1.  A paragraph\n    with two lines.\n\n        indented code\n\n    &gt; A block quote.\n</code></pre>\n",
      ],
      // Example 290 - List items with different indentation
      [
        "  1.  A paragraph\nwith two lines.\n\n          indented code\n\n      > A block quote.\n",
        "<ol>\n<li>\n<p>A paragraph\nwith two lines.</p>\n<pre><code>indented code\n</code></pre>\n<blockquote>\n<p>A block quote.</p>\n</blockquote>\n</li>\n</ol>\n",
      ],
      // Example 292 - Nested blockquotes in lists
      [
        "> 1. > Blockquote\ncontinued here.\n",
        "<blockquote>\n<ol>\n<li>\n<blockquote>\n<p>Blockquote\ncontinued here.</p>\n</blockquote>\n</li>\n</ol>\n</blockquote>\n",
      ],
      // Example 293 - Nested blockquotes in lists with continuation
      [
        "> 1. > Blockquote\n> continued here.\n",
        "<blockquote>\n<ol>\n<li>\n<blockquote>\n<p>Blockquote\ncontinued here.</p>\n</blockquote>\n</li>\n</ol>\n</blockquote>\n",
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItDefault.render(input)).toEqual(output);
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should not break blockquote with HTML blocks", () => {
    // CommonMark spec HTML blocks with blockquotes
    const testCases = [
      // Example 174 - HTML blocks in blockquotes
      ["> <div>\n> foo\n\nbar\n", "<blockquote>\n<div>\nfoo\n</blockquote>\n<p>bar</p>\n"],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItDefault.render(input)).toEqual(output);
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should not break blockquote with fenced code blocks", () => {
    // CommonMark spec fenced code blocks with blockquotes
    const testCases = [
      // Example 128 - Fenced code blocks in blockquotes
      [
        "> ```\n> aaa\n\nbbb\n",
        "<blockquote>\n<pre><code>aaa\n</code></pre>\n</blockquote>\n<p>bbb</p>\n",
      ],
      [
        `\
> content
\`\`\`
code block
\`\`\`
`,
        `\
<blockquote>
<p>content</p>
</blockquote>
<pre><code>code block
</code></pre>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItDefault.render(input)).toEqual(output);
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should not break blockquote with setext headings", () => {
    // CommonMark spec setext headings with blockquotes
    const testCases = [
      // Example 101 - Setext headings after blockquotes
      ["> foo\n-----\n", "<blockquote>\n<p>foo</p>\n</blockquote>\n<hr>\n"],
      // Example 92 - Setext headings after blockquotes
      ["> Foo\n---\n", "<blockquote>\n<p>Foo</p>\n</blockquote>\n<hr>\n"],
      // Example 93 - Setext headings in blockquotes
      ["> foo\nbar\n===\n", "<blockquote>\n<p>foo\nbar\n===</p>\n</blockquote>\n"],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItDefault.render(input)).toEqual(output);
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should not break blockquote with tabs", () => {
    const testCases = [
      [
        `\
>\t\ttest
`,
        `\
<blockquote>
<pre><code>  test
</code></pre>
</blockquote>
`,
      ],
      [
        `\
 >\t\ttest
`,
        `\
<blockquote>
<pre><code> test
</code></pre>
</blockquote>
`,
      ],
      [
        `\
  >\t\ttest
`,
        `\
<blockquote>
<pre><code>test
</code></pre>
</blockquote>
`,
      ],
      [
        `\
> ---
>\t\ttest
`,
        `\
<blockquote>
<hr>
<pre><code>  test
</code></pre>
</blockquote>
`,
      ],
      [
        `\
 > ---
 >\t\ttest
`,
        `\
<blockquote>
<hr>
<pre><code> test
</code></pre>
</blockquote>
`,
      ],
      [
        `\
  > ---
  >\t\ttest
`,
        `\
<blockquote>
<hr>
<pre><code>test
</code></pre>
</blockquote>
`,
      ],
      [
        `\
>\t\t\ttest
`,
        `\
<blockquote>
<pre><code>  \ttest
</code></pre>
</blockquote>
`,
      ],
      [
        `\
 >\t\t\ttest
`,
        `\
<blockquote>
<pre><code> \ttest
</code></pre>
</blockquote>
`,
      ],
      [
        `\
  >\t\t\ttest
`,
        `\
<blockquote>
<pre><code>\ttest
</code></pre>
</blockquote>
`,
      ],
      [
        `\
> ---
>\t\t\ttest
`,
        `\
<blockquote>
<hr>
<pre><code>  \ttest
</code></pre>
</blockquote>
`,
      ],
      [
        `\
 > ---
 >\t\t\ttest
`,
        `\
<blockquote>
<hr>
<pre><code> \ttest
</code></pre>
</blockquote>
`,
      ],
      [
        `\
  > ---
  >\t\t\ttest
`,
        `\
<blockquote>
<hr>
<pre><code>\ttest
</code></pre>
</blockquote>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItDefault.render(input)).toEqual(output);
      expect(markdownIt.render(input)).toEqual(output);
    });
  });
});
