import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { katex } from "../dist/index.js";
// oxlint-disable-next-line import/no-unassigned-import
import "../dist/mhchem.js";

const markdownIt = MarkdownIt({ linkify: true }).use(katex);

describe("extensions", () => {
  it("should work with mhchem", () => {
    const result = markdownIt.render(`$$\\ce{H2O}$$`);

    expect(result).toMatchSnapshot();
  });
});
