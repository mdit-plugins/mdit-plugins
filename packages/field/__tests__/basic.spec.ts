import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

const md = MarkdownIt({ html: true }).use(field);

describe("basic rendering", () => {
  it("should render single field", () => {
    const result = md.render(`
::: fields
@prop1@
Description 1
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain('<dt class="field-name" data-level="1">prop1</dt>');
    expect(result).toContain("<p>Description 1</p>");
  });

  it("should render multiple fields", () => {
    const result = md.render(`
::: fields
@prop1@
Description 1

@prop2@
Description 2
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain("prop1</dt>");
    expect(result).toContain("prop2</dt>");
    expect(result).toContain("<p>Description 1</p>");
    expect(result).toContain("<p>Description 2</p>");
  });

  it("should render attributes", () => {
    const result = md.render(`
::: fields
@prop1@ type="string" required
Description 1
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain('<span class="field-attr field-attr-type">Type: string</span>');
    expect(result).toContain('<span class="field-attr field-attr-required">Required</span>');
  });

  it("should handle escaped quotes in attributes", () => {
    const result = md.render(`
::: fields
@prop1@ default="foo\\"bar"
:::
`);

    expect(result).toContain("Default: foo&quot;bar");
  });

  it("should handle attribute with trailing backslash (edge case)", () => {
    const result = md.render(`
::: fields
@test@ attr="val\\
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain("Attr: val\\");
  });

  it("should handle unquoted attributes", () => {
    const result = md.render(`
::: fields
@prop1@ type=number
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain("Type: number");
  });

  it("should handle mixed attributes", () => {
    const result = md.render(`
::: fields
@prop1@ type="string" required default='value'
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain("Type: string");
    expect(result).toContain("Required");
    expect(result).toContain("Default: value");
  });

  it("should handle escaped name markers", () => {
    const result = md.render(`
::: fields
@\\@name\\@@
Description
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain(">@name@</dt>");
  });

  it("should ignore lines starting with escaped @", () => {
    const result = md.render(`
::: fields
@prop@
Description includes:
\\@not-a-field
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain("@not-a-field");
    expect(result).not.toContain(">not-a-field</dt>");
  });

  it("should support #id syntax in fence", () => {
    const result = md.render(`
::: fields #my-id
@prop@
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain('id="my-id"');
  });

  it("should support concatenated #id syntax", () => {
    const result = md.render(`
::: fields#my-id-2
@prop@
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain('id="my-id-2"');
  });

  it("should support #id with extra params", () => {
    const result = md.render(`
::: fields #my-id-space extra
@prop@
:::
`);

    expect(result).toContain('id="my-id-space"');
  });

  it("should support concatenated #id with extra params", () => {
    const result = md.render(`
::: fields#my-id-concat extra
@prop@
:::
`);

    expect(result).toContain('id="my-id-concat"');
  });

  it("should support code blocks inside fields", () => {
    const result = md.render(`
::: fields
@prop@
  Here is code:
  \`\`\`js
  console.log("test");
  \`\`\`
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain('<pre><code class="language-js">');
    expect(result).toContain("console.log(&quot;test&quot;);");
  });

  it("should support lists inside fields", () => {
    const result = md.render(`
::: fields
@prop@
  - item 1
  - item 2
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain("<ul>");
    expect(result).toContain("<li>item 1</li>");
  });

  it("should escape HTML in name and attributes", () => {
    const result = md.render(`
::: fields
@<script>alert("XSS")</script>@ title="<img src=x onerror=alert(1)>"
:::
`);

    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;");
    expect(result).toContain("Title: &lt;img src=x onerror=alert(1)&gt;");
  });

  it("should handle 1-character attribute in ucFirst", () => {
    const result = md.render(`
::: fields
@prop@ a=b
:::
`);

    expect(result).toContain("A: b");
  });
});
