import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { footnote } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(footnote);
const markdownItXHTML = MarkdownIt({ linkify: true, xhtmlOut: true }).use(footnote);

describe(footnote, () => {
  it("should render", () => {
    expect(
      markdownIt.render(
        `
Here is a footnote reference,[^1] and another.[^long-note]

[^1]: Here is the footnote.

[^long-note]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.

        { some.code }

    The whole paragraph can be indented, or just the first
    line.  In this way, multi-paragraph footnotes work like
    multi-paragraph list items.

This paragraph won’t be part of the note, because it
isn’t indented.
`,
        {},
      ),
    ).toMatchSnapshot();
  });

  it("should support xhtml output", () => {
    expect(
      markdownItXHTML.render(
        `
Here is a footnote reference,[^1] and another.[^long-note]

[^1]: Here is the footnote.

[^long-note]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.

        { some.code }

    The whole paragraph can be indented, or just the first
    line.  In this way, multi-paragraph footnotes work like
    multi-paragraph list items.

This paragraph won’t be part of the note, because it
isn’t indented.
`,
        {},
      ),
    ).toMatchSnapshot();
  });

  it("should not render empty labels", () => {
    expect(
      markdownIt.render(`
Here is a empty footnote reference[^].

[^]: Here is the footnote.
`),
    ).toBe(`\
<p>Here is a empty footnote reference[^].</p>
<p>[^]: Here is the footnote.</p>
`);
  });

  it("should not render labels without reference", () => {
    expect(
      markdownIt.render(`
Here is a footnote reference[^abc].

[^ab]: Here is the footnote.
`),
    ).toBe(`\
<p>Here is a footnote reference[^abc].</p>
`);
  });

  it("should terminate each other", () => {
    expect(
      markdownIt.render(`
[^1][^2][^3]

[^1]: foo
[^2]: bar
[^3]: baz
`),
    ).toMatchSnapshot();
  });

  it("Can inside blockquotes, and are lazy", () => {
    expect(
      markdownIt.render(`
[^foo]

> [^foo]: bar
baz
`),
    ).toMatchSnapshot();
  });

  it("Label cannot contain spaces or newlines", () => {
    expect(
      markdownIt.render(`
[^ foo]: bar baz

[^foo
]: bar baz
`),
    ).toMatchSnapshot();
  });

  it("Nested footnotes", () => {
    expect(
      markdownIt.render(`
foo[^1] bar[^2].

[^1]:[^2]: baz
`),
    ).toMatchSnapshot();
  });

  it("should support inline note", () => {
    expect(
      markdownIt.render(`
Here is an inline note.^[Inline notes are easier to write, since
you don’t have to pick an identifier and move down to type the
note.]
`),
    ).toMatchSnapshot();
  });

  it("Can have arbitrary markup", () => {
    expect(markdownIt.render(`foo^[ *bar* ]`)).toMatchSnapshot();
  });

  it("Duplicate footnotes should have suffix", () => {
    expect(
      markdownIt.render(`
[^xxxxx] [^xxxxx]

[^xxxxx]: foo
`),
    ).toMatchSnapshot();
  });

  it("Indent", () => {
    expect(
      markdownIt.render(`
[^xxxxx] [^yyyyy]

[^xxxxx]: foo
    ---

[^yyyyy]: foo
    ---
`),
    ).toMatchSnapshot();
  });

  it("Indents for the first line", () => {
    expect(
      markdownIt.render(`
[^xxxxx] [^yyyyy]

[^xxxxx]:       foo

[^yyyyy]:        foo
`),
    ).toMatchSnapshot();

    expect(
      markdownIt.render(`
[^xxxxx]

[^xxxxx]:		foo
`),
    ).toMatchSnapshot();
  });

  it("should contain Security", () => {
    expect(
      markdownIt.render(`
[^__proto__]

[^__proto__]: blah
`),
    ).toMatchSnapshot();

    expect(
      markdownIt.render(`
[^hasOwnProperty]

[^hasOwnProperty]: blah
`),
    ).toMatchSnapshot();
  });

  it("should allow links in inline footnotes", () => {
    expect(
      markdownIt.render(`Example^[this is another example https://github.com]`),
    ).toMatchSnapshot();
  });

  it("custom docId in env", () => {
    expect(
      markdownIt.render(
        `
Here is a footnote reference,[^1] and another.[^long-note]

[^1]: Here is the footnote.

[^long-note]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.

        { some.code }

    The whole paragraph can be indented, or just the first
    line.  In this way, multi-paragraph footnotes work like
    multi-paragraph list items.

This paragraph won’t be part of the note, because it
isn’t indented.
`,
        { docId: "test-doc-id" },
      ),
    ).toMatchSnapshot();
  });

  it("should handle footnoteDef without reference", () => {
    const source = `\
[^1]: foo
`;

    expect(markdownIt.render(source)).toBe("");
  });

  it("should not render invalid syntax", () => {
    const testCases = [
      [`[^]`, "<p>[^]</p>\n"],
      [`[^ ]`, "<p>[^ ]</p>\n"],
      [`[^\n]`, "<p>[^\n]</p>\n"],
      [`[^abc`, "<p>[^abc</p>\n"],
      ["^", "<p>^</p>\n"],
      [`^[`, "<p>^[</p>\n"],
      [`^[foo`, "<p>^[foo</p>\n"],
    ];
    const definition = `
[^1]: foo

[^1]

`;

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toBe(expected);
      expect(markdownIt.render(definition + input)).toContain(expected);
    });
  });

  it("should not render reference when no footnote definition exists", () => {
    expect(markdownIt.render("foo[^1]")).toBe("<p>foo[^1]</p>\n");
  });

  it("should handle footnote without trailing paragraph", () => {
    expect(
      markdownIt.render(`
[^1]

[^1]:
    - item
`),
    ).toMatchSnapshot();
  });

  it("should support footnoteDef silent", () => {
    expect(markdownIt.render(`paragraph\n[^1]: foo`)).toMatchSnapshot();
  });
});
