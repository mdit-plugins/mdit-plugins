import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { uml } from "../src/index.js";

describe("uml", () => {
  it("should render without options", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(uml);

    expect(
      markdownIt.render(`
@start

abc

@end
    `),
    ).toMatchSnapshot();
  });

  it("should keep content as is", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(uml);

    expect(
      markdownIt.render(`
@start

Text with **bold** and \`code\`.

@end
    `),
    ).toMatchSnapshot();
  });

  it("should render with options", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(uml, {
      name: "test",
      open: "teststart",
      close: "testend",
      render: (tokens, index): string => {
        const token = tokens[index];
        const { content, info, type } = token;

        return `<Test class="${type}" title="${info}">${content}</Test>`;
      },
    });

    expect(
      markdownIt.render(`
@teststart

abc

def

@testend
`),
    ).toMatchSnapshot();
  });
});
