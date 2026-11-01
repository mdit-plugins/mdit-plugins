import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

const getRuleNames = (ruler: unknown): string[] =>
  (ruler as { __rules__: { name: string }[] }).__rules__.map(({ name }) => name);

const options = { name: "props" };

const source = `\
::: props
@\`prop\`
Description
:::
`;

describe(field, () => {
  it("should not register the configured rules twice", () => {
    const single = new MarkdownIt({ html: true }).use(field, options);
    const double = new MarkdownIt({ html: true }).use(field, options).use(field, options);
    const blockRules = getRuleNames(double.block.ruler);
    const coreRules = getRuleNames(double.core.ruler);
    const result = double.render(source);

    expect(blockRules.filter((name) => name === "field_props")).toHaveLength(1);
    expect(blockRules.filter((name) => name === "field_props_item")).toHaveLength(1);
    expect(coreRules.filter((name) => name === "field_props_fields_scanner")).toHaveLength(1);

    // A single installation must still register everything once.
    expect(getRuleNames(single.block.ruler).filter((name) => name === "field_props")).toHaveLength(
      1,
    );
    expect(
      getRuleNames(single.block.ruler).filter((name) => name === "field_props_item"),
    ).toHaveLength(1);
    expect(
      getRuleNames(single.core.ruler).filter((name) => name === "field_props_fields_scanner"),
    ).toHaveLength(1);
    expect(result).toBe(single.render(source));
    expect(result).toContain('<dt class="field-name"');
  });

  it("should not mistake a built-in block rule for its own rule", () => {
    const markdownIt = new MarkdownIt({ html: true }).use(field, { name: "table" });

    expect(getRuleNames(markdownIt.block.ruler).filter((name) => name === "table")).toHaveLength(1);
    expect(
      getRuleNames(markdownIt.block.ruler).filter((name) => name === "field_table"),
    ).toHaveLength(1);
    expect(markdownIt.render(source.replaceAll("props", "table"))).toContain(
      "field-wrapper table-fields",
    );
    expect(markdownIt.render("| a | b |\n| - | - |\n| c | d |\n")).toContain("<table>");
  });

  it("should be a true no-op when the same name is installed again with different options", () => {
    const markdownIt = new MarkdownIt({ html: true })
      .use(field, { name: "props", classPrefix: "first-" })
      .use(field, { name: "props", classPrefix: "second-" });
    const first = new MarkdownIt({ html: true }).use(field, {
      name: "props",
      classPrefix: "first-",
    });
    const result = markdownIt.render(source);

    expect(result).toBe(first.render(source));
    expect(result).not.toContain("second-");
  });
});
