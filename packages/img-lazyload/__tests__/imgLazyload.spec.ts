import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { imgLazyload } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(imgLazyload);

describe(imgLazyload, () => {
  it("should have loading=lazy attribute", () => {
    expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" loading="lazy"></p>\n',
    );
  });
});
