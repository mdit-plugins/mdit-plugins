import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { footnote } from "../../plugin-footnote/src/index.js";
import { tab } from "../src/index.js";

const getFirstTabButtonContent = (html: string): string => {
  const match = /<button\b[^>]*data-tab="0"[^>]*>(?<content>[\s\S]*?)<\/button>/u.exec(html);
  const content = match?.groups?.content;

  if (content === undefined) throw new Error("Tab button is not rendered");

  return content;
};

describe("tab title env", () => {
  it("should render footnote reference in tab title", () => {
    const markdownIt = new MarkdownIt({ linkify: true }).use(footnote).use(tab);

    const result = markdownIt.render(`\
::: tabs
@tab Title with footnote [^note]
Tab content.
:::

[^note]: Footnote content.
`);

    const buttonContent = getFirstTabButtonContent(result);

    expect(buttonContent).toContain('Title with footnote <sup class="footnote-ref">');
    expect(buttonContent).toContain('<a href="#footnote1">[1]</a>');
    expect(buttonContent).not.toContain("[^note]");
  });
});
