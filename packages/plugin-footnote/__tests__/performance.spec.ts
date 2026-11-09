import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { footnote } from "../src/index.js";

type MarkdownItInstance = InstanceType<typeof MarkdownIt>;

const renderReferences = (markdownIt: MarkdownItInstance, count: number): number => {
  const source = `${"[^a] ".repeat(count)}\n\n[^a]: note`;
  const start = performance.now();

  markdownIt.render(source);

  return performance.now() - start;
};

const fastestOf = (markdownIt: MarkdownItInstance, count: number): number => {
  let fastest = Infinity;

  for (let run = 0; run < 3; run++)
    fastest = Math.min(fastest, renderReferences(markdownIt, count));

  return fastest;
};

describe("footnote reference scaling", () => {
  it("should replace references in linear time", () => {
    const markdownIt = new MarkdownIt().use(footnote);

    // Warm up the parser/renderer before comparing sizes.
    renderReferences(markdownIt, 1000);
    renderReferences(markdownIt, 4000);

    const small = fastestOf(markdownIt, 4000);
    const large = fastestOf(markdownIt, 16_000);

    // A quadratic replacement would grow roughly 16x for a 4x input; linear growth stays near 4x.
    expect(large / small).toBeLessThan(10);
  });
});
