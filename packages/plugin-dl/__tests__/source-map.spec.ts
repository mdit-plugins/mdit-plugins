import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { dl } from "../src/index.js";

type SourceMap = [number, number] | null;

interface TermMaps {
  dt: SourceMap;
  inline: SourceMap;
}

const markdownIt = new MarkdownIt().use(dl);

const getTermMaps = (content: string): TermMaps[] => {
  const tokens = markdownIt.parse(content, {});
  const termMaps: TermMaps[] = [];

  tokens.forEach((token, index) => {
    if (token.type === "dt_open") termMaps.push({ dt: token.map, inline: tokens[index + 1].map });
  });

  return termMaps;
};

describe(dl, () => {
  it("should map definition terms to their complete source lines", () => {
    const testCases: [content: string, expected: [number, number][]][] = [
      // A single term
      ["Term\n: definition\n", [[0, 1]]],
      // Multiple terms separated by blank lines
      [
        "First\n: one\n\nSecond\n: two\n",
        [
          [0, 1],
          [3, 4],
        ],
      ],
      // A term inside a blockquote
      ["> Term\n> : definition\n", [[0, 1]]],
      // A term after another block
      ["Paragraph\n\nTerm\n: definition\n", [[2, 3]]],
    ];

    testCases.forEach(([content, expected]) => {
      const termMaps = getTermMaps(content);

      // `dt_open` covers one source line, using the exclusive end like a paragraph
      expect(termMaps.map(({ dt }) => dt)).toStrictEqual(expected);
      // The term's inline token spans the same source range
      expect(termMaps.map(({ inline }) => inline)).toStrictEqual(expected);
    });
  });

  it("should use the same exclusive source range as a one-line paragraph", () => {
    const term = markdownIt
      .parse("Term\n: definition\n", {})
      .find((token) => token.type === "dt_open");
    const [paragraph] = markdownIt.parse("Term\n", {});

    expect(term).toBeDefined();
    expect(term?.map).toStrictEqual(paragraph.map);
  });
});
