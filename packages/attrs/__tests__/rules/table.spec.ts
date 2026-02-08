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
| header1 | header2 |
| ------- | ------- |
| cell1   | cell2   |


{.class}`;

        const expected = `\
<table class="class">
<thead>
<tr>
<th>header1</th>
<th>header2</th>
</tr>
</thead>
<tbody>
<tr>
<td>cell1</td>
<td>cell2</td>
</tr>
</tbody>
</table>
`;

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(replaceDelimiters("should apply attributes to the last column of tables", options), () => {
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

        expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
      });

      it(replaceDelimiters("should calculate table's colspan and/or rowspan", options), () => {
        const testCases = [
          // colspan should work together with rowspan
          // the merged cells should be correctly removed
          [
            `\
| A                        | B   | C   | D              |
| ------------------------ | --- | --- | -------------- |
| A1                       | B1  | C1  | D1 {rowspan=3} |
| A2 {colspan=2 rowspan=2} | B2  | C2  | D2             |
| A3                       | B3  | C3  | D3             |
`,
            `\
<table>
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
<td>A1</td>
<td>B1</td>
<td>C1</td>
<td rowspan="3">D1</td>
</tr>
<tr>
<td colspan="2" rowspan="2">A2</td>
<td>C2</td>
</tr>
<tr>
<td>C3</td>
</tr>
</tbody>
</table>
`,
          ],
          // colspan overflow should be handled
          [
            `\
| A | B |
|---|---|
| 1 {colspan=3} |
`,
            `\
<table>
<thead>
<tr>
<th>A</th>
<th>B</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2">1</td>
</tr>
</tbody>
</table>
`,
          ],
          // colspan should be reduced if it hits occupied columns
          [
            `\
| A | B | C |
|---|---|---|
| A1 | B1 {rowspan=2} | C1 |
| A2 {colspan=2} | B2 |
`,
            `\
<table>
<thead>
<tr>
<th>A</th>
<th>B</th>
<th>C</th>
</tr>
</thead>
<tbody>
<tr>
<td>A1</td>
<td rowspan="2">B1</td>
<td>C1</td>
</tr>
<tr>
<td colspan="1">A2</td>
<td></td>
</tr>
</tbody>
</table>
`,
          ],
          // colspan should work even out of borders
          [
            `\
| A             |
| ------------- |
| 1 {colspan=3} |
| 2             |
| 3             |

| B             |
| ------------- |
| 1             |
| 2             |
| 3 {colspan=3} |
`,
            `\
<table>
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
<table>
<thead>
<tr>
<th>B</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
</tr>
<tr>
<td>2</td>
</tr>
<tr>
<td colspan="3">3</td>
</tr>
</tbody>
</table>
`,
          ],
          // row should work even out of borders
          [
            `\
| A   | B              |
| --- | -------------- |
| A1  | B1             |
| A2  | B2 {rowspan=2} |

`,
            `\
<table>
<thead>
<tr>
<th>A</th>
<th>B</th>
</tr>
</thead>
<tbody>
<tr>
<td>A1</td>
<td>B1</td>
</tr>
<tr>
<td>A2</td>
<td rowspan="2">B2</td>
</tr>
</tbody>
</table>
`,
          ],
          // should work with multiple rowspan
          [
            `\
| A              | B              | C   |
| -------------- | -------------- | --- |
| A1 {rowspan=2} | B1             | C1  |
| A2             | B2 {rowspan=2} | C2  |
| A3             | B3             | C3  |

`,
            `\
<table>
<thead>
<tr>
<th>A</th>
<th>B</th>
<th>C</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="2">A1</td>
<td>B1</td>
<td>C1</td>
</tr>
<tr>
<td rowspan="2">B2</td>
<td>C2</td>
</tr>
<tr>
<td>A3</td>
<td>C3</td>
</tr>
</tbody>
</table>
`,
          ],
          // should work with multiple colspan
          [
            `\
| A              | B              | C   |
| -------------- | -------------- | --- |
| A1 {colspan=2} | B1             | C1  |
| A2             | B2 {colspan=2} | C2  |
| A3             | B3             | C3  |

`,
            `\
<table>
<thead>
<tr>
<th>A</th>
<th>B</th>
<th>C</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2">A1</td>
<td>C1</td>
</tr>
<tr>
<td>A2</td>
<td colspan="2">B2</td>
</tr>
<tr>
<td>A3</td>
<td>B3</td>
<td>C3</td>
</tr>
</tbody>
</table>
`,
          ],
          // should not handle dropped cells attributes
          [
            `\
| A                        | B   | C   | D              |
| ------------------------ | --- | --- | -------------- |
| A1                       | B1  | C1  | D1 {rowspan=3} |
| A2 {colspan=2 rowspan=2} | B2  | C2  | D2 {rowspan=2} |
| A3 {colspan=2}           | B3  | C3  | D3             |
`,
            `\
<table>
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
<td>A1</td>
<td>B1</td>
<td>C1</td>
<td rowspan="3">D1</td>
</tr>
<tr>
<td colspan="2" rowspan="2">A2</td>
<td>C2</td>
</tr>
<tr>
<td>C3</td>
</tr>
</tbody>
</table>
`,
          ],
          // handle colspan collision with rowspan
          [
            `\
| A              | B              | C   |
| -------------- | -------------- | --- |
| A1             | B1 {rowspan=2} | C1  |
| A2 {colspan=3} |
`,
            `\
<table>
<thead>
<tr>
<th>A</th>
<th>B</th>
<th>C</th>
</tr>
</thead>
<tbody>
<tr>
<td>A1</td>
<td rowspan="2">B1</td>
<td>C1</td>
</tr>
<tr>
<td colspan="1">A2</td>
<td></td>
</tr>
</tbody>
</table>
`,
          ],
        ];

        testCases.forEach(([src, expected]) => {
          expect(markdownIt.render(replaceDelimiters(src, options))).toBe(expected);
        });
      });

      it(replaceDelimiters("should support empty inline tokens", options), () => {
        const fn = vi.fn();
        const src = " 1 | 2 \n --|-- \n a | ";

        try {
          markdownIt.render(replaceDelimiters(src, options));
        } catch {
          fn();
        }

        expect(fn).toBeCalledTimes(0);
      });

      it(
        replaceDelimiters("should handle incomplete attribute syntax in table cells", options),
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

      it(replaceDelimiters("should not handle attribute syntax in text", options), () => {
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
      });
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
