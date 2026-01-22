import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { alert } from "../src/index.js";

const markdownIt = new MarkdownIt({ html: true }).use(alert);
const markdownItDefault = new MarkdownIt({ html: true });

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

describe("alert", () => {
  it("should render default alerts", () => {
    const testCases = [
      [
        `\
> [!Important]
> This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
      [
        `\
> [!note]
> This is a note
`,
        `\
<div class="markdown-alert markdown-alert-note">
<p class="markdown-alert-title">Note</p>
<p>This is a note</p>
</div>
`,
      ],
      [
        `\
> [!tip]
> This is a tip note
`,
        `\
<div class="markdown-alert markdown-alert-tip">
<p class="markdown-alert-title">Tip</p>
<p>This is a tip note</p>
</div>
`,
      ],
      [
        `\
> [!warning]
> This is a warning note
`,
        `\
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title">Warning</p>
<p>This is a warning note</p>
</div>
`,
      ],
      [
        `\
> [!caution]
> This is a caution note
`,
        `\
<div class="markdown-alert markdown-alert-caution">
<p class="markdown-alert-title">Caution</p>
<p>This is a caution note</p>
</div>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should ignore casing in alert names", () => {
    const testCases = [
      [
        `\
> [!Important]
> This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
      [
        `\
> [!important]
> This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
      [
        `\
> [!imporTANT]
> This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should handle spaces and tabs", () => {
    const testCases = [
      // Basic space handling
      [
        `\
>[!important]
>This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
      [
        `\
>[!important]
> This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
      [
        `\
> [!important]
>This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
      // Multiple spaces before alert type
      [
        `\
>  [!Important]
> This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
      [
        `\
>   [!Important]
> This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
      // Trailing spaces
      [
        `\
> [!Important]                      
> This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`,
      ],
      // Multi-line content with empty lines
      [
        `\
> [!important]
>
> This is an important note
>
> This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
<p>This is an important note</p>
</div>
`,
      ],
      [
        `\
> [!important]
>
>
>This is an important note
>
>
>This is an important note
`,
        `\
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
<p>This is an important note</p>
</div>
`,
      ],
      // Tab handling - single tab (should work)
      [
        `\
>\t[!tip]
>\tThis is a tip
`,
        `\
<div class="markdown-alert markdown-alert-tip">
<p class="markdown-alert-title">Tip</p>
<p>This is a tip</p>
</div>
`,
      ],
      // Tab with space after
      [
        `\
>\t [!caution]
>\t This is a caution
`,
        `\
<div class="markdown-alert markdown-alert-caution">
<p class="markdown-alert-title">Caution</p>
<p>This is a caution</p>
</div>
`,
      ],
      // Alert with indentation (1 space + tab)
      [
        `\
 >\t[!note]
 >\tThis is a note
`,
        `\
<div class="markdown-alert markdown-alert-note">
<p class="markdown-alert-title">Note</p>
<p>This is a note</p>
</div>
`,
      ],
      // Alert with indentation (2 spaces + tab)
      [
        `\
  >\t[!warning]
  >\tThis is a warning
`,
        `\
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title">Warning</p>
<p>This is a warning</p>
</div>
`,
      ],
      // Tab content in alert
      [
        `\
> [!caution]
>\tThis content has tab indentation
>\tand should still work correctly
`,
        `\
<div class="markdown-alert markdown-alert-caution">
<p class="markdown-alert-title">Caution</p>
<p>This content has tab indentation
and should still work correctly</p>
</div>
`,
      ],
      // Double tabs (should become code block, not alert)
      [
        `\
>\t\t[!important]
>\t\tThis should be code
`,
        `\
<blockquote>
<pre><code>  [!important]
  This should be code
</code></pre>
</blockquote>
`,
      ],
      // Double tabs with 1 space indentation
      [
        `\
 >\t\t[!important]
 >\t\tThis should be code
`,
        `\
<blockquote>
<pre><code> [!important]
 This should be code
</code></pre>
</blockquote>
`,
      ],
      // Triple tabs (should become code block)
      [
        `\
>\t\t\t[!note]
>\t\t\tThis should be code
`,
        `\
<blockquote>
<pre><code>  \t[!note]
  \tThis should be code
</code></pre>
</blockquote>
`,
      ],
      // Too many tabs with spaces (should become code block)
      [
        `\
>\t  [!Important]
>\t This is an important note
`,
        `\
<blockquote>
<pre><code>[!Important]
</code></pre>
<p>This is an important note</p>
</blockquote>
`,
      ],
      // Excessive tabs (should become code block)
      [
        `\
>\t\t\t\t[!important]
>\t\t\t\tToo many tabs
`,
        `\
<blockquote>
<pre><code>  \t\t[!important]
  \t\tToo many tabs
</code></pre>
</blockquote>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should terminate by other content correctly", () => {
    const original = `
# Title
> [!important]
> This is an important note

Paragraph text.
> [!important]
> This is an important note
---
> [!important]
> This is an important note
- list item
> [!important]
> This is an important note
1. list item
> [!important]
> This is an important note
`;

    expect(markdownIt.render(original)).toEqual(`\
<h1>Title</h1>
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
<p>Paragraph text.</p>
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
<hr>
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
<ul>
<li>list item</li>
</ul>
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
<ol>
<li>list item</li>
</ol>
<div class="markdown-alert markdown-alert-important">
<p class="markdown-alert-title">Important</p>
<p>This is an important note</p>
</div>
`);
  });

  it("should not render", () => {
    const testCases = [
      [
        `\
> [!note
`,
        `\
<blockquote>
<p>[!note</p>
</blockquote>
`,
      ],
      [
        `\
> [!Important]:
> This is an important note
`,
        `\
<blockquote>
<p>[!Important]:
This is an important note</p>
</blockquote>
`,
      ],
      [
        `\
> [Important]
> This is an important note
`,
        `\
<blockquote>
<p>[Important]
This is an important note</p>
</blockquote>
`,
      ],
      [
        `\
> ![Important]
> This is an important note
`,
        `\
<blockquote>
<p>![Important]
This is an important note</p>
</blockquote>
`,
      ],
      [
        `\
> ![Important]
> This is an important note
`,
        `\
<blockquote>
<p>![Important]
This is an important note</p>
</blockquote>
`,
      ],
      [
        `\
>     [!Important]
> This is an important note
`,
        `\
<blockquote>
<pre><code>[!Important]
</code></pre>
<p>This is an important note</p>
</blockquote>
`,
      ],
      [
        `\
>\t  [!Important]
>\t  This is an important note
`,
        `\
<blockquote>
<pre><code>[!Important]
This is an important note
</code></pre>
</blockquote>
`,
      ],
      [
        `\
>\t   [!Important]
>\t   This is an important note
`,
        `\
<blockquote>
<pre><code> [!Important]
 This is an important note
</code></pre>
</blockquote>
`,
      ],
      [
        `\
>\t\t\t\t[!Important]
> This is an important note
`,
        `\
<blockquote>
<pre><code>  \t\t[!Important]
</code></pre>
<p>This is an important note</p>
</blockquote>
`,
      ],
      [
        `\
>\t\t\t\t[!Important]
>\t\t\t\tThis is an important note
`,
        `\
<blockquote>
<pre><code>  \t\t[!Important]
  \t\tThis is an important note
</code></pre>
</blockquote>
`,
      ],
      [
        `\
> \\[!Important]
> This is an important note
`,
        `\
<blockquote>
<p>[!Important]
This is an important note</p>
</blockquote>
`,
      ],
      [
        `\
> [\\!Important]
> This is an important note
`,
        `\
<blockquote>
<p>[!Important]
This is an important note</p>
</blockquote>
`,
      ],
      [
        `\
> [!Important\\]
> This is an important note
`,
        `\
<blockquote>
<p>[!Important]
This is an important note</p>
</blockquote>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should not render in deep", () => {
    const testCases = [
      [
        `\
- > [!Warning]
  > This is a warning
`,
        `\
<ul>
<li>
<blockquote>
<p>[!Warning]
This is a warning</p>
</blockquote>
</li>
</ul>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should not support nesting", () => {
    const testCases = [
      [
        `\
> [!Warning]
> This is a warning
> > [!Note]
> > This is a note
`,
        `\
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title">Warning</p>
<p>This is a warning</p>
<blockquote>
<p>[!Note]
This is a note</p>
</blockquote>
</div>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should render in deep and support nesting", () => {
    const markdownItCustom = new MarkdownIt().use(alert, {
      deep: true,
    });

    const testCases = [
      [
        `\
- > [!Warning]
  > This is a warning
`,
        `\
<ul>
<li>
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title">Warning</p>
<p>This is a warning</p>
</div>
</li>
</ul>
`,
      ],
      [
        `\
> [!Warning]
> This is a warning
> > [!Note]
> > This is a note
`,
        `\
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title">Warning</p>
<p>This is a warning</p>
<div class="markdown-alert markdown-alert-note">
<p class="markdown-alert-title">Note</p>
<p>This is a note</p>
</div>
</div>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItCustom.render(input)).toEqual(output);
    });
  });

  it("should not render when alert has no content", () => {
    const testCases = [
      [
        `\
> [!Important]
`,
        // should be normal blockquote
        `\
<blockquote>
<p>[!Important]</p>
</blockquote>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should support customize options", () => {
    const markdownItCustom = new MarkdownIt().use(alert, {
      openRender: (tokens, index) => `<div class="${tokens[index].markup}-alert">\n`,
      closeRender: () => `</div>\n`,
      titleRender: (tokens, index) => {
        const token = tokens[index];
        const title = {
          important: "重要",
          note: "注",
          tip: "提示",
          warning: "注意",
          caution: "警告",
        }[token.markup];

        return `<p class="${token.markup}-alert-title">${title}</p>\n`;
      },
    });

    const testCases = [
      [
        `\
> [!Important]
> This is an important note
`,
        `\
<div class="important-alert">
<p class="important-alert-title">重要</p>
<p>This is an important note</p>
</div>
`,
      ],
      [
        `\
> [!note]
> This is a note
`,
        `\
<div class="note-alert">
<p class="note-alert-title">注</p>
<p>This is a note</p>
</div>
`,
      ],
      [
        `\
> [!tip]
> This is a tip note
`,
        `\
<div class="tip-alert">
<p class="tip-alert-title">提示</p>
<p>This is a tip note</p>
</div>
`,
      ],
      [
        `\
> [!warning]
> This is a warning note
`,
        `\
<div class="warning-alert">
<p class="warning-alert-title">注意</p>
<p>This is a warning note</p>
</div>
`,
      ],
      [
        `\
> [!caution]
> This is a caution note
`,
        `\
<div class="caution-alert">
<p class="caution-alert-title">警告</p>
<p>This is a caution note</p>
</div>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItCustom.render(input)).toEqual(output);
    });
  });

  it("should not be terminated by paragraph text", () => {
    const testCases = [
      [
        `\
> [!warning]
> This is a warning
a
`,
        `\
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title">Warning</p>
<p>This is a warning
a</p>
</div>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should handle alert termination by other markdown elements", () => {
    const testCases = [
      [
        `\
> [!warning]
> This is a warning
---
Next content
`,
        `\
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title">Warning</p>
<p>This is a warning</p>
</div>
<hr>
<p>Next content</p>
`,
      ],
      [
        `\
> [!note]
> This is a note
# Heading
`,
        `\
<div class="markdown-alert markdown-alert-note">
<p class="markdown-alert-title">Note</p>
<p>This is a note</p>
</div>
<h1>Heading</h1>
`,
      ],
      [
        `\
> [!tip]
> This is a tip
\`\`\`
code block
\`\`\`
`,
        `\
<div class="markdown-alert markdown-alert-tip">
<p class="markdown-alert-title">Tip</p>
<p>This is a tip</p>
</div>
<pre><code>code block
</code></pre>
`,
      ],
      [
        `\
> [!caution]
> This is a caution
- List item
`,
        `\
<div class="markdown-alert markdown-alert-caution">
<p class="markdown-alert-title">Caution</p>
<p>This is a caution</p>
</div>
<ul>
<li>List item</li>
</ul>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should handle alert termination", () => {
    const markdownItCustom = new MarkdownIt().use(alert, {
      deep: true,
    });

    const testCases = [
      // Alert in list item terminated by another list item
      [
        `\
- > [!warning]
  > This is a warning in list
- Another list item
`,
        `\
<ul>
<li>
<div class="markdown-alert markdown-alert-warning">
<p class="markdown-alert-title">Warning</p>
<p>This is a warning in list</p>
</div>
</li>
<li>Another list item</li>
</ul>
`,
      ],
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItCustom.render(input)).toEqual(output);
    });
  });
});
