import MarkdownIt from "markdown-it";
import { expect, it } from "vitest";

import { ruby } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(ruby);

it("should render", () => {
  const tests: [content: string, expected: string][] = [
    [
      `{ruby base:ruby text}`,
      `<p><ruby>ruby base<rt>ruby text</rt></ruby></p>\n`,
    ],
    [
      `{鬼:き}{門:もん}の{方:ほう}{角:がく}を{凝:ぎょう}{視:し}する。`,
      `<p><ruby>鬼<rt>き</rt></ruby><ruby>門<rt>もん</rt></ruby>の<ruby>方<rt>ほう</rt></ruby><ruby>角<rt>がく</rt></ruby>を<ruby>凝<rt>ぎょう</rt></ruby><ruby>視<rt>し</rt></ruby>する。</p>\n`,
    ],
    [
      `{鬼門:き|もん}の{方角:ほう|がく}を{凝視:ぎょう|し}する。`,
      `<p><ruby>鬼<rt>き</rt>門<rt>もん</rt></ruby>の<ruby>方<rt>ほう</rt>角<rt>がく</rt></ruby>を<ruby>凝<rt>ぎょう</rt>視<rt>し</rt></ruby>する。</p>\n`,
    ],
    [`{編集者:editor}`, `<p><ruby>編集者<rt>editor</rt></ruby></p>\n`],
    [`{editor:エディター}`, `<p><ruby>editor<rt>エディター</rt></ruby></p>\n`],
  ];

  tests.forEach(([content, expected]) => {
    expect(markdownIt.render(content)).toEqual(expected);
  });
});

it("should work with other gramma", () => {
  const tests: [content: string, expected: string][] = [
    [
      `**{ruby base:ruby text}**`,
      `<p><strong><ruby>ruby base<rt>ruby text</rt></ruby></strong></p>\n`,
    ],
    [
      `{**ruby base**:ruby text}`,
      `<p><ruby><strong>ruby base</strong><rt>ruby text</rt></ruby></p>\n`,
    ],
    [
      `{ruby base:**ruby text**}`,
      `<p><ruby>ruby base<rt><strong>ruby text</strong></rt></ruby></p>\n`,
    ],
    [
      `[{ruby base:ruby text}](http://example.com)`,
      `<p><a href="http://example.com"><ruby>ruby base<rt>ruby text</rt></ruby></a></p>\n`,
    ],
    [
      `{[ruby base](//example.com):ruby text}`,
      `<p><ruby><a href="//example.com">ruby base</a><rt>ruby text</rt></ruby></p>\n`,
    ],
    [
      `{ruby base:[ruby text](http://example.com)}`,
      `<p><ruby>ruby base<rt><a href="http://example.com">ruby text</a></rt></ruby></p>\n`,
    ],
  ];

  tests.forEach(([content, expected]) => {
    expect(markdownIt.render(content)).toEqual(expected);
  });
});

it("do not break text", () => {
  expect(markdownIt.render(`Lore ipsum.`)).toEqual(`<p>Lore ipsum.</p>\n`);
});

it("should not parse", () => {
  const tests: [content: string, expected: string][] = [
    [`\\{ruby base:ruby text}`, `<p>{ruby base:ruby text}</p>\n`],
    [`{ruby base\\:ruby text}`, `<p>{ruby base:ruby text}</p>\n`],
    [`{ruby base|ruby text\\}`, `<p>{ruby base|ruby text}</p>\n`],
  ];

  tests.forEach(([content, expected]) => {
    expect(markdownIt.render(content)).toEqual(expected);
  });
});
