import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { dl } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(dl);

describe("dl", () => {
  it("should render basic definition lists", () => {
    const testCases = [
      // Basic definition list with spacing variations
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
      // Lazy continuation and multiple paragraphs
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
      // Tilde marker and multiple definitions
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
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toEqual(expected);
    });
  });

  it("should handle indentation and markers", () => {
    const testCases = [
      // Different indentation levels and markers
      [
        `\
Term 1
  :    paragraph

Term 2
  :     code block

Term 3
  :		code block
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
<dt>Term 3</dt>
<dd>
<pre><code>code block
</code></pre>
</dd>
</dl>
`,
      ],
      // Mixed markers and spacing
      [
        `\
Term 1
:\tDefinition with tab after colon

Term 2
:  Definition with spaces after colon

Term 3
: First definition with colon
~ Second definition with tilde
: Third definition with colon
`,
        `\
<dl>
<dt>Term 1</dt>
<dd>Definition with tab after colon</dd>
<dt>Term 2</dt>
<dd>Definition with spaces after colon</dd>
<dt>Term 3</dt>
<dd>First definition with colon</dd>
<dd>Second definition with tilde</dd>
<dd>Third definition with colon</dd>
</dl>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toEqual(expected);
    });
  });

  it("should handle complex content and nesting", () => {
    const testCases = [
      // Complex content in definitions
      [
        `\
foo
: > bar
: baz

Complex Term
: Definition with list:
  
  - Item 1
  - Item 2
  
  > This is a quote
  > in the definition
  
      function test() {
        return true;
      }
`,
        `\
<dl>
<dt>foo</dt>
<dd>
<blockquote>
<p>bar</p>
</blockquote>
</dd>
<dd>
<p>baz</p>
</dd>
<dt>Complex Term</dt>
<dd>
<p>Definition with list:</p>
<ul>
<li>Item 1</li>
<li>Item 2</li>
</ul>
<blockquote>
<p>This is a quote
in the definition</p>
</blockquote>
<pre><code>function test() {
  return true;
}
</code></pre>
</dd>
</dl>
`,
      ],
      // Nested definition lists
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

  it("should handle tight and loose lists", () => {
    const testCases = [
      // Tight lists (original functionality)
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
<dd>foo</dd>
<dd>bar</dd>
<dt>Term 2</dt>
<dd>foo</dd>
<dd>bar</dd>
</dl>
`,
      ],
      // loose lists (original functionality)
      [
        `\
Term 1

: Definition paragraph 1.

Term 2

: Definition paragraph 2.
`,
        `\
<dl>
<dt>Term 1</dt>
<dd>
<p>Definition paragraph 1.</p>
</dd>
<dt>Term 2</dt>
<dd>
<p>Definition paragraph 2.</p>
</dd>
</dl>
`,
      ],
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
      // Different spacing patterns
      [
        `\
Term 1
: foo

  bar
Term 2
: foo

Simple Term
: Definition 1

Another Term

: Another definition

Mixed Term
: Definition 1a

: Definition 1b

Final Term
: Definition 2
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
<dt>Simple Term</dt>
<dd>
<p>Definition 1</p>
</dd>
<dt>Another Term</dt>
<dd>
<p>Another definition</p>
</dd>
<dt>Mixed Term</dt>
<dd>
<p>Definition 1a</p>
</dd>
<dd>
<p>Definition 1b</p>
</dd>
<dt>Final Term</dt>
<dd>
<p>Definition 2</p>
</dd>
</dl>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toEqual(expected);
    });
  });

  it("should handle edge cases and boundaries", () => {
    const testCases = [
      // Single character and long terms
      [
        `\
A
: Short term definition

This is a very long term that spans multiple words and contains various punctuation marks, numbers 123, and special characters !@#$%
: Definition for the long term
`,
        `\
<dl>
<dt>A</dt>
<dd>Short term definition</dd>
<dt>This is a very long term that spans multiple words and contains various punctuation marks, numbers 123, and special characters !@#$%</dt>
<dd>Definition for the long term</dd>
</dl>
`,
      ],
      // Formatted terms and interaction with other elements
      [
        `\
# Heading

**Bold Term** with [link](http://example.com)
: Definition for formatted term

*Italic Term*
~ Definition with tilde marker

Term before heading
: Definition before heading

# Another Heading
`,
        `\
<h1>Heading</h1>
<dl>
<dt><strong>Bold Term</strong> with <a href="http://example.com">link</a></dt>
<dd>Definition for formatted term</dd>
<dt><em>Italic Term</em></dt>
<dd>Definition with tilde marker</dd>
<dt>Term before heading</dt>
<dd>Definition before heading</dd>
</dl>
<h1>Another Heading</h1>
`,
      ],
      // Multiple definitions with separation
      [
        `\
First Term
: First def for first term
: Second def for first term

Second Term
: First def for second term
: Second def for second term
`,
        `\
<dl>
<dt>First Term</dt>
<dd>First def for first term</dd>
<dd>Second def for first term</dd>
<dt>Second Term</dt>
<dd>First def for second term</dd>
<dd>Second def for second term</dd>
</dl>
`,
      ],
      // A lazy continuation may start with a `:`, if it has enough indent.
      [
        `\
apple
   : > computer company
     : red fruit

orange
   : > telecom company
   : orange fruit

chili's
   : > restaurant company
 : spicy fruit
`,
        `\
<dl>
<dt>apple</dt>
<dd>
<blockquote>
<p>computer company
: red fruit</p>
</blockquote>
</dd>
<dt>orange</dt>
<dd>
<blockquote>
<p>telecom company</p>
</blockquote>
</dd>
<dd>orange fruit</dd>
<dt>chili's</dt>
<dd>
<blockquote>
<p>restaurant company</p>
</blockquote>
</dd>
<dd>spicy fruit</dd>
</dl>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toEqual(expected);
    });
  });

  it("should not render invalid definition lists", () => {
    const testCases = [
      // Empty or invalid definitions
      [
        `\
Non-term 1
  :

Non-term 2
  :

Term
:Definition

Term
:   

Term
; Definition

Term
:

Another paragraph after empty definition
`,
        `\
<p>Non-term 1
:</p>
<p>Non-term 2
:</p>
<p>Term
:Definition</p>
<p>Term
:</p>
<p>Term
; Definition</p>
<p>Term
:</p>
<p>Another paragraph after empty definition</p>
`,
      ],
      // Headers should not be treated as terms
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
      // Multiple empty lines break definition list parsing
      [
        `\
Term 1


: Definition with multiple empty lines above

Term 1
: Definition 1

Term 2
`,
        `\
<p>Term 1</p>
<p>: Definition with multiple empty lines above</p>
<dl>
<dt>Term 1</dt>
<dd>Definition 1</dd>
</dl>
<p>Term 2</p>
`,
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(markdownIt.render(content)).toEqual(expected);
    });
  });
});
