import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";
import { getFieldsScanner } from "../src/rules.js";

const md = new MarkdownIt({ html: true }).use(field);

const countFields = (html: string): number =>
  html.match(/class="field-wrapper fields-fields"/g)?.length ?? 0;

describe("field scanner container bounds", () => {
  it("should keep a nested container and the following sibling independent", () => {
    const source = `\
:::: fields
@\`outer\`
Outer content.

::: fields
@\`inner\`
Inner content
:::
::::

::: fields
@\`sibling\`
Sibling content
:::
`;
    const tokens = md.parse(source, {});
    const result = md.render(source);

    expect(countFields(result)).toBe(3);
    expect(result).toContain(">outer</dt>");
    expect(result).toContain(">inner</dt>");
    expect(result).toContain(">sibling</dt>");
    expect(result).toContain("<p>Outer content.</p>");
    expect(result).toContain("<p>Inner content</p>");
    expect(result).toContain("<p>Sibling content</p>");

    // Hiding content before a first field must stay inside the container: no token of a nested
    // container or a following sibling may be turned into a hidden placeholder.
    expect(tokens.filter((token) => token.hidden)).toStrictEqual([]);

    // Token maps must keep the source ranges of every container.
    expect(
      tokens.filter((token) => token.type === "fields_fields_open").map((token) => token.map),
    ).toStrictEqual([
      [0, 9],
      [4, 8],
      [10, 14],
    ]);
  });

  it("should keep a sibling container independent when the nested container comes first", () => {
    const source = `\
:::: fields
::: fields
@\`inner\`
Inner content
:::
@\`outer\`
Outer content
::::

::: fields
@\`sibling\`
Sibling content
:::
`;
    const tokens = md.parse(source, {});
    const result = md.render(source);

    // The nested container has no visible field item, so its content stays hidden.
    expect(result).not.toContain("Inner content");
    expect(result).toContain('<dl class="field-wrapper fields-fields" data-kind="fields"></dl>');

    // The outer container and the following sibling render normally.
    expect(countFields(result)).toBe(3);
    expect(result).toContain(">outer</dt>");
    expect(result).toContain("<p>Outer content</p>");
    expect(result).toContain(">sibling</dt>");
    expect(result).toContain("<p>Sibling content</p>");

    expect(
      tokens.filter((token) => token.type === "fields_fields_open").map((token) => token.map),
    ).toStrictEqual([
      [0, 8],
      [1, 5],
      [9, 13],
    ]);
  });

  it("should not scan past a re-leveled close token into following blocks", () => {
    const mdWithReleveledCloses = new MarkdownIt({ html: true }).use(field);

    // Simulate a third-party core rule that re-levels the closing tokens: the container scan
    // must be bounded by its own close token instead of running to the end of the document.
    mdWithReleveledCloses.core.ruler.before("inline", "relevel_fields_close", (state) => {
      state.tokens
        .filter((token) => token.type === "fields_fields_close")
        .forEach((token) => {
          token.level += 1;
        });
    });

    const result = mdWithReleveledCloses.render(`\
::: fields
intro
:::

between

::: fields
@\`prop\`
Description
:::
`);

    // The paragraph and the second container must not be hidden by the first container's scan.
    expect(result).toContain("<p>between</p>");
    expect(countFields(result)).toBe(2);
    expect(result).toContain(">prop</dt>");
    expect(result).toContain("<p>Description</p>");
  });
});

describe("field scanner token structure", () => {
  it("should leave field structure tokens before the first field untouched", () => {
    const { Token } = MarkdownIt;
    const tokens = [
      new Token("fields_fields_open", "dl", 1),
      new Token("fields_field_close", "div", -1),
      new Token("fields_fields_inner_open", "dl", 1),
      new Token("fields_fields_inner_close", "dl", -1),
      new Token("paragraph_open", "p", 1),
      new Token("inline", "", 0),
      new Token("paragraph_close", "p", -1),
      new Token("fields_fields_close", "dl", -1),
    ];

    tokens[0].level = 0;
    tokens[1].level = 1;
    tokens[2].level = 1;
    tokens[3].level = 1;
    tokens[4].level = 1;
    tokens[5].level = 2;
    tokens[6].level = 1;
    tokens[7].level = 0;

    getFieldsScanner("fields")(tokens);

    // Field structure tokens are rendered even before the first field item, so they are kept.
    expect(tokens[1].hidden).toBe(false);
    expect(tokens[1].type).toBe("fields_field_close");
    expect(tokens[2].hidden).toBe(false);
    expect(tokens[2].type).toBe("fields_fields_inner_open");
    expect(tokens[3].hidden).toBe(false);
    expect(tokens[3].type).toBe("fields_fields_inner_close");

    // Regular content before the first field item is hidden.
    for (const token of [tokens[4], tokens[5], tokens[6]]) {
      expect(token.hidden).toBe(true);
      expect(token.type).toBe("fields_fields_empty");
    }
  });
});
