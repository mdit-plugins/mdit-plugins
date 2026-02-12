import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

const md = MarkdownIt({ html: true }).use(field);

describe("edge cases", () => {
  it("should ignore fence with insufficient markers", () => {
    const result = md.render(`
:: fields
@prop@
:::
`);

    expect(result).not.toContain('class="field-wrapper');
    expect(result).toContain(":: fields");
  });

  it("should handle nested fences with fewer markers", () => {
    const result = md.render(`
::: fields
@prop@
content
::
:::
`);

    expect(result).toContain("::");
  });

  it("should ignore malformed markers", () => {
    const result = md.render(`
::: fields
@prop@
content

@prop
No closing marker
:::
`);

    expect(result).toMatchSnapshot();
    expect(result).toContain("@prop");
    expect(result).toContain("<p>@prop\nNo closing marker</p>");
  });

  it("should ignore invalid suffix", () => {
    const result = md.render(`
::: fieldsfoo
content
:::
`);

    expect(result).not.toContain('class="field-wrapper');
    expect(result).toContain("fieldsfoo");
  });

  it("should fail validation when container name is incomplete", () => {
    const result = md.render(`
::: fie
content
:::
`);

    expect(result).not.toContain('class="field-wrapper');
    expect(result).toContain("::: fie");
  });

  it("should fail validation when container name mismatches", () => {
    const result = md.render(`
::: fielzs
content
:::
`);

    expect(result).not.toContain('class="field-wrapper');
    expect(result).toContain("::: fielzs");
  });

  it("should support extra parameters in fence", () => {
    const result = md.render(`
::: fields extra-param
content
:::
`);

    expect(result).toContain('class="field-wrapper fields-fields"');
    expect(result).not.toContain("id=");
  });

  it("should pass validation in silent mode (interrupting paragraph)", () => {
    const result = md.render(`
paragraph
::: fields
@item@
:::
`);

    expect(result).toContain("<p>paragraph</p>");
    expect(result).toContain('class="field-wrapper');
  });

  it("should ignore invalid markers starting with @", () => {
    const result = md.render(`
::: fields
@
@ foo
:::
`);

    expect(result).not.toContain("@");
  });

  it("should ignore content before first field", () => {
    const result = md.render(`
::: fields
only this text
@prop1@
Description 1
:::
`);

    expect(result).not.toContain("only this text");
    expect(result).toContain("prop1");
    expect(result).toContain("Description 1");
  });

  it("should handle sibling items correctly (breaking loop)", () => {
    const result = md.render(`
::: fields
@item1@
content
@item2@
content
:::
`);

    expect(result).toContain('data-level="1"');
    expect(result).toContain("item1");
    expect(result).toContain("item2");
  });

  it("should ignore deeply nested closing fence", () => {
    const result = md.render(`
  ::: fields
  @prop@
:::
  :::
`);

    expect(result).toContain('class="field-wrapper');
  });

  it("should handle auto-close", () => {
    const input = `
::: fields
@prop1@
Description 1

@prop2@
Description 2
`;
    const closedInput = `
::: fields
@prop1@
Description 1

@prop2@
Description 2
:::
`;

    expect(md.render(input)).toBe(md.render(closedInput));
  });

  it("should handle trailing = in attributes", () => {
    const result = md.render(`
::: fields
@prop@ key=
Description
:::
`);

    expect(result).not.toContain("key=");
    expect(result).toContain("prop");
  });

  it("should handle escaped backslash in field name", () => {
    const result = md.render(`
::: fields
@name\\\\@
Description
:::
`);

    expect(result).toContain("name\\");
  });

  it("should handle backslash at end of quoted attribute", () => {
    const result = md.render(`
::: fields
@prop@ key="val\\\\"
Description
:::
`);

    expect(result).toContain("val\\");
  });

  it("should handle item without closing container", () => {
    const result = md.render(`
::: fields
@prop@
content`);

    expect(result).toContain("prop");
    expect(result).toContain("content");
  });

  it("should ignore deep content before first field", () => {
    const result = md.render(`
::: fields
> blockquote

- list

@prop@
Description
:::
`);

    expect(result).not.toContain("blockquote");
    expect(result).not.toContain("list");
    expect(result).toContain("prop");
    expect(result).toContain("Description");
  });

  it("should handle complex nested containers for scanner", () => {
    const result = md.render(`
::: fields
@outer@
  ::: fields
  @inner@
  :::
@outer2@
:::
`);

    expect(result).toContain("outer");
    expect(result).toContain("inner");
    expect(result).toContain("outer2");
  });

  it("should handle negative indent in getFieldsRule", () => {
    const result = md.render(`
- list
  ::: fields
  @prop@
  :::
`);

    expect(result).toContain("prop");
  });

  it("should handle invalid closing fence in getFieldsRule", () => {
    const result = md.render(`
::: fields
@prop@
::: invalid
:::
`);

    expect(result).toContain("prop");
    expect(result).toContain("::: invalid");
  });

  it("should handle item with less indentation than container", () => {
    const result = md.render(`
  ::: fields
@prop@
  Description
  :::
`);

    expect(result).not.toContain('class="field-item"');
    expect(result).toContain("@prop@");
  });

  it("should handle nested container at same level in item loop", () => {
    const result = md.render(`
::: fields
@prop@
::: fields
@sub@
:::
:::
`);

    expect(result).toContain("prop");
  });

  it("should handle item breaking on another item at same level", () => {
    const result = md.render(`
::: fields
@prop1@
Description
@prop2@
Description 2
:::
`);

    expect(result).toContain("prop1");
    expect(result).toContain("prop2");
  });

  it("should handle unclosed quote in attributes", () => {
    const result = md.render(`
::: fields
@prop@ key="val
:::
`);

    expect(result).toContain("Key: val");
  });

  it("should handle backslash at end of attributes string", () => {
    const result = md.render(`
::: fields
@prop@ key="val\\`);

    expect(result).toContain("prop");
  });

  it("should handle line with 0 indent that is not a closing fence", () => {
    const result = md.render(`
::: fields
@prop@
not a fence
:::
`);

    expect(result).toContain("prop");
    expect(result).toContain("not a fence");
  });

  it("should handle indent < 0 in getFieldItemRule", () => {
    const result = md.render(`
- list item
  ::: fields
@prop@
  :::
`);

    expect(result).not.toContain('class="field-item"');
  });

  it("should handle nested fences with extra content in getFieldsRule", () => {
    const result = md.render(`
::: fields
@prop@
::: extra
:::
`);

    expect(result).toContain("::: extra");
    expect(result).toContain("prop");
  });

  it("should handle cosmetic-indented content after field item", () => {
    const result = md.render(`
::: fields
  @prop@
Text after prop
:::
`);

    expect(result).toContain("prop");
    expect(result).toContain("Text after prop");
  });
});
