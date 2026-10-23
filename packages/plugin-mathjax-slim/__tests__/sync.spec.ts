import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { createMathjaxInstance, mathjax as mathjaxAsync } from "../src/async/index.js";
import { getMathjax, mathjax as mathjaxNext } from "../src/index.js";
import type { MarkdownItSyncMathjaxOptions } from "../src/index.js";

// The SVG/CHTML output contains an incrementing id counter shared inside an
// instance, so normalize it away before comparing renders of different instances.
const normalize = (html: string): string => html.replaceAll(/MJX-\d+/g, "MJX-N");
const CONTROL_CHAR = "\u0002";

const inline = String.raw`$e^{i\pi}+1=0$`;
const display = String.raw`$$\frac{a}{b}$$`;
const dynamicChar = String.raw`$$\mathbb{R}\mathcal{L}\mathfrak{g}$$`;

const dispose = (md: MarkdownItType): void => {
  getMathjax(md).dispose();
};

// The plugin resolves `./worker.js` relative to its built entry. Source tests use
// the built worker so that both the source code and the shipped worker are covered.
const WORKER_PATH = new URL("../dist/worker.js", import.meta.url);
const SRC_DIR = fileURLToPath(new URL("../src/", import.meta.url));

// The worker entry has to be built: Node's type stripping cannot resolve the
// `.js` relative imports of a `.ts` worker. Refuse to silently test a stale build.
const assertWorkerIsFresh = (): void => {
  const workerMtime = statSync(fileURLToPath(WORKER_PATH)).mtimeMs;
  const stale = ["session.ts", "worker.ts", "protocol.ts"].some(
    (file) => statSync(path.join(SRC_DIR, file)).mtimeMs > workerMtime,
  );

  if (stale) {
    throw new Error(
      "dist/worker.js is stale. Run `pnpm build` in packages/plugin-mathjax-slim before running these tests.",
    );
  }
};

// oxlint-disable-next-line vitest/require-hook
assertWorkerIsFresh();

const setup = (options?: MarkdownItSyncMathjaxOptions): MarkdownItType =>
  new MarkdownIt({ linkify: true }).use(mathjaxNext, {
    ...options,
    workerPath: WORKER_PATH,
  });

const setupAsync = async (): Promise<MarkdownItType> => {
  const instance = (await createMathjaxInstance({ output: "svg" }))!;

  // The existing async entry converts synchronously, so dynamic font files must
  // be loaded before the first render (the official async API is only used by
  // `outputStyle`).
  await instance.outputStyle();

  return new MarkdownIt({ linkify: true }).use(mathjaxAsync, instance);
};

describe("synchronous mathjax plugin", () => {
  it("renders inline, block and dynamic-font formulas synchronously", () => {
    const md = setup({ output: "svg", a11y: false });
    const html = md.render(`${inline}\n\n${display}\n\n${dynamicChar}`);

    expect(html).toMatch(/jax="SVG"/);
    expect(html).toMatch(/<mjx-container .*>[\s\S]*<\/mjx-container>/);
    expect(html).toMatch(/<svg .*>[\s\S]*<\/svg>/);
    expect(html).not.toContain(CONTROL_CHAR);

    dispose(md);
  });

  it("renders the same HTML as the async implementation", async () => {
    const syncMd = setup({ output: "svg" });
    const asyncMd = await setupAsync();

    for (const source of [inline, display, dynamicChar, `A ${inline} inline.`])
      expect(normalize(syncMd.render(source))).toBe(normalize(asyncMd.render(source)));

    dispose(syncMd);
  });

  it("supports renderInline", () => {
    const md = setup({ output: "svg", a11y: false });
    const html = md.renderInline(String.raw`A $x$ and $\frac12$`);

    expect(html).toMatch(/jax="SVG"/);
    expect(html).not.toContain(CONTROL_CHAR);

    dispose(md);
  });

  it("supports chtml output", () => {
    const md = setup({ output: "chtml" });
    const html = md.render(dynamicChar);

    expect(html).toMatch(/jax="CHTML"/);
    expect(html).toContain("mjx-container");
    expect(getMathjax(md).outputStyle()).toContain("mjx-container");

    dispose(md);
  });

  it("honors the a11y option", () => {
    const withA11y = setup({ output: "svg" });
    expect(withA11y.render(inline)).toContain("<mjx-assistive-mml");

    const withoutA11y = setup({ output: "svg", a11y: false });
    expect(withoutA11y.render(inline)).not.toContain("<mjx-assistive-mml");

    dispose(withA11y);
    dispose(withoutA11y);
  });

  it("keeps a11y isolated between sessions sharing the worker", () => {
    const chtmlWithA11y = setup({ output: "chtml" });
    const svgWithoutA11y = setup({ output: "svg", a11y: false });

    expect(chtmlWithA11y.render(dynamicChar)).toContain("<mjx-assistive-mml");
    expect(svgWithoutA11y.render(dynamicChar)).not.toContain("<mjx-assistive-mml");
    // Interleave again to make sure the first-declared session does not win.
    expect(chtmlWithA11y.render(inline)).toContain("<mjx-assistive-mml");
    expect(svgWithoutA11y.render(inline)).not.toContain("<mjx-assistive-mml");

    dispose(chtmlWithA11y);
    dispose(svgWithoutA11y);
  });

  it("returns a non-empty style sheet synchronously", () => {
    const md = setup({ output: "svg" });
    md.render(dynamicChar);

    const { outputStyle } = getMathjax(md);
    const style = outputStyle();

    expect(style.length).toBeGreaterThan(0);
    expect(style).toContain("mjx-container");

    dispose(md);
  });

  it("applies transformer on the main thread", () => {
    const md = setup({
      output: "svg",
      a11y: false,
      // oxlint-disable-next-line vitest/no-conditional-in-test
      transformer: (html, displayMode) => `<!--${displayMode ? "block" : "inline"}-->${html}`,
    });

    expect(md.render(inline)).toContain("<!--inline-->");
    expect(md.render(display)).toContain("<!--block-->");

    dispose(md);
  });

  it("does not leak TeX macros across documents", () => {
    const md = setup({ output: "svg", a11y: false });

    md.render(String.raw`$\newcommand{\foo}{bar}\foo$`);

    // Doc 2 must not see the macro defined by doc 1.
    const second = md.render(String.raw`$\foo$`);
    const baselineMd = setup({ output: "svg", a11y: false });
    const baseline = baselineMd.render(String.raw`$\foo$`);

    expect(normalize(second)).toBe(normalize(baseline));

    dispose(md);
    dispose(baselineMd);
  });

  it("does not throw on invalid TeX", () => {
    const md = setup({ output: "svg", a11y: false });

    expect(() => md.render(String.raw`$\fra{a}{b}$`)).not.toThrow();
    expect(md.render(String.raw`$\fra{a}{b}$`)).toContain("mjx-container");

    dispose(md);
  });

  it("works with default options and without math", () => {
    const md = new MarkdownIt().use(mathjaxNext);
    const { clearStyle, dispose: disposeMethods, reset } = getMathjax(md);

    expect(md.render("plain text")).toBe("<p>plain text</p>\n");
    expect(() => {
      clearStyle();
      reset();
    }).not.toThrow();
    expect(() => disposeMethods()).not.toThrow();
    expect(() => disposeMethods()).not.toThrow();
  });

  it("flushes nested renders from the outermost call", () => {
    const md = setup({ output: "svg", a11y: false });
    const paragraphOpen = md.renderer.rules.paragraph_open;

    md.renderer.rules.paragraph_open = (tokens, index, options, _env, self): string =>
      `${md.renderInline("$nested$")}${self.renderToken(tokens, index, options)}`;

    const html = md.render("$outer$");

    expect(html).toMatch(/jax="SVG"/);
    expect(html.match(/jax="SVG"/g)).toHaveLength(2);

    md.renderer.rules.paragraph_open = paragraphOpen;
    dispose(md);
  });

  it("clears collected items when a nested render throws", () => {
    const md = setup({ output: "svg", a11y: false });
    const paragraphOpen = md.renderer.rules.paragraph_open;

    md.renderer.rules.paragraph_open = (): string => {
      md.renderInline("$nested$");
      throw new Error("nested boom");
    };

    expect(() => md.render("$outer$")).toThrow("nested boom");

    md.renderer.rules.paragraph_open = paragraphOpen;
    dispose(md);
  });

  it("reports unsupported worker options", () => {
    expect(() =>
      new MarkdownIt().use(mathjaxNext, { svg: { preFilters: [(): void => {}] } }),
    ).toThrow(/svg\.preFilters/);

    expect(() =>
      new MarkdownIt().use(mathjaxNext, {
        svg: {
          linebreaks: {
            LinebreakVisitor: class LinebreakVisitor {
              marker = true;
            } as never,
          },
        },
      }),
    ).toThrow(/LinebreakVisitor/);
  });

  it("throws a clear error for non-serializable options", () => {
    expect(() =>
      new MarkdownIt().use(mathjaxNext, { tex: { formatError: () => undefined as never } }),
    ).toThrow(/cannot be sent to the worker/);

    expect(() =>
      new MarkdownIt().use(mathjaxNext, {
        tex: { macros: { foo: () => undefined } } as never,
      }),
    ).toThrow(/not serializable/);
  });

  it("discards formulas collected by a failed render pass", () => {
    const md = setup({ output: "svg", a11y: false });
    const mathInline = md.renderer.rules.math_inline;

    md.renderer.rules.math_inline = (...args): string => {
      mathInline(...args);

      throw new Error("boom");
    };

    expect(() => md.render(String.raw`$\newcommand{\foo}{bar}\foo$`)).toThrow("boom");

    md.renderer.rules.math_inline = mathInline;

    // The failed document must not leak its macro into the next document.
    const second = md.render(String.raw`$\foo$`);
    const baselineMd = setup({ output: "svg", a11y: false });
    const baseline = baselineMd.render(String.raw`$\foo$`);

    expect(normalize(second)).toBe(normalize(baseline));

    dispose(md);
    dispose(baselineMd);
  });

  it("refuses to install twice on the same MarkdownIt instance", () => {
    const md = setup({ output: "svg" });

    expect(() => md.use(mathjaxNext, { workerPath: WORKER_PATH })).toThrow(/already installed/);

    dispose(md);
  });

  it("throws after dispose", () => {
    const md = setup({ output: "svg" });

    md.render(inline);
    dispose(md);

    expect(() => md.render(inline)).toThrow(/disposed/);
    expect(() => getMathjax(md)).toThrow(/not installed/);
  });
});
