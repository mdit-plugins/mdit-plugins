import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { field } from "../src/index.js";

const md = MarkdownIt({ html: true }).use(field);

describe(field, () => {
  describe("Basic Rendering", () => {
    it("should render single field", () => {
      const input = `
::: fields
@prop1@
Description 1
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('<div class="field-item" data-level="0">');
      expect(result).toContain('<span class="field-name">prop1</span>');
      expect(result).toContain("<p>Description 1</p>");
    });

    it("should render multiple fields", () => {
      const input = `
::: fields
@prop1@
Description 1

@prop2@
Description 2
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('<span class="field-name">prop1</span>');
      expect(result).toContain('<span class="field-name">prop2</span>');
      expect(result).toContain("<p>Description 1</p>");
      expect(result).toContain("<p>Description 2</p>");
    });
  });

  describe("Attributes", () => {
    it("should render attributes", () => {
      const input = `
::: fields
@prop1@ type="string" required
Description 1
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('<span class="field-attr field-attr-type">Type: string</span>');
      expect(result).toContain('<span class="field-attr field-attr-required">Required</span>');
    });

    it("should handle escaped quotes in attributes", () => {
      const input = `
::: fields
@prop1@ default="foo\\"bar"
:::
`;
      const result = md.render(input);

      expect(result).toContain("Default: foo&quot;bar");
    });

    it("should handle attribute with trailing backslash (edge case)", () => {
      const input = `
::: fields
@test@ attr="val\\
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      // The backslash at the end escapes nothing, so it becomes a backslash
      // wait, code logic: val += "\\";
      expect(result).toContain("Attr: val\\");
    });

    it("should handle unquoted attributes", () => {
      const input = `
::: fields
@prop1@ type=number
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain("Type: number");
    });

    it("should handle mixed attributes", () => {
      const input = `
::: fields
@prop1@ type="string" required default='value'
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain("Type: string");
      expect(result).toContain("Required");
      expect(result).toContain("Default: value");
    });
  });

  describe("Nesting", () => {
    it("should handle 2-space nesting", () => {
      const input = `
::: fields
@parent@
  Description parent.
  
  @child@
  Description child.
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();

      // Parent level 0
      expect(result).toContain('<div class="field-item" data-level="0">');
      expect(result).toContain('<span class="field-name">parent</span>');

      // Child level 1 inside parent
      expect(result).toContain('<div class="field-item" data-level="1">');
      expect(result).toContain('<span class="field-name">child</span>');
    });

    it("should handle deep nesting", () => {
      const input = `
::: fields
@level0@
  @level1@
    @level2@
      @level3@
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('data-level="0"');
      expect(result).toContain('data-level="1"');
      expect(result).toContain('data-level="2"');
      expect(result).toContain('data-level="3"');
    });

    it("should handle siblings at nested levels", () => {
      const input = `
::: fields
@root@
  @child1@
  
  @child2@
    @grandchild@
  @child3@
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      // Should verify structure implicity via snapshot, but we can check existence
      expect(result).toContain("child1");
      expect(result).toContain("child2");
      expect(result).toContain("grandchild");
      expect(result).toContain("child3");
    });
  });

  describe("Escaping", () => {
    it("should handle escaped name markers", () => {
      const input = `
::: fields
@\\@name\\@@
Description
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('<span class="field-name">@name@</span>');
    });

    it("should ignore lines starting with escaped @", () => {
      const input = `
::: fields
@prop@
Description includes:
\\@not-a-field
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain("@not-a-field"); // Should appear as text
      expect(result).not.toContain('<span class="field-name">not-a-field</span>');
    });
  });

  describe("Container ID", () => {
    it("should support #id syntax in fence", () => {
      const input = `
::: fields #my-id
@prop@
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('id="my-id"');
    });

    it("should support concatenated #id syntax", () => {
      const input = `
::: fields#my-id-2
@prop@
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('id="my-id-2"');
    });

    it("should support #id with extra params", () => {
      const input = `
::: fields #my-id-space extra
@prop@
:::
`;
      const result = md.render(input);
      expect(result).toContain('id="my-id-space"');
    });

    it("should support concatenated #id with extra params", () => {
      const input = `
::: fields#my-id-concat extra
@prop@
:::
`;
      const result = md.render(input);
      expect(result).toContain('id="my-id-concat"');
    });
  });

  describe("Complex Content", () => {
    it("should support code blocks inside fields", () => {
      const input = `
::: fields
@prop@
  Here is code:
  \`\`\`js
  console.log("test");
  \`\`\`
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('<pre><code class="language-js">');
      expect(result).toContain("console.log(&quot;test&quot;);");
    });

    it("should support lists inside fields", () => {
      const input = `
::: fields
@prop@
  - item 1
  - item 2
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain("<ul>");
      expect(result).toContain("<li>item 1</li>");
    });
  });

  describe("Edge Cases", () => {
    it("should ignore fence with insufficient markers", () => {
      const input = `
:: fields
@prop@
:::
`;
      const result = md.render(input);
      expect(result).not.toContain('class="field-wrapper');
      expect(result).toContain(":: fields");
    });

    it("should handle nested fences with fewer markers", () => {
      const input = `
::: fields
@prop@
content
::
:::
`;
      const result = md.render(input);
      expect(result).toContain("::");
    });

    it("should ignore malformed markers", () => {
      const input = `
::: fields
@prop@
content

@prop
No closing marker
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain("@prop");
      expect(result).toContain("<p>@prop\nNo closing marker</p>");
    });

    it("should ignore invalid suffix", () => {
      const input = `
::: fieldsfoo
content
:::
`;
      const result = md.render(input);
      expect(result).not.toContain('class="field-wrapper');
      expect(result).toContain("fieldsfoo");
    });

    it("should fail validation when container name is incomplete", () => {
      const input = `
::: fie
content
:::
`;
      const result = md.render(input);
      expect(result).not.toContain('class="field-wrapper');
      expect(result).toContain("::: fie");
    });

    it("should fail validation when container name mismatches", () => {
      const input = `
::: fielzs
content
:::
`;
      const result = md.render(input);
      expect(result).not.toContain('class="field-wrapper');
      expect(result).toContain("::: fielzs");
    });

    it("should support extra parameters in fence", () => {
      const input = `
::: fields extra-param
content
:::
`;
      // Should accept it as valid fields container (with no id)
      // because we only validate "fields" name, and then parse optional params.
      const result = md.render(input);

      expect(result).toContain('class="field-wrapper fields-fields"');
      expect(result).not.toContain("id=");
    });

    it("should pass validation in silent mode (interrupting paragraph)", () => {
      const input = `
paragraph
::: fields
@item@
:::
`;
      const result = md.render(input);

      expect(result).toContain("<p>paragraph</p>");
      expect(result).toContain('class="field-wrapper');
    });

    it("should ignore invalid markers starting with @", () => {
      // Inside fields, lines starting with @ but not valid markers.
      // e.g. "@" (too short) or "@ foo" (space)
      const input = `
::: fields
@
@ foo
:::
`;
      const result = md.render(input);
      expect(result).not.toContain("@");
    });

    it("should ignore content before first field", () => {
      const input = `
::: fields
only this text
@prop1@
Description 1
:::
`;
      const result = md.render(input);

      expect(result).not.toContain("only this text");
      expect(result).toContain("prop1");
      expect(result).toContain("Description 1");
    });

    it("should handle sibling items correctly (breaking loop)", () => {
      const input = `
::: fields
  @item1@
  content
  @item2@
  content
:::
`;
      const result = md.render(input);
      expect(result).toContain('data-level="1"');
      expect(result).toContain("item1");
      expect(result).toContain("item2");
    });

    it("should ignore deeply nested closing fence", () => {
      const input = `
  ::: fields
  @prop@
:::
  :::
`;
      const result = md.render(input);
      expect(result).toContain('class="field-wrapper');
    });
  });

  describe("Advanced Nesting", () => {
    it("should handle fields container inside fields container", () => {
      const input = `
:::: fields #outer
@outer-prop@
  Outer description.
  
  ::: fields #inner
  @inner-prop@
  Inner description
  :::
::::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('id="outer"');
      expect(result).toContain('id="inner"');
      expect(result).toContain('<span class="field-name">outer-prop</span>');
      expect(result).toContain('<span class="field-name">inner-prop</span>');
    });

    it("should handle different field containers nested", () => {
      const md = MarkdownIt().use(field, { name: "props" }).use(field, { name: "events" });
      const input = `
::: props
@prop1@
  ::: events
  @event1@
  :::
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('class="field-wrapper props-fields"');
      expect(result).toContain('class="field-wrapper events-fields"');
      expect(result).toContain('<span class="field-name">prop1</span>');
      expect(result).toContain('<span class="field-name">event1</span>');
    });

    it("should break item on parent container end with less indentation", () => {
      const input = `
::: fields
  @prop@
  Description
:::
`;
      const result = md.render(input);
      expect(result).toMatchSnapshot();
      expect(result).toContain('data-level="1"');
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

      const result = md.render(input);

      expect(result).toBe(md.render(closedInput));
    });

    it("should handle trailing = in attributes", () => {
      const input = `
::: fields
@prop@ key=
Description
:::
`;
      const result = md.render(input);
      expect(result).not.toContain("key=");
      expect(result).toContain("prop");
    });

    it("should handle escaped backslash in field name", () => {
      const input = `
::: fields
@name\\\\@
Description
:::
`;
      const result = md.render(input);
      expect(result).toContain("name\\");
    });

    it("should handle backslash at end of quoted attribute", () => {
      const input = `
::: fields
@prop@ key="val\\\\"
Description
:::
`;
      const result = md.render(input);
      expect(result).toContain("val\\");
    });

    it("should handle item without closing container", () => {
      const input = `
::: fields
@prop@
content`;
      const result = md.render(input);
      expect(result).toContain("prop");
      expect(result).toContain("content");
    });

    it("should ignore deep content before first field", () => {
      const input = `
::: fields
> blockquote

- list

@prop@
Description
:::
`;
      const result = md.render(input);
      expect(result).not.toContain("blockquote");
      expect(result).not.toContain("list");
      expect(result).toContain("prop");
      expect(result).toContain("Description");
    });

    it("should handle complex nested containers for scanner", () => {
      const input = `
::: fields
@outer@
  ::: fields
  @inner@
  :::
@outer2@
:::
`;
      const result = md.render(input);
      expect(result).toContain("outer");
      expect(result).toContain("inner");
      expect(result).toContain("outer2");
    });

    it("should handle negative indent in getFieldsRule", () => {
      const input = `
- list
  ::: fields
  @prop@
  :::
`;
      const result = md.render(input);
      expect(result).toContain("prop");
    });

    it("should handle invalid closing fence in getFieldsRule", () => {
      const input = `
::: fields
@prop@
::: invalid
:::
`;
      const result = md.render(input);
      expect(result).toContain("prop");
      expect(result).toContain("::: invalid");
    });

    it("should handle item with less indentation than container", () => {
      // We simulate this by having container indented and item NOT indented.
      const input = `
  ::: fields
@prop@
  Description
  :::
`;
      const result = md.render(input);
      // @prop@ should not be parsed as a field because it's not indented as much as the container
      expect(result).not.toContain('class="field-item"');
      expect(result).toContain("@prop@");
    });

    it("should handle nested container at same level in item loop", () => {
      // This triggers nextIndent <= 0 && charCode === 58
      const input = `
::: fields
@prop@
::: fields
@sub@
:::
:::
`;
      const result = md.render(input);
      expect(result).toContain("prop");
    });

    it("should handle item breaking on another item at same level", () => {
      // This covers nextMarker && nextIndent <= indent
      const input = `
::: fields
@prop1@
Description
@prop2@
Description 2
:::
`;
      const result = md.render(input);
      expect(result).toContain("prop1");
      expect(result).toContain("prop2");
    });

    it("should handle unclosed quote in attributes", () => {
      const input = `
::: fields
@prop@ key="val
:::
`;
      const result = md.render(input);
      expect(result).toContain("Key: val");
    });

    it("should handle backslash at end of attributes string", () => {
      // This triggers the 'else' branch of index + 1 < content.length
      const input = `
::: fields
@prop@ key="val\\`;
      const result = md.render(input);
      expect(result).toContain("prop");
    });

    it("should handle line with 0 indent that is not a closing fence", () => {
      const input = `
::: fields
@prop@
not a fence
:::
`;
      const result = md.render(input);
      expect(result).toContain("prop");
      expect(result).toContain("not a fence");
    });

    it("should handle indent < 0 in getFieldItemRule", () => {
      const input = `
- list item
  ::: fields
@prop@
  :::
`;
      const result = md.render(input);

      // @prop@ should not be parsed as a field because it has less indentation than its container
      expect(result).not.toContain('class="field-item"');
    });

    it("should handle nested fences with extra content in getFieldsRule", () => {
      const input = `
::: fields
@prop@
::: extra
:::
`;
      const result = md.render(input);
      // ::: extra should not close the container if it has extra content
      expect(result).toContain("::: extra");
      expect(result).toContain("prop");
    });

    it("should break item loop on less indented line in getFieldItemRule", () => {
      const input = `
::: fields
  @prop@
Text after prop
:::
`;
      const result = md.render(input);
      expect(result).toContain("prop");
      expect(result).toContain("Text after prop");
    });

    it("should handle 1-character attribute in ucFirst", () => {
      const input = `
::: fields
@prop@ a=b
:::
`;
      const result = md.render(input);
      expect(result).toContain("A: b");
    });

    it("should escape HTML in name and attributes", () => {
      const input = `
::: fields
@<script>alert("XSS")</script>@ title="<img src=x onerror=alert(1)>"
:::
`;
      const result = md.render(input);

      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;");
      expect(result).toContain("Title: &lt;img src=x onerror=alert(1)&gt;");
    });
  });
});
