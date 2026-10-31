import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { dl } from "../src/index.js";

type SourceMap = [number, number] | null;

const markdownIt = new MarkdownIt().use(dl);

const getDefinitionMaps = (content: string): SourceMap[] =>
  markdownIt
    .parse(content, {})
    .filter((token) => token.type === "dd_open")
    .map((token) => token.map);

describe(dl, () => {
  it("should start definition source maps at the marker line", () => {
    const testCases: [content: string, expected: [number, number][]][] = [
      // The first definition starts at its marker line
      ["Term\n: definition\n", [[1, 2]]],
      // Definitions after the first term must not start at the term line
      [
        "First\n: one\n\nSecond\n: two\n",
        [
          [1, 3],
          [4, 5],
        ],
      ],
      // Multiple definitions of one term
      [
        "Term\n: a\n: b\n",
        [
          [1, 2],
          [2, 3],
        ],
      ],
      // A blank line between a term and its marker
      [
        "First\n: one\n\nSecond\n\n: two\n",
        [
          [1, 3],
          [5, 6],
        ],
      ],
      // Definitions inside a blockquote
      [
        "> First\n> : one\n>\n> Second\n> : two\n",
        [
          [1, 3],
          [4, 5],
        ],
      ],
      // Definitions inside a list item
      [
        "- First\n  : one\n\n  Second\n  : two\n",
        [
          [1, 3],
          [4, 5],
        ],
      ],
      // Nested definition lists
      [
        "outer\n: inner1\n  : d1\n\n  inner2\n  : d2\n",
        [
          [1, 6],
          [2, 4],
          [5, 6],
        ],
      ],
    ];

    testCases.forEach(([content, expected]) => {
      expect(getDefinitionMaps(content)).toStrictEqual(expected);
    });
  });
});
