import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { bareEmoji } from "../src/index.js";

const md = new MarkdownIt().use(bareEmoji, {
  definitions: { smile: "😄", heart: "❤️" },
  shortcuts: { smile: [":)"] },
});

describe("emoji core rule", () => {
  it("keeps markup, shortcuts and emojis in order", () => {
    expect(md.render("x :) :heart: *y* :smile:")).toBe("<p>x 😄 ❤️ <em>y</em> 😄</p>\n");
  });

  it("rebuilds a long inline token list in order", () => {
    const unit = "*x* :smile: ";
    const repetitions = 512;
    const source = `${unit.repeat(repetitions).trimEnd()}\n`;
    const expected = `<p>${"<em>x</em> 😄 ".repeat(repetitions).trimEnd()}</p>\n`;

    expect(md.render(source)).toBe(expected);
  });
});
