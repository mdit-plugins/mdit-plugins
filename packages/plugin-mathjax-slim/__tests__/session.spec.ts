import { MathJaxTexFont as MathJaxTexSVGFont } from "@mathjax/mathjax-tex-font/js/svg.js";
import { describe, expect, it } from "vitest";

import { createSession } from "../src/session.js";

describe("session", () => {
  it("renders and styles SVG in the main thread", async () => {
    const session = await createSession({ output: "svg" });

    const html = await session.render([
      { content: "a=1", display: false },
      { content: String.raw`\frac{a}{b}`, display: true },
    ]);

    expect(html[0]).toMatch(/jax="SVG"/);
    expect(html[1]).toMatch(/jax="SVG"/);
    expect(html[0]).toContain("<mjx-assistive-mml");

    const style = await session.style();

    expect(style.length).toBeGreaterThan(0);
    expect(style).toContain("mjx-container");

    session.reset();
    session.clearStyle();
  });

  it("supports chtml without a11y", async () => {
    const session = await createSession({ output: "chtml", a11y: false });

    const [html] = await session.render([{ content: "a=1", display: false }]);

    expect(html).toMatch(/jax="CHTML"/);
    expect(html).not.toContain("<mjx-assistive-mml");
    await expect(session.style()).resolves.toContain("mjx-container");
  });

  it("supports tex macros", async () => {
    const session = await createSession({
      output: "svg",
      a11y: false,
      tex: { macros: { foo: "bar" } } as never,
    });

    const [html] = await session.render([{ content: String.raw`\foo+1`, display: false }]);

    expect(html).toMatch(/jax="SVG"/);
    expect(html).not.toContain("merror");
  });

  it("supports custom font data", async () => {
    const session = await createSession({
      output: "svg",
      a11y: false,
      svg: { fontData: MathJaxTexSVGFont },
    });

    const [html] = await session.render([{ content: String.raw`\frac{a}{b}`, display: true }]);

    expect(html).toMatch(/jax="SVG"/);
  });

  it("clearStyle is a no-op before the output jax is initialized", async () => {
    const session = await createSession({ output: "svg" });

    expect(() => {
      session.clearStyle();
    }).not.toThrow();
  });

  it("supports a custom tex package subset", async () => {
    const session = await createSession({
      output: "svg",
      a11y: false,
      tex: { packages: ["ams"] },
    });

    const [html] = await session.render([{ content: String.raw`\mathbb{R}`, display: false }]);

    expect(html).toMatch(/jax="SVG"/);
  });
});
