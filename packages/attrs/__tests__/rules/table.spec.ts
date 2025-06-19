import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import type { MarkdownItAttrsOptions } from "../../src/index.js";
import { attrs } from "../../src/index.js";
import { replaceDelimiters } from "../replaceDelimiters.js";

const createDualRuleTests = (
  baseOptions: MarkdownItAttrsOptions & { left: string; right: string },
  delimiterText: string,
): void => {
  const contexts = [
    { rule: ["table"], testSuffix: "(table rule only)" },
    { rule: "all", testSuffix: "(all rules)" },
  ] as const;

  contexts.forEach(({ rule, testSuffix }) => {
    const options = { ...baseOptions, allowed: [], rule };
    const testTitle = `table rules ${delimiterText} ${testSuffix}`;

    describe(testTitle, () => {
      const markdownIt = MarkdownIt().use(attrs, options);

      it(replaceDelimiters("should support tables", options), () => {
        const src = `\
| h1 | h2 |
| -- | -- |
| c1 | c1 |

{.c}`;

        const expected = `\
<table class="c">
<thead>
<tr>
<th>h1</th>
<th>h2</th>
</tr>
</thead>
<tbody>
<tr>
<td>c1</td>
<td>c1</td>
</tr>
</tbody>
</table>
`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
          expected,
        );
      });

      it(
        replaceDelimiters(
          "should apply attributes to the last column of tables",
          options,
        ),
        () => {
          const src = `\
| title | title {.title-class} |
| :---: | :---: |
| text | text {.text-class} |
| text{.text-class2} | text |

{.c}
`;
          const expected = `\
<table class="c">
<thead>
<tr>
<th style="text-align:center">title</th>
<th style="text-align:center" class="title-class">title</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:center">text</td>
<td style="text-align:center" class="text-class">text</td>
</tr>
<tr>
<td style="text-align:center" class="text-class2">text</td>
<td style="text-align:center">text</td>
</tr>
</tbody>
</table>
`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters(
          "should caculate table's colspan and/or rowspan",
          options,
        ),
        () => {
          const src = `\
| A | B | C | D |
| -- | -- | -- | -- |
| 1 | 11 | 111 | 1111 {rowspan=3} |
| 2 {colspan=2 rowspan=2} | 22 | 222 | 2222 |
| 3 | 33 | 333 | 3333 |

{border=1}

| A |
| -- |
| 1 {colspan=3}|
| 2 |
| 3 |

{border=2}

| A | B | C |
| -- | -- | -- |
| 1 {rowspan=2}| 11 | 111 |
| 2 {rowspan=2}| 22 | 222 |
| 3 | 33 | 333 |

{border=3}

| A | B | C | D |
| -- | -- | -- | -- |
| 1 {colspan=2}| 11 {colspan=3} | 111| 1111 |
| 2 {rowspan=2} | 22 {colspan=2} | 222 | 2222 |
| 3 | 33 {colspan=4} | 333 | 3333 |

{border=4}
`;

          const expected = `\
<table border="1">
<thead>
<tr>
<th>A</th>
<th>B</th>
<th>C</th>
<th>D</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>11</td>
<td>111</td>
<td rowspan="3">1111</td>
</tr>
<tr>
<td colspan="2" rowspan="2">2</td>
<td>22</td>
</tr>
<tr>
<td>3</td>
</tr>
</tbody>
</table>
<table border="2">
<thead>
<tr>
<th>A</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="3">1</td>
</tr>
<tr>
<td>2</td>
</tr>
<tr>
<td>3</td>
</tr>
</tbody>
</table>
<table border="3">
<thead>
<tr>
<th>A</th>
<th>B</th>
<th>C</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="2">1</td>
<td>11</td>
<td>111</td>
</tr>
<tr>
<td rowspan="2">2</td>
<td>22</td>
</tr>
<tr>
<td>3</td>
<td>33</td>
</tr>
</tbody>
</table>
<table border="4">
<thead>
<tr>
<th>A</th>
<th>B</th>
<th>C</th>
<th>D</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2">1</td>
<td colspan="3">11</td>
</tr>
<tr>
<td rowspan="2">2</td>
<td colspan="2">22</td>
<td>222</td>
</tr>
<tr>
<td>3</td>
<td colspan="2">33</td>
</tr>
</tbody>
</table>
`;

          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(
            expected,
          );
        },
      );

      it(
        replaceDelimiters("should support empty inline tokens", options),
        () => {
          const fn = vi.fn();
          const src = " 1 | 2 \n --|-- \n a | ";

          try {
            markdownIt.render(replaceDelimiters(src, options));
          } catch {
            fn();
          }

          expect(fn).toBeCalledTimes(0);
        },
      );

      it(
        replaceDelimiters(
          "should handle incomplete attribute syntax in table cells",
          options,
        ),
        () => {
          const src = `\
| header | header |
| --- | --- |
| cell with only left delimiter { | cell |
| cell with only right delimiter } | cell |
`;

          const expected = `\
<table>
<thead>
<tr>
<th>header</th>
<th>header</th>
</tr>
</thead>
<tbody>
<tr>
<td>cell with only left delimiter {</td>
<td>cell</td>
</tr>
<tr>
<td>cell with only right delimiter }</td>
<td>cell</td>
</tr>
</tbody>
</table>
`;

          expect(markdownIt.render(src)).toBe(expected);
        },
      );

      it(
        replaceDelimiters(
          "should not handle attribute syntax in text",
          options,
        ),
        () => {
          const src = `\
| header | header |
| --- | --- |
| cell {#id} text | cell |
| cell {.class} id | cell |
`;

          const expected = `\
<table>
<thead>
<tr>
<th>header</th>
<th>header</th>
</tr>
</thead>
<tbody>
<tr>
<td>cell {#id} text</td>
<td>cell</td>
</tr>
<tr>
<td>cell {.class} id</td>
<td>cell</td>
</tr>
</tbody>
</table>
`;

          expect(markdownIt.render(src)).toBe(expected);
        },
      );
    });
  });
};

createDualRuleTests(
  {
    left: "{",
    right: "}",
  },
  "with { } delimiters",
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
