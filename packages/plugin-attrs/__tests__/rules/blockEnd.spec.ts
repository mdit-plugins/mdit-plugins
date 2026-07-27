import { katex } from "@mdit/plugin-katex";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItAttrsOptions } from "../../src/index.js";
import { attrs } from "../../src/index.js";
import { replaceDelimiters } from "../replaceDelimiters.js";
import {
  headingAnchorPlugin,
  trailingSpacePlugin,
  unmatchedOpenPlugin,
} from "../simulatedPlugins.js";

const createDualRuleTests = (
  baseOptions: MarkdownItAttrsOptions & { left: string; right: string },
  delimiterText: string,
): void => {
  const contexts = [
    { rule: ["block"], testSuffix: "(legacy block rule only)" },
    { rule: ["blockEnd"], testSuffix: "(blockEnd rule only)" },
    { rule: "all", testSuffix: "(all rules)" },
  ] as const;

  contexts.forEach(({ rule, testSuffix }) => {
    const options = { ...baseOptions, allowed: [], rule };
    const testTitle = `blockEnd rules ${delimiterText} ${testSuffix}`;

    describe(testTitle, () => {
      const markdownIt = MarkdownIt().use(attrs, options);

      it(replaceDelimiters("should add attributes when {} in end of last inline", options), () => {
        const src = "some text {with=attrs}";
        const expected = '<p with="attrs">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(
        replaceDelimiters(
          "should not add attributes when it has too many delimiters {{}}",
          options,
        ),
        () => {
          const src = "some text {{with=attrs}}";
          const expected = "<p>some text {{with=attrs}}</p>\n";

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            replaceDelimiters(expected, options),
          );
        },
      );

      it(replaceDelimiters("should add classes with {.class} dot notation", options), () => {
        const src = "some text {.green}";
        const expected = '<p class="green">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(
        replaceDelimiters(
          "should add css-modules with {..css-module} double dot notation",
          options,
        ),
        () => {
          const src = "some text {..green}";
          const expected = '<p css-module="green">some text</p>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
        },
      );

      it(replaceDelimiters("should add identifiers with {#id} hashtag notation", options), () => {
        const src = "some text {#section2}";
        const expected = '<p id="section2">some text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(
        replaceDelimiters(
          "should support classes, css-modules, identifiers and attributes in same {}",
          options,
        ),
        () => {
          const src = "some text {attr=lorem .class ..css-module #id}";
          const expected =
            '<p attr="lorem" class="class" css-module="css-module" id="id">some text</p>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
        },
      );

      it(
        replaceDelimiters('should support attributes inside " {attr="lorem ipsum"}', options),
        () => {
          const src = 'some text {attr="lorem ipsum"}';
          const expected = '<p attr="lorem ipsum">some text</p>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
        },
      );

      it(
        replaceDelimiters(
          'should add classes in same class attribute {.c1 .c2} -> class="c1 c2"',
          options,
        ),
        () => {
          const src = "some text {.c1 .c2}";
          const expected = '<p class="c1 c2">some text</p>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
        },
      );

      it(
        replaceDelimiters(
          'should add css-modules in same css-modules attribute {..c1 ..c2} -> css-module="c1 c2"',
          options,
        ),
        () => {
          const src = "some text {..c1 ..c2}";
          const expected = '<p css-module="c1 c2">some text</p>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
        },
      );

      it(
        replaceDelimiters('should add nested css-modules {..c1.c2} -> css-module="c1.c2"', options),
        () => {
          const src = "some text {..c1.c2}";
          const expected = '<p css-module="c1.c2">some text</p>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
        },
      );

      it(replaceDelimiters("should only remove last {}", options), () => {
        const src = "{{.red}";
        const expected = replaceDelimiters('<p class="red">{</p>\n', options);

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(replaceDelimiters("should not create empty attributes", options), () => {
        const src = "text { .red }";
        const expected = '<p class="red">text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(replaceDelimiters("should work with typography enabled", options), () => {
        const src = 'text {key="val with spaces"}';
        const expected = '<p key="val with spaces">text</p>\n';

        expect(markdownIt.set({ typographer: true }).render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      });

      it(replaceDelimiters("should support {} curlies with length == 3", options), () => {
        const src = "text {1}";
        const expected = '<p 1="">text</p>\n';

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(replaceDelimiters("should do nothing with empty className {.}", options), () => {
        const src = "text {.}";
        const expected = "<p>text {.}</p>\n";

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          replaceDelimiters(expected, options),
        );
      });

      it(replaceDelimiters("should do nothing with empty id {#}", options), () => {
        const src = "text {#}";
        const expected = "<p>text {#}</p>\n";

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          replaceDelimiters(expected, options),
        );
      });

      it("should restrict attributes by allowed (string)", () => {
        const markdownItWithOptions = MarkdownIt().use(attrs, {
          ...options,
          allowed: ["id", "class"],
        });

        const src = "text {.some-class #some-id attr=notAllowed}";
        const expected = '<p class="some-class" id="some-id">text</p>\n';

        expect(markdownItWithOptions.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it("should restrict attributes by allowed (regex)", () => {
        const markdownItWithOptions = MarkdownIt().use(attrs, {
          ...options,
          allowed: [/^(?:class|attr)$/],
        });

        const src = "text {.some-class #some-id attr=allowed}";
        const expected = '<p class="some-class" attr="allowed">text</p>\n';

        expect(markdownItWithOptions.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(
        replaceDelimiters(
          "should apply attributes to the innermost block in nested structures",
          options,
        ),
        () => {
          const src = "> > nested blockquote {.nested}";
          const expected =
            '<blockquote>\n<blockquote>\n<p class="nested">nested blockquote</p>\n</blockquote>\n</blockquote>\n';

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
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

describe("end of block child search", () => {
  it("should find attrs before tokens appended by heading anchor style plugins", () => {
    const markdownIt = MarkdownIt();

    headingAnchorPlugin(markdownIt);
    markdownIt.use(attrs);

    expect(markdownIt.render("## H2 heading {#my-id}")).toBe(
      '<h2 id="my-id">H2 heading <a href="#">#</a></h2>\n',
    );
  });

  it("should skip trailing whitespace-only text children", () => {
    const markdownIt = MarkdownIt();

    trailingSpacePlugin(markdownIt);
    markdownIt.use(attrs);

    expect(markdownIt.render("text {.c}")).toBe('<p class="c">text </p>\n');
  });

  it("should skip trailing top level non-text tokens", () => {
    const markdownIt = MarkdownIt({ html: true }).use(attrs);

    expect(markdownIt.render("text {.c}<br>")).toBe('<p class="c">text<br></p>\n');
  });

  it("should not search past inline code", () => {
    const markdownIt = MarkdownIt().use(attrs);

    expect(markdownIt.render("text {.c}`code`")).toBe("<p>text {.c}<code>code</code></p>\n");
  });

  it("should not search past inline math", () => {
    const markdownIt = MarkdownIt().use(attrs).use(katex);
    const markdownItWithOnlyKatex = MarkdownIt().use(katex);
    const src = "text {.c}$a$";

    expect(markdownIt.render(src)).toBe(markdownItWithOnlyKatex.render(src));
  });

  it("should stop at unmatched opening tags", () => {
    const markdownIt = MarkdownIt();

    unmatchedOpenPlugin(markdownIt);
    markdownIt.use(attrs);

    expect(markdownIt.render("text {.c}")).toBe("<p>text {.c}<a></p>\n");
  });
});
