import { describe, bench } from "vitest";
import MarkdownIt from "markdown-it";
// @ts-ignore
import { attrs as attrsOriginal } from "../src-old/index.js";
import { attrs as attrsOptimized } from "../src/index.js";

/**
 * Create test content of different sizes
 */
const createTestContent = (size: "small" | "medium" | "large"): string => {
  // Test cases for all attrs formats
  // 1. block - block element attributes
  const paragraph =
    'This is a normal paragraph. {#p1 .text .paragraph align=center data-value="test value"}\n\n';

  // Content with escape characters
  const blockWithEscape =
    "This is a paragraph with escaped attributes \\{#escaped}, real attributes here {#p2}.\n\n";

  // 2. heading - heading attributes
  const heading = "## Heading {#heading .big data-level=2}\n\n";
  const headingMulti = "### Multi-attribute heading {#multi .small .important color=blue}\n\n";

  // 3. inline - inline element attributes
  const inline =
    'Contains `inline code`{.code data-lang=js} and *emphasis*{.italic style="color:red"} and ' +
    '**bold text**{.bold aria-label="important"}. This is a ' +
    "[link](https://example.com){.link target=_blank} and an " +
    "![image description](/path/to/img.jpg){.image width=100 height=100}\n\n";

  // 4. list - list attributes
  const list =
    "- List item 1 {.item-1 data-order=first}\n- List item 2 {.item-2}\n  - Nested list item {.nested}\n  - Another nested item\n- List item 3\n\n" +
    "1. Ordered list item {.ordered}\n2. Second item {.second}\n\n" +
    '- List item with wrapper attributes\n\n{.list-wrapper data-type="unordered"}\n\n';

  // 5. table - table attributes
  const table =
    "| Header A {.head} | Header B {.head} |\n|---|---|\n| Data 1 {.cell} | Data 2 {.cell} |\n\n" +
    '| A | B |\n|---|---|\n| 1 | 2 |\n\n{.table border=1 width="100%"}\n\n';

  // 6. fence - code block attributes
  const code =
    '```js {.code-block data-lang="javascript" line-numbers}\nconst a = 1;\nconsole.log(a);\n```\n\n' +
    '```python {.py-code theme=dark indent=4}\ndef hello():\n    print("Hello, world!")\n\nhello()\n```\n\n';

  // 7. hr - horizontal rule attributes
  const hr = '--- {.horizontal width="80%" color="gray"}\n\n' + "*** {.custom-hr theme=dark}\n\n";

  // 8. softbreak - soft break attributes
  const softbreak =
    "This is the first line  \n{.break}\nThis is the second line\n\n" +
    "Line one  \n{.br1}\nLine two  \n{.br2}\nLine three\n\n";

  // Basic unit containing all test types
  const basicUnit =
    paragraph +
    blockWithEscape +
    heading +
    headingMulti +
    inline +
    list +
    table +
    code +
    hr +
    softbreak;

  switch (size) {
    case "small": // approx. 2000-3000 characters
      return basicUnit.repeat(2);
    case "medium": // approx. 6000-9000 characters
      return basicUnit.repeat(6);
    case "large": // approx. 15000-20000 characters
      return basicUnit.repeat(12);
    default:
      return basicUnit;
  }
};

// Create test content
const smallContent = createTestContent("small");
const mediumContent = createTestContent("medium");
const largeContent = createTestContent("large");

// Create markdown-it instances for original and optimized versions
const createOriginalRenderer = () => new MarkdownIt().use(attrsOriginal);
const createOptimizedRenderer = () => new MarkdownIt().use(attrsOptimized);

describe("Original vs Optimized Performance Comparison", () => {
  describe("Small document (approx. 2000-3000 characters)", () => {
    bench("Original version", () => {
      const mdIt = createOriginalRenderer();
      mdIt.render(smallContent);
    });

    bench("Optimized version", () => {
      const mdIt = createOptimizedRenderer();
      mdIt.render(smallContent);
    });
  });

  describe("Medium document (approx. 6000-9000 characters)", () => {
    bench("Original version", () => {
      const mdIt = createOriginalRenderer();
      mdIt.render(mediumContent);
    });

    bench("Optimized version", () => {
      const mdIt = createOptimizedRenderer();
      mdIt.render(mediumContent);
    });
  });

  describe("Large document (approx. 15000-20000 characters)", () => {
    bench("Original version", () => {
      const mdIt = createOriginalRenderer();
      mdIt.render(largeContent);
    });

    bench("Optimized version", () => {
      const mdIt = createOptimizedRenderer();
      mdIt.render(largeContent);
    });
  });

  describe("Real document test (attrs documentation)", () => {
    // Using actual documentation content as test case
    const realDocContent = `---
title: "@mdit/plugin-attrs"
icon: code
---

Plugins to add attrs to Markdown content.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

\`\`\`ts
import MarkdownIt from "markdown-it";
import { attrs } from "@mdit/plugin-attrs";

const mdIt = MarkdownIt().use(attrs, {
  // your options, optional
});

mdIt.render("# Heading 🎉{#heading}");
\`\`\`

@tab JS

\`\`\`js
import MarkdownIt from "markdown-it";
import { attrs } from "@mdit/plugin-attrs";

const mdIt = MarkdownIt().use(attrs, {
  // your options, optional
});

mdIt.render("# Heading 🎉{#heading}");
\`\`\`

:::

## Syntax

You can use \`{attrs}\` to add attrs to Markdown content.

For example, if you want a heading2 "Hello World" with a id "say-hello-world", you can write:

\`\`\`md
## Hello World {#say-hello-world}
\`\`\`

If you want a image with class "full-width", you can write:

\`\`\`md
![img](link/to/image.png) {.full-width}
\`\`\`

Also, other attrs are supported, so:

\`\`\`md
A paragraph with some text. {#p .a .b align=center customize-attr="content with spaces"}
\`\`\`

will be rendered into:

\`\`\`html
<p id="p" class="a b" align="center" customize-attr="content with spaces">
  A paragraph with some text.
</p>
\`\`\`

::: tip Escaping

Escaping can be done by adding \`\\\` to escape the delimiter:

\`\`\`md
### Heading \\{#heading}
\`\`\`

will be

### Heading \\{#heading}

:::

## Advanced

You can pass options to \`@mdit-plugin-attrs\` to customize plugin behavior.

\`\`\`ts
type MarkdownItAttrRuleName =
  | "fence"
  | "inline"
  | "table"
  | "list"
  | "hr"
  | "softbreak"
  | "block";

interface MarkdownItAttrsOptions {
  /**
   * left delimiter
   *
   * @default '{'
   */
  left?: string;

  /**
   * right delimiter
   *
   * @default '}'
   */
  right?: string;

  /**
   * allowed attributes
   *
   * @description An empty list means allowing all attribute
   *
   * @default []
   */
  allowed?: (string | RegExp)[];

  /**
   * Rules to enable
   *
   * @default "all"
   */
  rule?: "all" | boolean | MarkdownItAttrRuleName[];
}
\`\`\`

## Demo

> ALl class are styled with \`margin: 4px;padding: 4px;border: 1px solid red;\` to show the effect.

::: preview Inline

Text with \`inline code\`{.inline-code} and ![favicon](/favicon.ico){.image}, also supporting _emphasis_{.inline-emphasis} and **bold**{.inline-bold}.

:::

::: preview Block

block content {.block}

:::

::: preview Fence

\`\`\`js {.fence}
const a = 1;
\`\`\`

:::

::: preview Table

| A                        | B   | C   | D              |
| ------------------------ | --- | --- | -------------- |
| A1                       | B1  | C1  | D1 {rowspan=3} |
| A2 {colspan=2 rowspan=2} | B2  | C2  | D2             |
| A3                       | B3  | C3  | D3             |

{.table border=1}

:::

::: preview List

- list item{.list-item}

  - nested list item
    {.nested}

{.list-wrapper}

:::

::: preview Horizontal Rule

--- {.horizontal}

:::

::: preview Softbreak

A line with break  
{.break}

:::

<style scope>
.block,
.break,
.horizontal,
.image,
.inline-code,
.list-wrapper,
.list-item,
.nested,
.inline-emphasis,
.inline-bold,
.table,
.fence {
  margin: 4px;
  padding: 4px;
  border: 1px solid red;
}
</style>`;

    bench("Original version - Real document", () => {
      const mdIt = createOriginalRenderer();
      mdIt.render(realDocContent);
    });

    bench("Optimized version - Real document", () => {
      const mdIt = createOptimizedRenderer();
      mdIt.render(realDocContent);
    });
  });
});
