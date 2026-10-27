import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

const md = new MarkdownIt({ html: true }).use(field);

const countTags = (html: string, pattern: RegExp): number => html.match(pattern)?.length ?? 0;

const expectBalancedFields = (result: string): void => {
  // Both the container and each field item must have matching open/close tags
  expect(countTags(result, /<dl\b/g)).toBe(countTags(result, /<\/dl>/g));
  expect(countTags(result, /<dt\b/g)).toBe(countTags(result, /<\/dt>/g));
  expect(countTags(result, /<dd\b/g)).toBe(countTags(result, /<\/dd>/g));
};

describe("field items inside block contexts", () => {
  it("should render a field item inside a blockquote", () => {
    const result = md.render(`
::: fields
> @\`prop\`
> Description
:::
`);

    expectBalancedFields(result);
    expect(result).toContain(">prop</dt>");
    expect(result).toContain("Description");
    // No field close tag may be emitted before the matching open tags
    expect(result.indexOf("</dd>")).toBeGreaterThan(result.indexOf("<dt"));
  });

  it("should render a field item inside a list item", () => {
    const result = md.render(`
::: fields
- @\`prop\`
  Description
:::
`);

    expectBalancedFields(result);
    expect(result).toContain(">prop</dt>");
    expect(result).toContain("Description");
    expect(result.indexOf("</dd>")).toBeGreaterThan(result.indexOf("<dt"));
  });
});

describe("nested field items inside block contexts", () => {
  it("should render a nested field item inside a blockquote", () => {
    const result = md.render(`
::: fields
@\`root\`
> @@\`quoted\`
> Quoted content.
:::
`);

    expectBalancedFields(result);
    expect(result).toContain(">root</dt>");
    expect(result).toContain(">quoted</dt>");
    expect(result).toContain("Quoted content.");
  });

  it("should render a nested field item inside a list item", () => {
    const result = md.render(`
::: fields
@\`root\`
- @@\`child\`
  Child content.
:::
`);

    expectBalancedFields(result);
    expect(result).toContain(">root</dt>");
    expect(result).toContain(">child</dt>");
    expect(result).toContain("Child content.");
  });
});
