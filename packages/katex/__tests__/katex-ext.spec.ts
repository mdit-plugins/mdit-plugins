import MarkdownIt from "markdown-it";
import { expect, it } from "vitest";

import { katex } from "../src/index.js";
import "../src/mhchem.js";

const markdownIt = MarkdownIt({ linkify: true }).use(katex);

it("should work with mhchem", () => {
  const result = markdownIt.render(`$$\\ce{H2O}$$`);

  expect(result).toMatchSnapshot();
});
