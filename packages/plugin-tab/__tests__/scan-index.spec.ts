import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tab } from "../src/index.js";

const markdownIt = new MarkdownIt().use(tab);

const getWrapperOrder = (result: string): string[] => {
  const wrappers: string[] = [];
  const pattern = /<div class="tabs-tabs-wrapper"(?: data-id="(?<id>[^"]*)")?>/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(result)) != null) wrappers.push(match.groups?.id ?? "");

  return wrappers;
};

describe("tab scan index", () => {
  it("should render indented nested tabs and a following sibling group", () => {
    const result = markdownIt.render(`\
:::: tabs
@tab test1

A text 1.

@tab test2
  ::: tabs
  @tab sub-test1
  A **bold** text 1.
  @tab:active sub-test2
  A **bold** text 2.
  :::
@tab:active test3
A **bold** text 3.
::::

::: tabs#second
@tab one
one
@tab:active two
two
:::
`);

    expect(getWrapperOrder(result)).toStrictEqual(["", "", "second"]);

    const buttons = result.match(/class="tabs-tab-button(?: active)?"/g);

    expect(buttons).toHaveLength(7);
    expect(result.indexOf(">test1</button>")).toBeGreaterThan(-1);
    expect(result.indexOf(">sub-test1</button>")).toBeGreaterThan(
      result.indexOf(">test2</button>"),
    );
    expect(result.indexOf('data-id="second"')).toBeGreaterThan(result.indexOf(">test3</button>"));
    expect(result).toContain(
      '<button type="button" class="tabs-tab-button" data-tab="0">one</button>',
    );
    expect(result).toContain(
      '<button type="button" class="tabs-tab-button active" data-tab="1" data-active>two</button>',
    );
  });

  it("should keep parsing after a list fence ends early", () => {
    expect(
      markdownIt.render(`\
::: tabs
- item
  \`\`\`
out
@tab A
x
:::
`),
    ).toBe(`\
<div class="tabs-tabs-wrapper">
  <div class="tabs-tabs-header">
    <button type="button" class="tabs-tab-button" data-tab="0">A</button>
  </div>
  <div class="tabs-tabs-container">
<div class="tabs-tab-content" data-index="0">
<p>x
:::</p>
</div>
  </div>
</div>
`);
  });

  it("should rebuild the item scan after an early list fence", () => {
    expect(
      markdownIt.render(`\
::: tabs
- item
  \`\`\`
out
@tab A
x
@tab B
y
:::
`),
    ).toBe(`\
<div class="tabs-tabs-wrapper">
  <div class="tabs-tabs-header">
    <button type="button" class="tabs-tab-button" data-tab="0">A</button>
    <button type="button" class="tabs-tab-button" data-tab="1">B</button>
  </div>
  <div class="tabs-tabs-container">
<div class="tabs-tab-content" data-index="0">
<p>x</p>
</div>
<div class="tabs-tab-content" data-index="1">
<p>y
:::</p>
</div>
  </div>
</div>
`);
  });

  it("should support same-indent nested containers", () => {
    expect(
      markdownIt.render(`\
:::: tabs
::: tabs
@tab a
:::
@tab b
::::
`),
    ).toBe(`\
<div class="tabs-tabs-wrapper">
  <div class="tabs-tabs-header">
    <button type="button" class="tabs-tab-button" data-tab="0">b</button>
  </div>
  <div class="tabs-tabs-container">
<div class="tabs-tabs-wrapper">
  <div class="tabs-tabs-header">
    
  </div>
  <div class="tabs-tabs-container">
  </div>
</div>
<div class="tabs-tab-content" data-index="0">
</div>
  </div>
</div>
`);
  });

  it("should render plain and inline tab titles without changing the output", () => {
    const result = markdownIt.render(`\
::: tabs
@tab Plain title 1
x
@tab **bold** & <x>
y
@tab Version 1.2
z
:::
`);

    expect(result).toContain(
      '<button type="button" class="tabs-tab-button" data-tab="0">Plain title 1</button>',
    );
    expect(result).toContain(
      '<button type="button" class="tabs-tab-button" data-tab="1"><strong>bold</strong> &amp; &lt;x&gt;</button>',
    );
    expect(result).toContain(
      '<button type="button" class="tabs-tab-button" data-tab="2">Version 1.2</button>',
    );
  });

  it("should keep typographer titles going through the inline parser", () => {
    const mdTypographer = new MarkdownIt({ typographer: true });

    mdTypographer.use(tab);

    expect(mdTypographer.render(`::: tabs\n@tab it's\nx\n:::\n`)).toContain("it’s</button>");
  });
});
