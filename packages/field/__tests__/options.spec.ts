import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

describe("classPrefix option", () => {
  it("should use custom class prefix", () => {
    const customMd = MarkdownIt().use(field, { classPrefix: "my-" });
    const result = customMd.render(`
::: fields
@prop@ type="string"
Description
:::
`);

    expect(result).toContain('class="my-wrapper fields-fields"');
    expect(result).toContain('class="my-name"');
    expect(result).toContain('class="my-attr my-attr-type"');
    expect(result).toContain('class="my-content"');
  });

  it("should use default class prefix when not specified", () => {
    const md = MarkdownIt().use(field);
    const result = md.render(`
::: fields
@prop@
:::
`);

    expect(result).toContain('class="field-wrapper');
    expect(result).toContain('class="field-name"');
  });
});

describe("parseAttributes option", () => {
  it("should skip attribute parsing when parseAttributes is false", () => {
    const noAttrMd = MarkdownIt().use(field, { parseAttributes: false });
    const result = noAttrMd.render(`
::: fields
@prop@ type="string" required
Description
:::
`);

    expect(result).toContain(">prop</dt>");
    expect(result).not.toContain("field-attr");
    expect(result).not.toContain("Type:");
    expect(result).not.toContain("Required");
  });

  it("should parse attributes by default", () => {
    const md = MarkdownIt().use(field);
    const result = md.render(`
::: fields
@prop@ type="string"
:::
`);

    expect(result).toContain("field-attr");
    expect(result).toContain("Type: string");
  });
});

describe("CSS injection prevention", () => {
  it("should strip attributes with invalid CSS class keys during parsing", () => {
    const md = MarkdownIt().use(field);
    const result = md.render(`
::: fields
@prop@ evil"><script>alert(1)</script>=yes
:::
`);

    // Invalid key is stripped during parse phase, so no attr renders at all
    expect(result).not.toContain("field-attr");
    expect(result).toContain(">prop</dt>");
  });

  it("should keep valid attribute keys and strip invalid ones", () => {
    const md = MarkdownIt().use(field);
    const result = md.render(`
::: fields
@prop@ valid-key=val a.b=val2 good=val3
:::
`);

    // valid-key and good are valid; a.b is not (contains dot)
    expect(result).toContain("field-attr-valid-key");
    expect(result).toContain("field-attr-good");
    expect(result).not.toContain("field-attr-ab");
    expect(result).not.toContain("field-attr-a.b");
  });
});
