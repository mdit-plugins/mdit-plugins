import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { imgMark } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(imgMark);
const markdownItWithCustomOptions = MarkdownIt({ linkify: true }).use(imgMark, {
  light: ["lightmode"],
  dark: ["darkmode"],
});

describe(imgMark, () => {
  it("should render", () => {
    expect(markdownIt.render(`![image](/logo.svg)`)).toBe(
      '<p><img src="/logo.svg" alt="image"></p>\n',
    );

    expect(markdownIt.render(`![image](/logo.svg#light)`)).toBe(
      '<p><img src="/logo.svg" alt="image" data-mode="lightmode-only"></p>\n',
    );
    expect(markdownIt.render(`![image](/logo.svg#dark)`)).toBe(
      '<p><img src="/logo.svg" alt="image" data-mode="darkmode-only"></p>\n',
    );
  });

  it("should support options", () => {
    expect(markdownItWithCustomOptions.render(`![image](/logo.svg#lightmode)`)).toBe(
      '<p><img src="/logo.svg" alt="image" data-mode="lightmode-only"></p>\n',
    );

    expect(markdownItWithCustomOptions.render(`![image](/logo.svg#darkmode)`)).toBe(
      '<p><img src="/logo.svg" alt="image" data-mode="darkmode-only"></p>\n',
    );
  });

  it("should not be effected by title", () => {
    expect(markdownIt.render(`![image](/logo.svg#light "title")`)).toBe(
      '<p><img src="/logo.svg" alt="image" title="title" data-mode="lightmode-only"></p>\n',
    );

    expect(markdownIt.render(`![image](/logo.svg#dark "another title")`)).toBe(
      '<p><img src="/logo.svg" alt="image" title="another title" data-mode="darkmode-only"></p>\n',
    );

    expect(markdownItWithCustomOptions.render(`![image](/logo.svg#lightmode "title")`)).toBe(
      '<p><img src="/logo.svg" alt="image" title="title" data-mode="lightmode-only"></p>\n',
    );

    expect(markdownItWithCustomOptions.render(`![image](/logo.svg#darkmode "another title")`)).toBe(
      '<p><img src="/logo.svg" alt="image" title="another title" data-mode="darkmode-only"></p>\n',
    );
  });

  it("should handle empty src", () => {
    expect(markdownIt.render("![]()")).toBe('<p><img src="" alt=""></p>\n');
  });
});
