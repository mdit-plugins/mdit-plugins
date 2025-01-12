import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tex } from "../src/index.js";

const render = (content: string, displayMode: boolean): string =>
  displayMode
    ? `<p>{Tex content: ${content.trim()}}</p>`
    : `{Tex content: ${content.trim()}}`;

const markdownIt = MarkdownIt({ linkify: true }).use(tex, {
  mathFence: true,
  render,
});
const markdownItAllowSpace = MarkdownIt({ linkify: true }).use(tex, {
  allowInlineWithSpace: true,
  mathFence: true,
  render,
});

it("render option should be required", () => {
  expect(() => MarkdownIt({ linkify: true }).use(tex)).toThrowError();
});

describe("inline katex default", () => {
  it("should render", () => {
    expect(markdownIt.render(`$a=1$`)).toEqual("<p>{Tex content: a=1}</p>\n");
    expect(markdownIt.render(`A tex equation $a=1$ inline.`)).toEqual(
      "<p>A tex equation {Tex content: a=1} inline.</p>\n",
    );
    expect(
      markdownIt.render(
        `A tex equation $a=1$ $b=2$ inline with $1 hot dogs and $c=3$.`,
      ),
    ).toEqual(
      "<p>A tex equation {Tex content: a=1} {Tex content: b=2} inline with $1 hot dogs and {Tex content: c=3}.</p>\n",
    );
  });

  it("should not render when no close marker", () => {
    expect(markdownIt.render("$a = 1")).toEqual("<p>$a = 1</p>\n");
  });

  it("should not render when escape", () => {
    expect(markdownIt.render("$a = 1\\$")).toEqual("<p>$a = 1$</p>\n");
    expect(markdownIt.render("\\$a = 1$")).toEqual("<p>$a = 1$</p>\n");
  });

  it("should not render when having spaces", () => {
    expect(markdownIt.render(`$ a = 1 $`)).toEqual("<p>$ a = 1 $</p>\n");
    expect(markdownIt.render(`$a = 1 $`)).toEqual("<p>$a = 1 $</p>\n");
    expect(markdownIt.render(`$ a = 1$`)).toEqual("<p>$ a = 1$</p>\n");
  });

  it("should not render when the ending tag is followed by number", () => {
    expect(markdownIt.render(`Of course $1 = $1`)).toEqual(
      "<p>Of course $1 = $1</p>\n",
    );
    expect(markdownIt.render(`Of course $1=$1`)).toEqual(
      "<p>Of course $1=$1</p>\n",
    );
  });
});

describe("inline katex with space", () => {
  it("should render", () => {
    expect(markdownItAllowSpace.render(`$a=1$`)).toEqual(
      "<p>{Tex content: a=1}</p>\n",
    );
    expect(markdownItAllowSpace.render(`$ a = 1 $`)).toEqual(
      "<p>{Tex content: a = 1}</p>\n",
    );
    expect(markdownItAllowSpace.render(`$a = 1 $`)).toEqual(
      "<p>{Tex content: a = 1}</p>\n",
    );
    expect(markdownItAllowSpace.render(`$ a = 1$`)).toEqual(
      "<p>{Tex content: a = 1}</p>\n",
    );
    expect(markdownItAllowSpace.render(`A tex equation $a=1$ inline.`)).toEqual(
      "<p>A tex equation {Tex content: a=1} inline.</p>\n",
    );
    expect(
      markdownItAllowSpace.render(`A tex equation $ a=1 $ inline.`),
    ).toEqual("<p>A tex equation {Tex content: a=1} inline.</p>\n");
    // WARNING: With allowInlineWithSpace, you have to escape `$` to avoid problems
    expect(
      markdownItAllowSpace.render(
        `A tex equation $a=1$ $b=2$ inline with \\$1 hot dogs and $c=3$.`,
      ),
    ).toEqual(
      "<p>A tex equation {Tex content: a=1} {Tex content: b=2} inline with $1 hot dogs and {Tex content: c=3}.</p>\n",
    );
    // WARNING: With allowInlineWithSpace, you have to escape `$` to avoid problems
    expect(
      markdownItAllowSpace.render(
        `A tex equation $ a=1 $ $ b=2 $ inline with \\$1 hot dogs and $ c=3 $.`,
      ),
    ).toEqual(
      "<p>A tex equation {Tex content: a=1} {Tex content: b=2} inline with $1 hot dogs and {Tex content: c=3}.</p>\n",
    );
  });

  it("should not render when no close marker", () => {
    expect(markdownItAllowSpace.render("$a = 1")).toEqual("<p>$a = 1</p>\n");
  });

  it("should not render when escape", () => {
    expect(markdownItAllowSpace.render(`Of course $1 = $1`)).toEqual(
      "<p>Of course $1 = $1</p>\n",
    );
    expect(markdownItAllowSpace.render(`Of course $1=$1`)).toEqual(
      "<p>Of course $1=$1</p>\n",
    );
  });

  it("should not render when the ending tag is followed by number", () => {
    expect(markdownItAllowSpace.render(`Of course $1 = $1`)).toEqual(
      "<p>Of course $1 = $1</p>\n",
    );
  });
});

describe("block katex", () => {
  it("should render", () => {
    expect(markdownIt.render(`$$a=1$$`)).toEqual("<p>{Tex content: a=1}</p>");

    expect(
      markdownIt.render(`
$$
a = 1 \\\\
b = 2
$$
`),
    ).toEqual("<p>{Tex content: a = 1 \\\\\nb = 2}</p>");
  });

  it("should startcorrectly", () => {
    expect(
      markdownIt.render(`
test.
$$a = 1$$
`),
    ).toEqual(`\
<p>test.</p>
<p>{Tex content: a = 1}</p>\
`);
    expect(
      markdownIt.render(`
test.
$$
a = 1
$$
`),
    ).toEqual(`\
<p>test.</p>
<p>{Tex content: a = 1}</p>\
`);
  });

  it("should stop correctly", () => {
    expect(
      markdownIt.render(`
$$a = 1
`),
    ).toEqual(`\
<p>{Tex content: a = 1}</p>\
`);

    expect(
      markdownIt.render(`
- test

  $$a = 1

test.
`),
    ).toEqual(`\
<ul>
<li>
<p>test</p>
<p>{Tex content: a = 1}</p></li>
</ul>
<p>test.</p>
`);
  });

  it("should not render when escape", () => {
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

  it("should render when having spaces", () => {
    expect(markdownIt.render(`$$ a = 1 $$`)).toMatchSnapshot();

    expect(markdownIt.render(`All $$ a = 1 $$ is true.`)).toEqual(
      "<p>All $$ a = 1 $$ is true.</p>\n",
    );
  });
});

describe("math fence", () => {
  it("should render", () => {
    expect(
      markdownIt.render(`\
\`\`\`math
a=1
\`\`\`\
`),
    ).toEqual("<p>{Tex content: a=1}</p>");

    expect(
      markdownIt.render(`
\`\`\`math
a = 1 \\\\
b = 2
\`\`\`\
`),
    ).toEqual("<p>{Tex content: a = 1 \\\\\nb = 2}</p>");

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
