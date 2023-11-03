import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tex } from "../src/index.js";

const render = (content: string, displayMode: boolean): string =>
  displayMode
    ? `<p>{Tex content: ${content}}</p>`
    : `{Tex content: ${content}}`;

const markdownIt = MarkdownIt({ linkify: true }).use(tex, {
  mathFence: true,
  render,
});

it("render option should be required", () => {
  expect(() => MarkdownIt({ linkify: true }).use(tex)).toThrowError();
});

describe("inline katex", () => {
  it("Should render", () => {
    expect(markdownIt.render(`$a=1$`)).toEqual("<p>{Tex content: a=1}</p>\n");
    expect(markdownIt.render(`A tex equation $a=1$ inline.`)).toEqual(
      "<p>A tex equation {Tex content: a=1} inline.</p>\n",
    );
  });

  it("Should not render when no close marker", () => {
    expect(markdownIt.render("$a = 1")).toEqual("<p>$a = 1</p>\n");
  });

  it("Should not render when escape", () => {
    expect(markdownIt.render("$a = 1\\$")).toEqual("<p>$a = 1$</p>\n");
    expect(markdownIt.render("\\$a = 1$")).toEqual("<p>$a = 1$</p>\n");
  });

  it("Should not render when having spaces", () => {
    expect(markdownIt.render(`$ a = 1 $`)).toEqual("<p>$ a = 1 $</p>\n");
    expect(markdownIt.render(`$a = 1 $`)).toEqual("<p>$a = 1 $</p>\n");
    expect(markdownIt.render(`$ a = 1$`)).toEqual("<p>$ a = 1$</p>\n");
  });

  it("Should not render when the ending tag is followed by number", () => {
    expect(markdownIt.render(`Of course $1 = $1`)).toEqual(
      "<p>Of course $1 = $1</p>\n",
    );
    expect(markdownIt.render(`Of course $a = $a`)).toEqual(
      "<p>Of course $a = $a</p>\n",
    );
  });
});

describe("block katex", () => {
  it("Should render", () => {
    expect(markdownIt.render(`$$a=1$$`)).toEqual(
      "<p>{Tex content: \na=1\n}</p>",
    );

    expect(
      markdownIt.render(`
$$
a = 1 \\\\
b = 2
$$
`),
    ).toEqual("<p>{Tex content: \na = 1 \\\\\nb = 2\n}</p>");
  });

  it("Should not render when escape", () => {
    expect(markdownIt.render("\\$\\$a = 1$$")).toEqual("<p>$$a = 1$$</p>\n");
    expect(
      markdownIt.render(`
\\$\\$
a = 1
\\$\\$
`),
    ).toEqual(`<p>$$
a = 1
$$</p>\n`);
  });

  it("Should render when having spaces", () => {
    expect(markdownIt.render(`$$ a = 1 $$`)).toMatchSnapshot();

    expect(markdownIt.render(`All $$ a = 1 $$ is true.`)).toEqual(
      "<p>All $$ a = 1 $$ is true.</p>\n",
    );
  });
});

describe("math fence", () => {
  it("Should render", () => {
    expect(
      markdownIt.render(`\
\`\`\`math
a=1
\`\`\`\
`),
    ).toEqual("<p>{Tex content: a=1\n}</p>");

    expect(
      markdownIt.render(`
\`\`\`math
a = 1 \\\\
b = 2
\`\`\`\
`),
    ).toEqual("<p>{Tex content: a = 1 \\\\\nb = 2\n}</p>");

    expect(
      markdownIt.render(`
\`\`\`js
const a = 1;
\`\`\`\
`),
    ).toEqual(`\
<pre><code class="language-js">const a = 1;
</code></pre>
`);
  });
});
