import MarkdownIt from "markdown-it";
import { expect, it } from "vitest";

import { imgLazyload } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(imgLazyload);

it("should render", () => {
  expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
    '<p><img src="/logo.svg" alt="image" loading="lazy"></p>\n',
  );
});
