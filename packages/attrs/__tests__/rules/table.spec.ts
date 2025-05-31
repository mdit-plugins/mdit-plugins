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
