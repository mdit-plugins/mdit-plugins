import MarkdownIt from "markdown-it";
import { expect, it } from "vitest";

import { dl } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(dl);

it("should render", () => {
  const testCases = [
    [
      `\
Term 1

: Definition 1

Term 2 with *inline markup*

: Definition 2

      { some code, part of Definition 2 }

  Third paragraph of definition 2.
`,
      `\
<dl>
<dt>Term 1</dt>
<dd>
<p>Definition 1</p>
</dd>
<dt>Term 2 with <em>inline markup</em></dt>
<dd>
<p>Definition 2</p>
<pre><code>{ some code, part of Definition 2 }
</code></pre>
<p>Third paragraph of definition 2.</p>
</dd>
</dl>
`,
    ],

    [
      `\
Term 1

:   Definition
with lazy continuation.

    Second paragraph of the definition.
`,
      `\
<dl>
<dt>Term 1</dt>
<dd>
<p>Definition
with lazy continuation.</p>
<p>Second paragraph of the definition.</p>
</dd>
</dl>
`,
    ],
    [
      `\
Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b
`,
      `\
<dl>
<dt>Term 1</dt>
<dd>Definition 1</dd>
<dt>Term 2</dt>
<dd>Definition 2a</dd>
<dd>Definition 2b</dd>
</dl>
`,
    ],

    [
      `\
Term 1
  :    paragraph

Term 2
  :     code block
`,
      `\
<dl>
<dt>Term 1</dt>
<dd>paragraph</dd>
<dt>Term 2</dt>
<dd>
<pre><code>code block
</code></pre>
</dd>
</dl>
`,
    ],
    [
      `\
Term 1
  :		code block
`,

      `\
<dl>
<dt>Term 1</dt>
<dd>
<pre><code>code block
</code></pre>
</dd>
</dl>
`,
    ],
    [
      `\
foo
: > bar
: baz
`,
      `\
<dl>
<dt>foo</dt>
<dd>
<blockquote>
<p>bar</p>
</blockquote>
</dd>
<dd>baz</dd>
</dl>
`,
    ],
    [
      `\
Term 1
: foo

  bar
Term 2
: foo
`,
      `\
<dl>
<dt>Term 1</dt>
<dd>
<p>foo</p>
<p>bar
Term 2</p>
</dd>
<dd>
<p>foo</p>
</dd>
</dl>
`,
    ],
  ];

  testCases.forEach(([content, expected]) => {
    expect(markdownIt.render(content)).toEqual(expected);
  });
});

it("should not render", () => {
  const testCases = [
    [
      `\
Non-term 1
  :

Non-term 2
  :
`,
      `\
<p>Non-term 1
:</p>
<p>Non-term 2
:</p>
`,
    ],
    [
      `\
# test
  : just a paragraph with a colon
`,
      `\
<h1>test</h1>
<p>: just a paragraph with a colon</p>
`,
    ],
  ];

  testCases.forEach(([content, expected]) => {
    expect(markdownIt.render(content)).toEqual(expected);
  });
});

it("should render tight lists", () => {
  const testCases = [
    [
      `\
Term 1
: foo
: bar

Term 2
: foo

: bar
`,
      `\
<dl>
<dt>Term 1</dt>
<dd>
<p>foo</p>
</dd>
<dd>
<p>bar</p>
</dd>
<dt>Term 2</dt>
<dd>
<p>foo</p>
</dd>
<dd>
<p>bar</p>
</dd>
</dl>
`,
    ],
  ];

  testCases.forEach(([content, expected]) => {
    expect(markdownIt.render(content)).toEqual(expected);
  });
});

it("should support nesting", () => {
  const testCases = [
    [
      `\
test
  : foo
      : bar
          : baz
      : bar
  : foo
`,
      `\
<dl>
<dt>test</dt>
<dd>
<dl>
<dt>foo</dt>
<dd>
<dl>
<dt>bar</dt>
<dd>baz</dd>
</dl>
</dd>
<dd>bar</dd>
</dl>
</dd>
<dd>foo</dd>
</dl>
`,
    ],
  ];

  testCases.forEach(([content, expected]) => {
    expect(markdownIt.render(content)).toEqual(expected);
  });
});
