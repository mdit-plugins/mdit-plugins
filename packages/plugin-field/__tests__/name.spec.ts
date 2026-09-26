import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

const md = new MarkdownIt().use(field);

// a literal backtick, keeps the escape-heavy cases readable
const BT = "`";

// a marker at the start of a single-field container
const render = (marker: string): string => md.render(["::: fields", marker, ":::"].join("\n"));

const dt = (name: string, level = 1): string =>
  `<dt class="field-name" data-level="${level}">${name}</dt>`;

// the content of the first code span in a source, exactly as markdown-it reads it
const markdownItCodeSpan = (source: string): string | undefined => {
  const [token] = new MarkdownIt().parseInline(source, {});

  return token?.children?.find((child) => child.type === "code_inline")?.content;
};

describe("field name", () => {
  it("should parse a backtick quoted name", () => {
    expect(render("@`prop1`")).toContain(dt("prop1"));
  });

  it("should keep characters that collide with markdown syntax", () => {
    // a path segment was reported as an inline HTML element
    expect(render("@`locales.<localePath>.latestUpdateAt`")).toContain(
      dt("locales.&lt;localePath&gt;.latestUpdateAt"),
    );
    // emphasis markers were rewritten by formatters, e.g. `*` to `_`
    expect(render("@`config[*].matches[*]`")).toContain(dt("config[*].matches[*]"));
    expect(render("@`config['a.b']`")).toContain(dt("config[&#39;a.b&#39;]"));
  });

  it("should support nesting depth with leading @", () => {
    const result = md.render(`
::: fields
@\`level1\`
@@\`level2\`
@@@\`level3\`
@@@@\`level4\`
:::
`);

    expect(result).toContain(dt("level1", 1));
    expect(result).toContain(dt("level2", 2));
    expect(result).toContain(dt("level3", 3));
    expect(result).toContain(dt("level4", 4));
  });

  it("should not require escaping @ inside a name", () => {
    expect(render("@`user@domain.com`")).toContain(dt("user@domain.com"));
  });

  it("should keep backslashes in a name", () => {
    expect(render(`@${BT}a\\b${BT}`)).toContain(dt(`a\\b`));
  });

  it("should allow spaces inside a name", () => {
    expect(render(`@${BT}a b${BT}`)).toContain(dt("a b"));
  });

  it("should support a backtick inside a name with longer delimiters", () => {
    expect(render(`@${BT}${BT}a${BT}b${BT}${BT}`)).toContain(dt(`a${BT}b`));
  });

  it("should support consecutive backticks inside a name", () => {
    expect(render(`@${BT}${BT}${BT}a${BT}${BT}b${BT}${BT}${BT}`)).toContain(dt(`a${BT}${BT}b`));
  });

  it("should support a name wrapped in backticks", () => {
    expect(render(`@${BT}${BT} ${BT}x${BT} ${BT}${BT}`)).toContain(dt(`${BT}x${BT}`));
  });

  it("should strip one surrounding space following markdown", () => {
    expect(render(`@${BT}${BT} a ${BT}${BT}`)).toContain(dt("a"));
    expect(render(`@${BT}${BT}   ${BT}${BT}`)).toContain(dt("   "));
  });

  it("should require a matching delimiter length", () => {
    // a run of another length does not close the delimiter, so the name stays unclosed
    expect(md.render(["::: fields", `@${BT}a${BT}${BT}`, ":::"].join("\n"))).not.toContain(
      "field-name",
    );
    expect(md.render(["::: fields", `@${BT}${BT}${BT}a${BT}`, ":::"].join("\n"))).not.toContain(
      "field-name",
    );
  });

  it("should allow cosmetic indentation", () => {
    expect(render("   @`prop`")).toContain(dt("prop"));
  });

  it("should require the delimiter right after the @", () => {
    const result = md.render(`
::: fields
@\`prop\`
@ \`not-a-field\`
:::
`);

    expect(result).toContain(dt("prop"));
    expect(result).not.toContain("not-a-field</dt>");
  });

  it("should not treat an unclosed name as a field", () => {
    const result = md.render(`
::: fields
@\`prop\`
Description
@\`unclosed
:::
`);

    expect(result).toContain(dt("prop"));
    expect(result).not.toContain("unclosed</dt>");
    expect(result).toContain("`unclosed");
  });

  it("should not treat the legacy @name@ syntax as a field", () => {
    const result = md.render(`
::: fields
@\`prop\`
Description
@legacy@
@@legacy-nested@
:::
`);

    expect(result).toContain(dt("prop"));
    expect(result).not.toContain("legacy</dt>");
    expect(result).toContain("@legacy@");
    expect(result).toContain("@@legacy-nested@");
  });

  it("should escape HTML in a name", () => {
    expect(render("@`<script>x</script>`")).toContain(dt("&lt;script&gt;x&lt;/script&gt;"));
  });

  it("should support allowedAttributes", () => {
    const result = new MarkdownIt()
      .use(field, {
        allowedAttributes: [
          { attr: "type", name: "Property Type" },
          { attr: "required", boolean: true },
        ],
      })
      .render(["::: fields", "@`prop` required type=`RegExp`", ":::"].join("\n"));

    expect(result).toContain(dt("prop"));
    expect(result).toContain("Property Type: RegExp");
    expect(result).toContain("Required");
  });

  it("should parse a name exactly as markdown-it parses the code span", () => {
    // the promise of the syntax is that the name matches what renderers and formatters see
    const cases = ["`a`", "``a`b``", "`  a  `", "` `", "```a``b```", "`` `x` ``", "`a\\b`"];

    const parseName = (span: string): string | undefined => {
      const tokens = new MarkdownIt()
        .use(field)
        .parse(["::: fields", `@${span}`, ":::"].join("\n"), {});
      const token = tokens.find((item) => item.type === "fields_field_open") as
        | { meta: { name: string } }
        | undefined;

      return token?.meta.name;
    };

    expect(cases.map((span) => parseName(span))).toStrictEqual(
      cases.map((span) => markdownItCodeSpan(span)),
    );
  });
});
