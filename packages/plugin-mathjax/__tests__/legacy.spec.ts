// oxlint-disable typescript/no-deprecated -- explicitly testing the deprecated compatibility entry
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { createMathjaxInstance, mathjax } from "../src/index.js";
import { isMathjaxInstance } from "../src/legacy.js";

describe("legacy instance API", () => {
  it("detects legacy instances and creates default instances", async () => {
    expect(isMathjaxInstance(null)).toBe(false);
    expect(isMathjaxInstance("instance")).toBe(false);

    const instance = await createMathjaxInstance();

    expect(instance).not.toBeNull();
    expect(isMathjaxInstance(instance)).toBe(true);
  });

  it("supports the v1 instance workflow from the main entry", async () => {
    const instance = (await createMathjaxInstance({ output: "svg" }))!;
    const md = new MarkdownIt({ linkify: true }).use(mathjax, instance);

    expect(md.render("$x$")).toMatch(/jax="SVG"/);
    expect(md.renderInline("A $y$ inline")).toMatch(/jax="SVG"/);
    expect(instance.render(String.raw`\frac{a}{b}`, true)).toMatch(/jax="SVG"/);

    const style = await instance.outputStyle();

    expect(style).toContain("mjx-container");
  });

  it("applies transformer and a11y options on the legacy path", async () => {
    const instance = (await createMathjaxInstance({
      output: "chtml",
      a11y: false,
      transformer: (html) => `<!--legacy-->${html}`,
    }))!;
    const md = new MarkdownIt({ linkify: true }).use(mathjax, instance);
    const html = md.render("$x$");

    expect(html).toContain("<!--legacy-->");
    expect(html).toMatch(/jax="CHTML"/);
    expect(html).not.toContain("mjx-assistive-mml");
  });
});
