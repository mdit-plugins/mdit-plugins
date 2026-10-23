import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { imgLazyload } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(imgLazyload);

describe(imgLazyload, () => {
  it("should have loading=lazy attribute", () => {
    expect(markdownIt.render(`![image](/logo.svg)`)).toBe(
      '<p><img src="/logo.svg" alt="image" loading="lazy"></p>\n',
    );
  });

  it("should add the attribute to every image", () => {
    expect(markdownIt.render(`![a](/a.svg)\n\n![b](/b.svg)`)).toBe(
      '<p><img src="/a.svg" alt="a" loading="lazy"></p>\n' +
        '<p><img src="/b.svg" alt="b" loading="lazy"></p>\n',
    );
  });

  it("should keep other image attributes", () => {
    expect(markdownIt.render(`![image](/logo.svg "title")`)).toBe(
      '<p><img src="/logo.svg" alt="image" title="title" loading="lazy"></p>\n',
    );
  });

  it("should work with images inside containers", () => {
    expect(markdownIt.render(`> ![image](/logo.svg)`)).toBe(
      '<blockquote>\n<p><img src="/logo.svg" alt="image" loading="lazy"></p>\n</blockquote>\n',
    );
  });
});
