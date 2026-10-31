import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance, Token } from "markdown-it";
import { describe, expect, it } from "vitest";

import { alert } from "../../plugin-alert/src/index.js";
import { container } from "../../plugin-container/src/index.js";
import { demo } from "../../plugin-demo/src/index.js";
import { embed } from "../../plugin-embed/src/index.js";
import { field } from "../../plugin-field/src/index.js";
import { layout } from "../../plugin-layout/src/index.js";
import { tab } from "../../plugin-tab/src/index.js";
import { tex } from "../../plugin-tex/src/index.js";
import { uml } from "../../plugin-uml/src/index.js";
import { dl } from "../src/index.js";

type SourceMap = [start: number, end: number];

interface AuditCase {
  name: string;
  md: MarkdownItInstance;
  markdown: string;
  /** Non-null token source maps, in token order. */
  expected: [type: string, map: SourceMap][];
}

/**
 * Verify the generic source map invariants markdown-it tokens are expected to follow:
 *
 * - A map stays inside the document and never inverts its bounds;
 * - A token with inline content covers at least one source line, so `start <= line && line < end` can
 *   associate a line with it (zero-width maps are never matchable);
 * - An inline token shares the source range of its parent block, like markdown-it's built-in
 *   paragraph / heading tokens and the definition list term tokens in this repository do.
 *
 * @param tokens - Parsed tokens / 解析后的 token 列表
 * @param lineCount - Number of source lines / 源码行数
 * @returns Human readable violations / 违规说明
 */
const getMapIssues = (tokens: Token[], lineCount: number): string[] => {
  const issues: string[] = [];

  tokens.forEach((token, index) => {
    const { map } = token;

    if (!map) return;

    if (map[0] < 0 || map[1] < map[0] || map[1] > lineCount)
      issues.push(`${token.type}: invalid map ${JSON.stringify(map)}`);

    if (token.content.trim() !== "" && map[0] === map[1])
      issues.push(`${token.type}: zero-width map ${JSON.stringify(map)} for non-empty content`);

    if (token.type === "inline") {
      const parent = tokens[index - 1];

      if (
        parent?.map &&
        !parent.hidden &&
        parent.block &&
        parent.nesting === 1 &&
        (parent.map[0] !== map[0] || parent.map[1] !== map[1])
      ) {
        issues.push(
          `${token.type}: map ${JSON.stringify(map)} differs from parent ${parent.type} ${JSON.stringify(parent.map)}`,
        );
      }
    }
  });

  return issues;
};

const getMaps = (tokens: Token[]): [string, SourceMap][] => {
  const maps: [string, SourceMap][] = [];

  tokens.forEach((token) => {
    const { map } = token;

    if (map) maps.push([token.type, map]);
  });

  return maps;
};

// Only plugins that derive token maps from parsed block positions are audited here.
// `advanced-links` asserts its map in its own tests, while `snippet` / `include` need filesystem
// fixtures and are covered by their package tests instead.
const cases: AuditCase[] = [
  {
    name: "alert",
    md: new MarkdownIt().use(alert),
    markdown: "> [!warning]\n> This is warning text\n",
    expected: [
      ["alert_open", [1, 2]],
      ["alert_title", [0, 1]],
      ["paragraph_open", [1, 2]],
      ["inline", [1, 2]],
    ],
  },
  {
    name: "container",
    md: new MarkdownIt().use(container, { name: "warning" }),
    markdown: "::: warning\n_here be dragons_\n:::\n",
    expected: [
      ["container_warning_open", [0, 2]],
      ["paragraph_open", [1, 2]],
      ["inline", [1, 2]],
    ],
  },
  {
    name: "container (auto closed)",
    md: new MarkdownIt().use(container, { name: "warning" }),
    markdown: "::: warning\ncontent\n",
    expected: [
      ["container_warning_open", [0, 2]],
      ["paragraph_open", [1, 2]],
      ["inline", [1, 2]],
    ],
  },
  {
    name: "alert (multiple paragraphs)",
    md: new MarkdownIt().use(alert),
    markdown: "> [!warning]\n> first paragraph\n>\n> second paragraph\n",
    expected: [
      ["alert_open", [1, 4]],
      ["alert_title", [0, 1]],
      ["paragraph_open", [1, 2]],
      ["inline", [1, 2]],
      ["paragraph_open", [3, 4]],
      ["inline", [3, 4]],
    ],
  },
  {
    name: "demo",
    md: new MarkdownIt().use(demo),
    markdown: "::: demo\n# Heading\nText\n:::\n",
    expected: [
      ["demo_demo_open", [0, 3]],
      ["heading_open", [1, 2]],
      ["inline", [1, 2]],
      ["paragraph_open", [2, 3]],
      ["inline", [2, 3]],
      ["fence", [1, 3]],
    ],
  },
  {
    name: "demo (empty body)",
    md: new MarkdownIt().use(demo),
    markdown: "::: demo\n:::\n",
    // An empty body has no content lines, so the synthetic code token keeps an empty range.
    expected: [
      ["demo_demo_open", [0, 1]],
      ["fence", [1, 1]],
    ],
  },
  {
    name: "embed",
    md: new MarkdownIt().use(embed, {
      config: [{ name: "youtube", setup: (id: string): string => id }],
    }),
    markdown: "{% youtube abc123 %}\n",
    expected: [["embed_block", [0, 1]]],
  },
  {
    name: "dl",
    md: new MarkdownIt().use(dl),
    markdown: "First\n: one\n\nSecond\n: two\n",
    // The term and its inline token use the exclusive end (they used to be `[line, line]`), and a
    // later term's definition starts at its marker line (it used to start at the term line).
    expected: [
      ["dl_open", [0, 5]],
      ["dt_open", [0, 1]],
      ["inline", [0, 1]],
      ["dd_open", [1, 3]],
      ["paragraph_open", [1, 2]],
      ["inline", [1, 2]],
      ["dt_open", [3, 4]],
      ["inline", [3, 4]],
      ["dd_open", [4, 5]],
      ["paragraph_open", [4, 5]],
      ["inline", [4, 5]],
    ],
  },
  {
    name: "dl (multiple definitions)",
    md: new MarkdownIt().use(dl),
    markdown: "Term\n: a\n: b\n",
    expected: [
      ["dl_open", [0, 3]],
      ["dt_open", [0, 1]],
      ["inline", [0, 1]],
      ["dd_open", [1, 2]],
      ["paragraph_open", [1, 2]],
      ["inline", [1, 2]],
      ["dd_open", [2, 3]],
      ["paragraph_open", [2, 3]],
      ["inline", [2, 3]],
    ],
  },
  {
    name: "field",
    md: new MarkdownIt().use(field),
    markdown: '::: fields\n@`prop1` type="string" required\nDescription 1\n:::\n',
    expected: [
      ["fields_fields_open", [0, 4]],
      ["fields_field_open", [1, 3]],
      ["paragraph_open", [2, 3]],
      ["inline", [2, 3]],
    ],
  },
  {
    name: "layout",
    md: new MarkdownIt().use(layout),
    markdown: "@flexs\n@flex\none\n@flex\ntwo\n@end\n",
    expected: [
      ["layout_container_open", [0, 6]],
      ["layout_item_open", [1, 3]],
      ["paragraph_open", [2, 3]],
      ["inline", [2, 3]],
      ["layout_item_open", [3, 5]],
      ["paragraph_open", [4, 5]],
      ["inline", [4, 5]],
    ],
  },
  {
    name: "tab",
    md: new MarkdownIt().use(tab),
    markdown: "::: tabs\n@tab test1\n\nA text 1.\n\n@tab test2\n\nA text 2.\n:::\n",
    expected: [
      ["tabs_tabs_open", [0, 8]],
      ["tabs_tab_open", [1, 5]],
      ["paragraph_open", [3, 4]],
      ["inline", [3, 4]],
      ["tabs_tab_open", [5, 8]],
      ["paragraph_open", [7, 8]],
      ["inline", [7, 8]],
    ],
  },
  {
    name: "tex (multiple lines)",
    md: new MarkdownIt().use(tex, { render: (content: string): string => content }),
    markdown: "$$\nxxx\n$$\n",
    expected: [["math_block", [0, 3]]],
  },
  {
    name: "tex (single line)",
    md: new MarkdownIt().use(tex, { render: (content: string): string => content }),
    markdown: "$$xxx$$\n",
    expected: [["math_block", [0, 1]]],
  },
  {
    name: "tex (bracket syntax)",
    md: new MarkdownIt().use(tex, {
      delimiters: "brackets",
      render: (content: string): string => content,
    }),
    markdown: "\\[\nxxx\n\\]\n",
    expected: [["math_block", [0, 3]]],
  },
  {
    name: "uml (multiple lines)",
    md: new MarkdownIt().use(uml),
    markdown: "@start\nContent\nAnother content\n@end\n",
    expected: [["uml", [0, 3]]],
  },
  {
    name: "uml (single line)",
    md: new MarkdownIt().use(uml),
    markdown: "@start\n@end\n",
    expected: [["uml", [0, 1]]],
  },
];

describe("token source map audit", () => {
  it.each(cases)("$name", ({ md, markdown, expected }) => {
    const tokens = md.parse(markdown, {});
    const lineCount = markdown.replace(/\n$/, "").split("\n").length;

    expect(getMapIssues(tokens, lineCount)).toStrictEqual([]);
    expect(getMaps(tokens)).toStrictEqual(expected);
  });
});
