import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { createMathjaxInstance, mathjax } from "../src/async/index.js";

describe("mathjax a11y", () => {
  it("should not warn about enableAssistiveMml when a11y is disabled", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const instance = (await createMathjaxInstance({ output: "svg", a11y: false }))!;
      const md = new MarkdownIt().use(mathjax, instance);
      const rendered = md.render("$x$");

      expect(rendered).not.toContain("mjx-assistive-mml");
      expect(warn.mock.calls.flat().join("\n")).not.toContain(
        'Invalid option "enableAssistiveMml"',
      );
    } finally {
      warn.mockRestore();
    }
  });
});
