import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItInstance } from "markdown-it";
import { describe, expect, it } from "vitest";

import { demo } from "../src/index.js";

const markdownIt = new MarkdownIt().use(demo);

const getCodeContent = (md: MarkdownItInstance, source: string): string | undefined =>
  md.parse(source, {}).find((token) => token.type === "fence")?.content;

// markdown-it normalizes `\r\n` / `\r` before block parsing. Disabling that normalization pins
// the raw `\n\r` handling inherited from the original split on `/\n\r?/`.
const createRawDemoMarkdownIt = (): MarkdownItInstance => {
  const rawMarkdownIt = new MarkdownIt().use(demo);

  rawMarkdownIt.core.ruler.disable("normalize");

  return rawMarkdownIt;
};

describe("demo code content", () => {
  it("should dedent a list-indented demo and strip its include markers", () => {
    const source = `\
- list item

  ::: demo Title
  <!-- #include-env-start:abc: /some/dir -->
  included line
  <!-- #include-env-end:abc -->
  kept line
  :::
`;

    expect(getCodeContent(markdownIt, source)).toBe("included line\nkept line\n");
  });

  it("should trim leading and trailing blank lines from the code", () => {
    expect(getCodeContent(markdownIt, "::: demo\n\n\n  first\n\n  second\n\n\n:::\n")).toBe(
      "  first\n\n  second\n",
    );
  });

  it("should produce a single newline for an empty code block", () => {
    expect(getCodeContent(markdownIt, "::: demo\n:::\n")).toBe("\n");
    expect(getCodeContent(markdownIt, "::: demo\n\n:::\n")).toBe("\n");
    expect(getCodeContent(markdownIt, "::: demo\n  <!-- #include-env-end -->\n:::\n")).toBe("\n");
  });

  it("should dedent each line independently", () => {
    expect(getCodeContent(markdownIt, "  ::: demo\n    x\n   y\n  z\n  :::\n")).toBe(
      "  x\n y\nz\n",
    );
  });

  describe("raw line breaks", () => {
    it("should skip an LFCR line break after the opening marker", () => {
      expect(getCodeContent(createRawDemoMarkdownIt(), "::: demo\n\rfirst line\n:::\n")).toBe(
        "first line\n",
      );
    });

    it("should skip LFCR line breaks between content lines", () => {
      expect(getCodeContent(createRawDemoMarkdownIt(), "::: demo\nfirst\n\rsecond\n:::\n")).toBe(
        "first\nsecond\n",
      );
    });

    it("should strip include markers in raw content", () => {
      expect(
        getCodeContent(
          createRawDemoMarkdownIt(),
          "::: demo\n\r<!-- #include-env-end -->\n\rkept\n:::\n",
        ),
      ).toBe("kept\n");
    });
  });
});
