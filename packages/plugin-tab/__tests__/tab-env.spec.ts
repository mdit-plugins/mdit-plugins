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
  it("should not inject footnote blocks into tab buttons", () => {
    const markdownIt = new MarkdownIt({ linkify: true }).use(footnote).use(tab);

    const result = markdownIt.render(`\
::: tabs
@tab Title with footnote [^note]
Tab content.
:::

[^note]: Footnote content.
`);

    const buttonContent = getFirstTabButtonContent(result);

    // Footnote refs are rendered at parse time by the footnote plugin, after tab titles
    // have only been stored as raw text, so env-dependent inline syntax stays literal
    // in titles. Rendering it here would append the footnote tail block inside the
    // button or leave a dangling anchor.
    expect(buttonContent).toContain("Title with footnote [^note]");
    expect(buttonContent).not.toContain("footnote-ref");
    expect(result).not.toContain("footnotes-sep");
    expect(result).not.toContain('class="footnotes"');
  });
});
