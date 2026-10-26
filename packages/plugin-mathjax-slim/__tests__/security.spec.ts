import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { createMathjaxInstance, mathjax as asyncMathjax } from "../src/async/index.js";
import type { MathjaxInstance } from "../src/async/index.js";
import { getMathjax, mathjax } from "../src/index.js";

const DANGEROUS_HREF = String.raw`\href{javascript:alert(1)}{x}`;
const SAFE_HREF = String.raw`\href{https://example.com}{x}`;
const CLASS_PAYLOAD = String.raw`\class{evil}{x}`;
const STYLE_PAYLOAD = String.raw`\style{background:red}{x}`;

const DANGEROUS_ATTR = /href="(?:javascript|data|file):/i;

describe("html TeX package gating (sync)", () => {
  it("does not provide HTML-related TeX packages when markdown-it disables html", () => {
    const md = new MarkdownIt().use(mathjax, { output: "svg" });

    try {
      const dangerous = md.render(`$${DANGEROUS_HREF}$`);
      const safe = md.render(`$${SAFE_HREF}$`);
      const className = md.render(`$${CLASS_PAYLOAD}$`);
      const style = md.render(`$${STYLE_PAYLOAD}$`);

      expect(dangerous).not.toMatch(DANGEROUS_ATTR);
      expect(safe).not.toContain('href="https://example.com"');
      expect(className).not.toContain('class="evil"');
      expect(style).not.toMatch(/style="[^"]*background:red/);
    } finally {
      getMathjax(md).dispose();
    }
  });

  it("gates CHTML output and assistive MathML as well", () => {
    const md = new MarkdownIt().use(mathjax, { output: "chtml" });

    try {
      const dangerous = md.render(`$${DANGEROUS_HREF}$`);

      expect(dangerous).toMatch(/jax="CHTML"/);
      expect(dangerous).toMatch(/<mjx-assistive-mml/);
      expect(dangerous).not.toMatch(DANGEROUS_ATTR);
    } finally {
      getMathjax(md).dispose();
    }
  });

  it("provides HTML-related TeX packages when markdown-it enables html", () => {
    const md = new MarkdownIt({ html: true }).use(mathjax, { output: "svg" });

    try {
      expect(md.render(`$${SAFE_HREF}$`)).toContain('href="https://example.com"');
      expect(md.render(`$${CLASS_PAYLOAD}$`)).toContain('class="evil"');
      expect(md.render(`$${STYLE_PAYLOAD}$`)).toContain("background:red");
    } finally {
      getMathjax(md).dispose();
    }
  });

  it("honors explicitly configured html packages when markdown-it disables html", () => {
    const md = new MarkdownIt().use(mathjax, {
      output: "svg",
      tex: { packages: ["ams", "html", "texhtml"] },
    });

    try {
      // Explicit `tex.packages` is trusted developer configuration, so it is used as-is.
      expect(md.render(`$${SAFE_HREF}$`)).toContain('href="https://example.com"');
    } finally {
      getMathjax(md).dispose();
    }
  });

  it("uses an explicit package list as-is when markdown-it enables html", () => {
    const md = new MarkdownIt({ html: true }).use(mathjax, {
      output: "svg",
      tex: { packages: ["ams"] },
    });

    try {
      expect(md.render(`$${SAFE_HREF}$`)).not.toContain('href="https://example.com"');
    } finally {
      getMathjax(md).dispose();
    }
  });
});

describe("html TeX package gating (async)", () => {
  it("does not provide HTML-related TeX packages when markdown-it disables html", async () => {
    const instance = (await createMathjaxInstance({ output: "svg" }))!;
    const md = new MarkdownIt().use(asyncMathjax, instance);

    const dangerous = md.render(`$${DANGEROUS_HREF}$`);
    const safe = md.render(`$${SAFE_HREF}$`);

    expect(dangerous).not.toMatch(DANGEROUS_ATTR);
    expect(safe).not.toContain('href="https://example.com"');
  });

  it("provides HTML-related TeX packages when markdown-it enables html", async () => {
    const instance = (await createMathjaxInstance({ output: "svg" }))!;
    const md = new MarkdownIt({ html: true }).use(asyncMathjax, instance);

    expect(md.render(`$${SAFE_HREF}$`)).toContain('href="https://example.com"');
    expect(md.render(`$${CLASS_PAYLOAD}$`)).toContain('class="evil"');
  });

  it("gates CHTML output for the async entry as well", async () => {
    const instance = (await createMathjaxInstance({ output: "chtml" }))!;
    const md = new MarkdownIt().use(asyncMathjax, instance);
    const dangerous = md.render(`$${DANGEROUS_HREF}$`);

    expect(dangerous).toMatch(/jax="CHTML"/);
    expect(dangerous).toMatch(/<mjx-assistive-mml/);
    expect(dangerous).not.toMatch(DANGEROUS_ATTR);
  });

  it("honors explicitly configured html packages when html is disabled", async () => {
    const instance = (await createMathjaxInstance({
      output: "svg",
      tex: { packages: ["ams", "html", "texhtml"] },
    }))!;
    const md = new MarkdownIt().use(asyncMathjax, instance);

    expect(md.render(`$${SAFE_HREF}$`)).toContain('href="https://example.com"');
  });

  it("uses an explicit package list as-is when html is enabled", async () => {
    const instance = (await createMathjaxInstance({
      output: "svg",
      tex: { packages: ["ams"] },
    }))!;
    const md = new MarkdownIt({ html: true }).use(asyncMathjax, instance);

    expect(md.render(`$${SAFE_HREF}$`)).not.toContain('href="https://example.com"');
  });

  it("refuses to share one instance between markdown-it instances in either order", async () => {
    const plainFirst = (await createMathjaxInstance({ output: "svg" }))!;

    new MarkdownIt().use(asyncMathjax, plainFirst);

    expect(() => new MarkdownIt({ html: true }).use(asyncMathjax, plainFirst)).toThrow(
      /already installed/,
    );

    const htmlFirst = (await createMathjaxInstance({ output: "svg" }))!;

    new MarkdownIt({ html: true }).use(asyncMathjax, htmlFirst);

    expect(() => new MarkdownIt().use(asyncMathjax, htmlFirst)).toThrow(/already installed/);
  });

  it("rejects instances created by another package", () => {
    const md = new MarkdownIt();

    expect(() => md.use(asyncMathjax, {} as unknown as MathjaxInstance)).toThrow(
      /createMathjaxInstance/,
    );
  });
});
