import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItAttrsOptions } from "../../src/index.js";
import { attrs } from "../../src/index.js";
import { replaceDelimiters } from "../replaceDelimiters.js";

const createDualRuleTests = (
  baseOptions: MarkdownItAttrsOptions & { left: string; right: string },
  delimiterText: string,
): void => {
  const contexts = [
    { rule: ["list"], testSuffix: "(list rule only)" },
    { rule: "all", testSuffix: "(all rules)" },
  ] as const;

  contexts.forEach(({ rule, testSuffix }) => {
    const options = { ...baseOptions, allowed: [], rule };
    const testTitle = `list rules ${delimiterText} ${testSuffix}`;

    describe(testTitle, () => {
      const markdownIt = MarkdownIt().use(attrs, options);

      it(
        replaceDelimiters("should add classes for list items", options),
        () => {
          const src = "- item 1{.red}\n- item 2";

          const expected = `\
<ul>
<li class="red">item 1</li>
<li>item 2</li>
</ul>
`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters("should add classes in nested lists", options),
        () => {
          const src = `\
- item 1{.a}
  - nested item {.b}
  {.c}
    1. nested nested item {.d}
    {.e}
`;

          const expected = `\
<ul>
<li class="a">item 1
<ul class="c">
<li class="b">nested item
<ol class="e">
<li class="d">nested nested item</li>
</ol>
</li>
</ul>
</li>
</ul>
`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters("should not trim unrelated white space", options),
        () => {
          const src = "- **bold** text {.red}";

          const expected = `\
<ul>
<li class="red"><strong>bold</strong> text</li>
</ul>
`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters(
          "should add attributes to ul when below last bullet point",
          options,
        ),
        () => {
          const src = "- item1\n- item2\n{.red}";
          const expected =
            '<ul class="red">\n<li>item1</li>\n<li>item2</li>\n</ul>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters(
          "should add classes for both last list item and ul",
          options,
        ),
        () => {
          const src = "- item{.red}\n{.blue}";

          const expected = `\
<ul class="blue">
<li class="red">item</li>
</ul>
`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters('should add class ul after a "soft-break"', options),
        () => {
          const src = "- item\n{.blue}";

          const expected = `\
<ul class="blue">
<li>item</li>
</ul>
`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters(
          'should ignore non-text "attr-like" text after a "soft-break"',
          options,
        ),
        () => {
          const src = "- item\n*{.blue}*";

          const expected = `\
<ul>
<li>item\n<em>{.blue}</em></li>
</ul>
`;

          expect(markdownIt.render(src)).toBe(expected);
        },
      );

      it(replaceDelimiters("should work with ordered lists", options), () => {
        const src = "1. item\n{.blue}";

        const expected = `\
<ol class="blue">
<li>item</li>
</ol>
`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      });

      it(replaceDelimiters("should support nested lists", options), () => {
        const src = `\
- item
  - nested
  {.red}

{.blue}
`;

        const expected = `\
<ul class="blue">
<li>item
<ul class="red">
<li>nested</li>
</ul>
</li>
</ul>
`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      });

      it(
        replaceDelimiters(
          "should not apply inside item lists with trailing `code{.red}`",
          options,
        ),
        () => {
          const src = "- item with trailing `code = {.red}`";
          const expected =
            "<ul>\n<li>item with trailing <code>code = {.red}</code></li>\n</ul>\n";

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            replaceDelimiters(expected, options),
          );
        },
      );

      it(
        replaceDelimiters(
          "should not apply inside item lists with trailing non-text, eg *{.red}*",
          options,
        ),
        () => {
          const src = "- item with trailing *{.red}*";
          const expected =
            "<ul>\n<li>item with trailing <em>{.red}</em></li>\n</ul>\n";

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            replaceDelimiters(expected, options),
          );
        },
      );

      it(
        replaceDelimiters(
          "should not crash on {#ids} in front of list items",
          options,
        ),
        () => {
          const src = "- {#ids} [link](./link)";
          const expected = replaceDelimiters(
            '<ul>\n<li>{#ids} <a href="./link">link</a></li>\n</ul>\n',
            options,
          );

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );
    });
  });
};

// Call the dual rule tests for different delimiter configurations
createDualRuleTests(
  {
    left: "{",
    right: "}",
  },
  "",
);

createDualRuleTests(
  {
    left: "[",
    right: "]",
  },
  "with [ ] delimiters",
);

createDualRuleTests(
  {
    left: "[[",
    right: "]]",
  },
  "with [[ ]] delimiters",
);
