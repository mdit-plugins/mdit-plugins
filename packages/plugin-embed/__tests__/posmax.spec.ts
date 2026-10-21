import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { embed } from "../src/index.js";

const createMd = (): MarkdownItType =>
  new MarkdownIt().use(embed, {
    config: [
      {
        name: "icon",
        allowInline: true,
        setup: (name: string): string => `<embed name="${name}" />`,
      },
    ],
  });

describe("inline embed posMax boundaries", () => {
  it("should not swallow the closing bracket of a link label", () => {
    expect(createMd().render("[{%icon x](url)%}")).toBe('<p><a href="url">{%icon x</a>%}</p>\n');
  });

  it("should not swallow the closing bracket of an image label", () => {
    expect(createMd().render("![{%icon x](url)%}")).toBe(
      '<p><img src="url" alt="{%icon x">%}</p>\n',
    );
  });

  it("should still parse inline embeds inside link labels", () => {
    expect(createMd().render("[{% icon x %}](url)")).toBe(
      '<p><a href="url"><embed name="x" /></a></p>\n',
    );
  });
});
