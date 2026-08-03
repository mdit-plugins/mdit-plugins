import MarkdownIt from "markdown-it";
import { describe, expect, it, vi } from "vitest";

import { createMathjaxInstance, mathjax as mathjaxAsync } from "../src/index.js";
import {
  createMathjaxInstance as createSyncInstance,
  mathjax as mathjaxSync,
} from "../src/sync.js";

const setupAsync = async (): Promise<{ md: MarkdownIt }> => {
  const instance = await createMathjaxInstance({ output: "svg", a11y: false });

  return { md: MarkdownIt({ html: true }).use(mathjaxAsync, instance) };
};

const setupSync = (): { md: MarkdownIt } => {
  const instance = createSyncInstance({ output: "svg", a11y: false })!;

  return { md: MarkdownIt({ html: true }).use(mathjaxSync, instance) };
};

// The SVG output contains an incrementing id counter (e.g. `MJX-1`, `MJX-3`)
// shared by the output jax, so normalize it away before comparing renders.
const normalize = (html: string): string => html.replaceAll(/MJX-\d+/g, "MJX-N");

describe("mathjax state isolation", () => {
  describe("async", () => {
    it("should reset state after render and renderInline", async () => {
      const instance = (await createMathjaxInstance({ output: "svg", a11y: false }))!;
      const resetSpy = vi.spyOn(instance, "reset");
      const md = MarkdownIt({ html: true }).use(mathjaxAsync, instance);

      md.render("$x$");
      expect(resetSpy).toHaveBeenCalledTimes(1);

      md.renderInline("$y$");
      expect(resetSpy).toHaveBeenCalledTimes(2);
    });

    it("should not leak newcommand macros across documents", async () => {
      const { md } = await setupAsync();

      // Doc 1 defines the macro
      md.render(String.raw`$\newcommand{\foo}{bar}\foo$`);

      // Doc 2 must not see the macro defined in Doc 1
      const doc2 = md.render(String.raw`$\foo$`);

      const { md: freshMd } = await setupAsync();
      const baseline = freshMd.render(String.raw`$\foo$`);

      expect(normalize(doc2)).toBe(normalize(baseline));
    });

    it("should not leak newenvironment macros across documents", async () => {
      const { md } = await setupAsync();

      // Doc 1 defines the environment
      md.render(String.raw`$$\newenvironment{foo}{[}{]}\begin{foo}x\end{foo}$$`);

      // Doc 2 must not see the environment defined in Doc 1
      const doc2 = md.render(String.raw`$$\begin{foo}x\end{foo}$$`);

      const { md: freshMd } = await setupAsync();
      const baseline = freshMd.render(String.raw`$$\begin{foo}x\end{foo}$$`);

      expect(normalize(doc2)).toBe(normalize(baseline));
    });
  });

  describe("sync", () => {
    it("should reset state after render and renderInline", () => {
      const instance = createSyncInstance({ output: "svg", a11y: false })!;
      const resetSpy = vi.spyOn(instance, "reset");
      const md = MarkdownIt({ html: true }).use(mathjaxSync, instance);

      md.render("$x$");
      expect(resetSpy).toHaveBeenCalledTimes(1);

      md.renderInline("$y$");
      expect(resetSpy).toHaveBeenCalledTimes(2);
    });

    it("should not leak newcommand macros across documents", () => {
      const { md } = setupSync();

      md.render(String.raw`$\newcommand{\foo}{bar}\foo$`);
      const doc2 = md.render(String.raw`$\foo$`);

      const { md: freshMd } = setupSync();
      const baseline = freshMd.render(String.raw`$\foo$`);

      expect(normalize(doc2)).toBe(normalize(baseline));
    });

    it("should not leak newenvironment macros across documents", () => {
      const { md } = setupSync();

      md.render(String.raw`$$\newenvironment{foo}{[}{]}\begin{foo}x\end{foo}$$`);
      const doc2 = md.render(String.raw`$$\begin{foo}x\end{foo}$$`);

      const { md: freshMd } = setupSync();
      const baseline = freshMd.render(String.raw`$$\begin{foo}x\end{foo}$$`);

      expect(normalize(doc2)).toBe(normalize(baseline));
    });
  });
});
