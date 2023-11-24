import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { alert } from "../src/index.js";

const markdownIt = new MarkdownIt().use(alert);

it("should not break blockquote", () => {
  const markdownItDefault = new MarkdownIt();

  const testCases = [
    [
      "> test",
      `\
<blockquote>
<p>test</p>
</blockquote>
`,
    ],
    [
      "> test\n> test",
      `\
<blockquote>
<p>test
test</p>
</blockquote>
`,
    ],
    [
      "> test\n\n> test",
      `\
<blockquote>
<p>test</p>
</blockquote>
<blockquote>
<p>test</p>
</blockquote>
`,
    ],
    [
      "> test\n\n> test\n> test",
      `\
<blockquote>
<p>test</p>
</blockquote>
<blockquote>
<p>test
test</p>
</blockquote>
`,
    ],
    [
      ">		foo",
      `\
<blockquote>
<pre><code>  foo
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

describe("hint", () => {
  it("should render tip, warning, caution, important note", () => {
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

  it("should ignore case", () => {
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

  it("should support multiple content", () => {
    const testCases = [
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
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should handle spaces", () => {
    const testCases = [
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
      [
        `\
>    [!Important]
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
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownIt.render(input)).toEqual(output);
    });
  });

  it("should not render", () => {
    const testCases = [
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

  it("should support customize options", () => {
    const markdownItCustom = new MarkdownIt().use(alert, {
      openRender: (tokens, index) =>
        `<div class="${tokens[index].markup}-alert">\n`,
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
});
