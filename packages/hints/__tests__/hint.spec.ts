import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { hint } from "../src/index.js";

const markdownItDefault = new MarkdownIt();
const markdownIt = new MarkdownIt().use(hint);
const markdownItCustom = new MarkdownIt().use(hint, {
  hintOpenRender: (tokens, index) =>
    `<div class="hint ${tokens[index].markup}-hint">\n`,
  hintTitleRender: (tokens, index) => {
    const token = tokens[index];
    const title = {
      important: "重要",
      note: "注",
      tip: "提示",
      warning: "注意",
      caution: "警告",
    }[token.content];

    return `<p class="hint ${token.markup}-hint-title">${title}</p>\n`;
  },
});

it("blockquote should work", () => {
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="note-hint">
<p class="note-hint-title">note</p>
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
<div class="tip-hint">
<p class="tip-hint-title">tip</p>
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
<div class="warning-hint">
<p class="warning-hint-title">warning</p>
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
<div class="caution-hint">
<p class="caution-hint-title">caution</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
<div class="important-hint">
<p class="important-hint-title">important</p>
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
    ];

    testCases.forEach(([input, output]) => {
      expect(markdownItCustom.render(input)).toEqual(output);
    });
  });

  it("should support customize options", () => {
    const testCases = [
      [
        `\
> [!Important]
> This is an important note
`,
        `\
<div class="hint important-hint">
<p class="hint important-hint-title">重要</p>
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
<div class="hint note-hint">
<p class="hint note-hint-title">注</p>
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
<div class="hint tip-hint">
<p class="hint tip-hint-title">提示</p>
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
<div class="hint warning-hint">
<p class="hint warning-hint-title">注意</p>
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
<div class="hint caution-hint">
<p class="hint caution-hint-title">警告</p>
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
