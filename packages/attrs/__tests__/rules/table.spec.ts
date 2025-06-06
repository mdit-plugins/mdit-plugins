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
          let src = "| title | title {.title-primar} |\n";

          src += "| :---: | :---: |\n";
          src += "| text | text {.text-primar} |\n";
          src += "| text {.text-primary} | text |\n";
          src += "\n";
          src += "{.c}";

          let expected = '<table class="c">\n';

          expected += "<thead>\n";
          expected += "<tr>\n";
          expected += '<th style="text-align:center">title</th>\n';
          expected +=
            '<th style="text-align:center" class="title-primar">title</th>\n';
          expected += "</tr>\n";
          expected += "</thead>\n";
          expected += "<tbody>\n";
          expected += "<tr>\n";
          expected += '<td style="text-align:center">text</td>\n';
          expected +=
            '<td style="text-align:center" class="text-primar">text</td>\n';
          expected += "</tr>\n";
          expected += "<tr>\n";
          expected +=
            '<td style="text-align:center" class="text-primary">text</td>\n';
          expected += '<td style="text-align:center">text</td>\n';
          expected += "</tr>\n";
          expected += "</tbody>\n";
          expected += "</table>\n";

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
          let src = "| A | B | C | D |\n";

          src += "| -- | -- | -- | -- |\n";
          src += "| 1 | 11 | 111 | 1111 {rowspan=3} |\n";
          src += "| 2 {colspan=2 rowspan=2} | 22 | 222 | 2222 |\n";
          src += "| 3 | 33 | 333 | 3333 |\n";
          src += "\n";
          src += "{border=1}\n";
          src += "| A |\n";
          src += "| -- |\n";
          src += "| 1 {colspan=3}|\n";
          src += "| 2 |\n";
          src += "| 3 |\n";
          src += "\n";
          src += "{border=2}\n";
          src += "| A | B | C |\n";
          src += "| -- | -- | -- |\n";
          src += "| 1 {rowspan=2}| 11 | 111 |\n";
          src += "| 2 {rowspan=2}| 22 | 222 |\n";
          src += "| 3 | 33 | 333 |\n";
          src += "\n";
          src += "{border=3}\n";
          src += "| A | B | C | D |\n";
          src += "| -- | -- | -- | -- |\n";
          src += "| 1 {colspan=2}| 11 {colspan=3} | 111| 1111 |\n";
          src += "| 2 {rowspan=2} | 22 {colspan=2} | 222 | 2222 |\n";
          src += "| 3 | 33 {colspan=4} | 333 | 3333 |\n";
          src += "\n";
          src += "{border=4}";

          let expected = '<table border="1">\n';

          expected += "<thead>\n";
          expected += "<tr>\n";
          expected += "<th>A</th>\n";
          expected += "<th>B</th>\n";
          expected += "<th>C</th>\n";
          expected += "<th>D</th>\n";
          expected += "</tr>\n";
          expected += "</thead>\n";
          expected += "<tbody>\n";
          expected += "<tr>\n";
          expected += "<td>1</td>\n";
          expected += "<td>11</td>\n";
          expected += "<td>111</td>\n";
          expected += '<td rowspan="3">1111</td>\n';
          expected += "</tr>\n";
          expected += "<tr>\n";
          expected += '<td colspan="2" rowspan="2">2</td>\n';
          expected += "<td>22</td>\n";
          expected += "</tr>\n";
          expected += "<tr>\n";
          expected += "<td>3</td>\n";
          expected += "</tr>\n";
          expected += "</tbody>\n";
          expected += "</table>\n";
          expected += '<table border="2">\n';
          expected += "<thead>\n";
          expected += "<tr>\n";
          expected += "<th>A</th>\n";
          expected += "</tr>\n";
          expected += "</thead>\n";
          expected += "<tbody>\n";
          expected += "<tr>\n";
          expected += '<td colspan="3">1</td>\n';
          expected += "</tr>\n";
          expected += "<tr>\n";
          expected += "<td>2</td>\n";
          expected += "</tr>\n";
          expected += "<tr>\n";
          expected += "<td>3</td>\n";
          expected += "</tr>\n";
          expected += "</tbody>\n";
          expected += "</table>\n";
          expected += '<table border="3">\n';
          expected += "<thead>\n";
          expected += "<tr>\n";
          expected += "<th>A</th>\n";
          expected += "<th>B</th>\n";
          expected += "<th>C</th>\n";
          expected += "</tr>\n";
          expected += "</thead>\n";
          expected += "<tbody>\n";
          expected += "<tr>\n";
          expected += '<td rowspan="2">1</td>\n';
          expected += "<td>11</td>\n";
          expected += "<td>111</td>\n";
          expected += "</tr>\n";
          expected += "<tr>\n";
          expected += '<td rowspan="2">2</td>\n';
          expected += "<td>22</td>\n";
          expected += "</tr>\n";
          expected += "<tr>\n";
          expected += "<td>3</td>\n";
          expected += "<td>33</td>\n";
          expected += "</tr>\n";
          expected += "</tbody>\n";
          expected += "</table>\n";
          expected += '<table border="4">\n';
          expected += "<thead>\n";
          expected += "<tr>\n";
          expected += "<th>A</th>\n";
          expected += "<th>B</th>\n";
          expected += "<th>C</th>\n";
          expected += "<th>D</th>\n";
          expected += "</tr>\n";
          expected += "</thead>\n";
          expected += "<tbody>\n";
          expected += "<tr>\n";
          expected += '<td colspan="2">1</td>\n';
          expected += '<td colspan="3">11</td>\n';
          expected += "</tr>\n";
          expected += "<tr>\n";
          expected += '<td rowspan="2">2</td>\n';
          expected += '<td colspan="2">22</td>\n';
          expected += "<td>222</td>\n";
          expected += "</tr>\n";
          expected += "<tr>\n";
          expected += "<td>3</td>\n";
          expected += '<td colspan="2">33</td>\n';
          expected += "</tr>\n";
          expected += "</tbody>\n";
          expected += "</table>\n";

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
