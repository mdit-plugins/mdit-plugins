import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { imgLazyload } from "../src/index.js";

describe("Img lazyLoad", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(imgLazyload);

  it("Should render", () => {
    expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" loading="lazy"></p>\n',
    );
  });
});
