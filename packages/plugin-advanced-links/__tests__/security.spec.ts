import { escapeHtml } from "@mdit/helper";
import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { advancedLinks } from "../src/index.js";

// Mirrors the escaped renderer from the documentation.
const createMarkdownIt = (): MarkdownItType =>
  new MarkdownIt().use(advancedLinks, {
    name: "badge",
    inline: true,
    renderer: (link, props) => {
      const text = typeof props.text === "string" ? props.text : link;

      return `<span class="badge badge-${escapeHtml(link)}">${escapeHtml(text)}</span>`;
    },
  });

describe("escaped renderer", () => {
  it("escapes malicious prop values", () => {
    const output = createMarkdownIt().render(
      `@[badge text="</span><img src=x onerror=alert(1)>"](home)`,
    );

    expect(output).not.toContain("<img");
    expect(output).toContain("&lt;/span&gt;");
  });

  it("escapes malicious link values", () => {
    const output = createMarkdownIt().render('@[badge](<a" onmouseover="alert(1)>)');

    expect(output).not.toContain('onmouseover="alert(1)"');
    // normalization percent-encodes the quotes and the space, so nothing breaks out of the attribute
    expect(output).toContain("a%22%20onmouseover=%22alert(1)");
  });
});

describe("dangerous link schemes", () => {
  it("rejects javascript: before it reaches the renderer", () => {
    const output = createMarkdownIt().render("@[badge](javascript:alert(1))");

    expect(output).not.toContain("<span");
  });

  it("is safe for double-encoded control characters with the escaped renderer", () => {
    const output = createMarkdownIt().render("@[badge](<java&amp;#9;script:alert(1)>)");

    // only one entity decoding happens, and `escapeHtml` turns the literal `&` into `&amp;`,
    // so no second decoding can introduce a tab into the URL
    expect(output).not.toContain("\t");
    expect(output).toContain("java&amp;#9;script:alert(1)");
  });

  it("percent-encodes control characters that could hide a scheme", () => {
    const output = createMarkdownIt().render("@[badge](<java&#9;script:alert(1)>)");

    // oxlint-disable-next-line no-script-url -- asserting that the scheme is percent-encoded
    expect(output).not.toContain("javascript:alert(1)");
    expect(output).toContain("java%09script:alert(1)");
  });
});
