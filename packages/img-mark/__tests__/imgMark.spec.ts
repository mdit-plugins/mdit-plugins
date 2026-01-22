import MarkdownIt from "markdown-it";
import { expect, it } from "vitest";

import { imgMark } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(imgMark);
const markdownItWithCustomOptions = MarkdownIt({ linkify: true }).use(imgMark, {
  light: ["lightmode"],
  dark: ["darkmode"],
});

it("should render", () => {
  expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
    '<p><img src="/logo.svg" alt="image"></p>\n',
  );

  expect(markdownIt.render(`![image](/logo.svg#light)`)).toEqual(
    '<p><img src="/logo.svg" alt="image" data-mode="lightmode-only"></p>\n',
  );
  expect(markdownIt.render(`![image](/logo.svg#dark)`)).toEqual(
    '<p><img src="/logo.svg" alt="image" data-mode="darkmode-only"></p>\n',
  );
});

it("should support options", () => {
  expect(markdownItWithCustomOptions.render(`![image](/logo.svg#lightmode)`)).toEqual(
    '<p><img src="/logo.svg" alt="image" data-mode="lightmode-only"></p>\n',
  );

  expect(markdownItWithCustomOptions.render(`![image](/logo.svg#darkmode)`)).toEqual(
    '<p><img src="/logo.svg" alt="image" data-mode="darkmode-only"></p>\n',
  );
});

it("should not be effected by title", () => {
  expect(markdownIt.render(`![image](/logo.svg#light "title")`)).toEqual(
    '<p><img src="/logo.svg" alt="image" title="title" data-mode="lightmode-only"></p>\n',
  );

  expect(markdownIt.render(`![image](/logo.svg#dark "another title")`)).toEqual(
    '<p><img src="/logo.svg" alt="image" title="another title" data-mode="darkmode-only"></p>\n',
  );

  expect(markdownItWithCustomOptions.render(`![image](/logo.svg#lightmode "title")`)).toEqual(
    '<p><img src="/logo.svg" alt="image" title="title" data-mode="lightmode-only"></p>\n',
  );

  expect(
    markdownItWithCustomOptions.render(`![image](/logo.svg#darkmode "another title")`),
  ).toEqual(
    '<p><img src="/logo.svg" alt="image" title="another title" data-mode="darkmode-only"></p>\n',
  );
});
