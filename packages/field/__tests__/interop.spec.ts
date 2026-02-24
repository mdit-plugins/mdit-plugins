import MarkdownIt from "markdown-it";
import { container } from "@mdit/plugin-container";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

const md = MarkdownIt().use(field);
const mdWithContainer = MarkdownIt({ html: true })
  .use(container, { name: "warning", openRender: () => '<div class="warning">' })
  .use(field);

describe("field inside block elements", () => {
  describe("inside unordered list", () => {
    it("should work inside a list item", () => {
      const result = md.render(`
- list item
  ::: fields
  @prop@
  Description
  :::
`);

      expect(result).toContain("<li>");
      expect(result).toContain(">prop</dt>");
      expect(result).toContain("Description");
    });

    it("should work with nested fields inside a list item", () => {
      const result = md.render(`
- item
  ::: fields
  @parent@
  Parent content.
  @@child@
  Child content.
  :::
`);

      expect(result).toContain("parent");
      expect(result).toContain("child");
      expect(result).toContain("Parent content");
      expect(result).toContain("Child content");
    });
  });

  describe("inside ordered list", () => {
    it("should work inside an ordered list item", () => {
      const result = md.render(`
1. first item
   ::: fields
   @prop@
   Description
   :::
`);

      expect(result).toContain("<ol>");
      expect(result).toContain(">prop</dt>");
      expect(result).toContain("Description");
    });
  });

  describe("inside blockquote", () => {
    it("should work inside a blockquote", () => {
      const result = md.render(`
> ::: fields
> @prop@
> Description
> :::
`);

      expect(result).toContain("<blockquote>");
      expect(result).toContain(">prop</dt>");
      expect(result).toContain("Description");
    });

    it("should work with nested fields inside blockquote", () => {
      const result = md.render(`
> ::: fields
> @root@
> Root content.
> @@child@
> Child content.
> :::
`);

      expect(result).toContain("root");
      expect(result).toContain("child");
      expect(result).toContain("Root content");
      expect(result).toContain("Child content");
    });
  });

  describe("inside @mdit/plugin-container", () => {
    it("should work inside a container plugin block", () => {
      const result = mdWithContainer.render(`
:::: warning
::: fields
@prop@
Description
:::
::::
`);

      expect(result).toContain('class="warning"');
      expect(result).toContain(">prop</dt>");
      expect(result).toContain("Description");
    });
  });
});

describe("block elements inside field content", () => {
  it("should support unordered list as field content", () => {
    const result = md.render(`
::: fields
@prop@
- item a
- item b
:::
`);

    expect(result).toContain("<ul>");
    expect(result).toContain("<li>item a</li>");
    expect(result).toContain("<li>item b</li>");
  });

  it("should support ordered list as field content", () => {
    const result = md.render(`
::: fields
@prop@
1. first
2. second
:::
`);

    expect(result).toContain("<ol>");
    expect(result).toContain("<li>first</li>");
    expect(result).toContain("<li>second</li>");
  });

  it("should support blockquote as field content", () => {
    const result = md.render(`
::: fields
@prop@
> This is a quote
:::
`);

    expect(result).toContain("<blockquote>");
    expect(result).toContain("This is a quote");
  });

  it("should support nested container inside field content", () => {
    const result = mdWithContainer.render(`
:::: fields
@prop@
Content before warning.

::: warning
This is a warning inside the field.
:::
::::
`);

    expect(result).toContain("Content before warning");
    expect(result).toContain('class="warning"');
    expect(result).toContain("This is a warning inside the field");
  });

  it("should support nested field container inside field content", () => {
    const result = md.render(`
:::: fields
@prop-item@
This is a standard field item content.

::: fields
@nested-prop@
Nested content.
:::
::::
`);

    expect(result).toContain(">prop-item</dt>");
    expect(result).toContain(">nested-prop</dt>");
    expect(result).toContain("standard field item content");
    expect(result).toContain("Nested content");
  });

  it("should support mix nesting", () => {
    const mdProps = MarkdownIt().use(field).use(field, { name: "props" });

    const result = mdProps.render(`
:::: fields
@option@
Parent description.
::: props
@prop1@ type="string"
Key description.
@prop2@ type="number"
Key description.
:::
@option2@
Another parent description.
::::
`);

    expect(result).toContain(">option</dt>");
    expect(result).toContain(">option2</dt>");
    expect(result).toContain("Parent description");
    expect(result).toContain("Another parent description");
    expect(result).toMatchSnapshot();
  });
});
