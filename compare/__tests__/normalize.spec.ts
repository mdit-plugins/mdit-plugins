import { describe, expect, it } from "vitest";

import {
  collapseWhitespace,
  composeNormalizers,
  normalizeHtml,
  removeMatches,
  replaceMatches,
  sortAttributes,
} from "../normalize.ts";

describe("html normalization", () => {
  it("sorts attributes alphabetically", () => {
    expect(normalizeHtml('<p class="a" id="b">text</p>')).toBe('<p class="a" id="b">text</p>');
    expect(normalizeHtml('<p id="b" class="a">text</p>')).toBe('<p class="a" id="b">text</p>');
  });

  it("keeps attribute values with spaces untouched", () => {
    expect(normalizeHtml('<p title="a b" class="c">x</p>')).toBe('<p class="c" title="a b">x</p>');
  });

  it("keeps boolean attributes", () => {
    expect(normalizeHtml("<input disabled checked>")).toBe("<input checked disabled>");
  });

  it("keeps self-closing tags", () => {
    expect(normalizeHtml('<img src="a.png" alt="a" />')).toBe('<img alt="a" src="a.png" />');
  });

  it("does not touch text content", () => {
    expect(normalizeHtml("plain <b>text</b> here")).toBe("plain <b>text</b> here");
  });

  it("keeps whitespace because it is meaningful in code blocks", () => {
    expect(normalizeHtml("<pre><code>a\n  b</code></pre>")).toBe("<pre><code>a\n  b</code></pre>");
  });
});

describe("attribute sorting", () => {
  it("sorts multiple tags", () => {
    expect(sortAttributes('<p b="1" a="2"></p><span d="4" c="3"></span>')).toBe(
      '<p a="2" b="1"></p><span c="3" d="4"></span>',
    );
  });

  it("does not treat escaped HTML as tags", () => {
    expect(sortAttributes("&lt;div b=&quot;1&quot;&gt;")).toBe("&lt;div b=&quot;1&quot;&gt;");
  });
});

describe("whitespace collapsing", () => {
  it("collapses runs of whitespace", () => {
    expect(collapseWhitespace("  a\n\n b\t c  ")).toBe("a b c");
  });
});

describe("match removal", () => {
  it("removes matches", () => {
    expect(removeMatches("<p>a</p><p>b</p>", /<p>|<\/p>/gu)).toBe("ab");
  });
});

describe("match replacement", () => {
  it("replaces matches", () => {
    expect(replaceMatches('<p id="x-1">a</p>', /x-\d+/gu, "x")).toBe('<p id="x">a</p>');
  });
});

describe("normalizer composition", () => {
  it("applies steps from left to right", () => {
    expect(composeNormalizers(collapseWhitespace, normalizeHtml)('  <p b="1" a="2">x</p> ')).toBe(
      '<p a="2" b="1">x</p>',
    );
  });
});
