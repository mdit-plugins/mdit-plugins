import { MarkdownExit } from "markdown-exit";
/* oxlint-disable import/max-dependencies -- This contract imports every plugin on purpose. */
import MarkdownIt from "markdown-it";
import type { Env, MarkdownIt as MarkdownItInstance } from "markdown-it";
import { describe, expectTypeOf, it } from "vitest";

import { abbr } from "../packages/plugin-abbr/src/index.js";
import { advancedLinks } from "../packages/plugin-advanced-links/src/index.js";
import { alert } from "../packages/plugin-alert/src/index.js";
import { align } from "../packages/plugin-align/src/index.js";
import { anchor } from "../packages/plugin-anchor/src/index.js";
import { attrs } from "../packages/plugin-attrs/src/index.js";
import { cjkBreaks } from "../packages/plugin-cjk-breaks/src/index.js";
import { cjkFriendly } from "../packages/plugin-cjk-friendly/src/index.js";
import { container } from "../packages/plugin-container/src/index.js";
import { demo } from "../packages/plugin-demo/src/index.js";
import { dl } from "../packages/plugin-dl/src/index.js";
import { embed } from "../packages/plugin-embed/src/index.js";
import { bareEmoji, fullEmoji, lightEmoji } from "../packages/plugin-emoji/src/index.js";
import { field } from "../packages/plugin-field/src/index.js";
import { figure } from "../packages/plugin-figure/src/index.js";
import { footnote } from "../packages/plugin-footnote/src/index.js";
import { frontmatter } from "../packages/plugin-frontmatter/src/index.js";
import { icon } from "../packages/plugin-icon/src/index.js";
import { imgLazyload } from "../packages/plugin-img-lazyload/src/index.js";
import { imgMark } from "../packages/plugin-img-mark/src/index.js";
import { imgSize, legacyImgSize, obsidianImgSize } from "../packages/plugin-img-size/src/index.js";
import { include } from "../packages/plugin-include/src/index.js";
import { inlineRule } from "../packages/plugin-inline-rule/src/index.js";
import { ins } from "../packages/plugin-ins/src/index.js";
import { katex as katexSlim } from "../packages/plugin-katex-slim/src/index.js";
import { katex as katexPlugin } from "../packages/plugin-katex/src/index.js";
import { layout } from "../packages/plugin-layout/src/index.js";
import { mark } from "../packages/plugin-mark/src/index.js";
import { mathjax as asyncMathjaxSlim } from "../packages/plugin-mathjax-slim/src/async/index.js";
import { mathjax as syncMathjaxSlim } from "../packages/plugin-mathjax-slim/src/index.js";
import { mathjax as asyncMathjax } from "../packages/plugin-mathjax/src/async/index.js";
import { mathjax as syncMathjax } from "../packages/plugin-mathjax/src/index.js";
import { plantuml } from "../packages/plugin-plantuml/src/index.js";
import { ruby } from "../packages/plugin-ruby/src/index.js";
import { snippet } from "../packages/plugin-snippet/src/index.js";
import { spoiler } from "../packages/plugin-spoiler/src/index.js";
import { stylize } from "../packages/plugin-stylize/src/index.js";
import { sub } from "../packages/plugin-sub/src/index.js";
import { sup } from "../packages/plugin-sup/src/index.js";
import { tab } from "../packages/plugin-tab/src/index.js";
import { tasklist } from "../packages/plugin-tasklist/src/index.js";
import { tex } from "../packages/plugin-tex/src/index.js";
import { uml } from "../packages/plugin-uml/src/index.js";

/**
 * Runtime-free type contract: every plugin must be installable on both `markdown-it` and
 * `markdown-exit` without a type assertion.
 *
 * Vitest runs this file in typecheck mode (`pnpm run test:types`). The `.use()` calls below and the
 * `expectTypeOf` assertions fail the typecheck when a plugin stops being engine-agnostic.
 */

interface TestKatexEnv extends Env {
  answer: number;
}

type MarkdownItPlugin = (md: MarkdownItInstance) => void;

const md = new MarkdownIt();
const markdownExit = new MarkdownExit();

describe("markdown-exit type compatibility", () => {
  it("abbr", () => {
    expectTypeOf(abbr).toExtend<MarkdownItPlugin>();
    md.use(abbr);
    markdownExit.use(abbr);
  });

  it("advancedLinks", () => {
    expectTypeOf(advancedLinks).toExtend<MarkdownItPlugin>();
    md.use(advancedLinks);
    markdownExit.use(advancedLinks);
  });

  it("alert", () => {
    expectTypeOf(alert).toExtend<MarkdownItPlugin>();
    md.use(alert);
    markdownExit.use(alert);
  });

  it("align", () => {
    expectTypeOf(align).toExtend<MarkdownItPlugin>();
    md.use(align);
    markdownExit.use(align);
  });

  it("anchor", () => {
    expectTypeOf(anchor).toExtend<MarkdownItPlugin>();
    md.use(anchor);
    markdownExit.use(anchor);
  });

  it("attrs", () => {
    expectTypeOf(attrs).toExtend<MarkdownItPlugin>();
    md.use(attrs, { rule: "all" });
    markdownExit.use(attrs, { rule: "all" });
  });

  it("cjkBreaks", () => {
    expectTypeOf(cjkBreaks).toExtend<MarkdownItPlugin>();
    md.use(cjkBreaks);
    markdownExit.use(cjkBreaks);
  });

  it("cjkFriendly", () => {
    expectTypeOf(cjkFriendly).toExtend<MarkdownItPlugin>();
    md.use(cjkFriendly);
    markdownExit.use(cjkFriendly);
  });

  it("container", () => {
    expectTypeOf(container).toExtend<MarkdownItPlugin>();
    md.use(container);
    markdownExit.use(container);
  });

  it("demo", () => {
    expectTypeOf(demo).toExtend<MarkdownItPlugin>();
    md.use(demo);
    markdownExit.use(demo);
  });

  it("dl", () => {
    expectTypeOf(dl).toExtend<MarkdownItPlugin>();
    md.use(dl);
    markdownExit.use(dl);
  });

  it("embed", () => {
    expectTypeOf(embed).toExtend<MarkdownItPlugin>();
    md.use(embed);
    markdownExit.use(embed);
  });

  it("bareEmoji", () => {
    expectTypeOf(bareEmoji).toExtend<MarkdownItPlugin>();
    md.use(bareEmoji);
    markdownExit.use(bareEmoji);
  });

  it("fullEmoji", () => {
    expectTypeOf(fullEmoji).toExtend<MarkdownItPlugin>();
    md.use(fullEmoji);
    markdownExit.use(fullEmoji);
  });

  it("lightEmoji", () => {
    expectTypeOf(lightEmoji).toExtend<MarkdownItPlugin>();
    md.use(lightEmoji);
    markdownExit.use(lightEmoji);
  });

  it("field", () => {
    expectTypeOf(field).toExtend<MarkdownItPlugin>();
    md.use(field);
    markdownExit.use(field);
  });

  it("figure", () => {
    expectTypeOf(figure).toExtend<MarkdownItPlugin>();
    md.use(figure);
    markdownExit.use(figure);
  });

  it("footnote", () => {
    expectTypeOf(footnote).toExtend<MarkdownItPlugin>();
    md.use(footnote);
    markdownExit.use(footnote);
  });

  it("frontmatter", () => {
    expectTypeOf(frontmatter).toExtend<MarkdownItPlugin>();
    md.use(frontmatter);
    markdownExit.use(frontmatter);
  });

  it("icon", () => {
    expectTypeOf(icon).toExtend<MarkdownItPlugin>();
    md.use(icon);
    markdownExit.use(icon);
  });

  it("imgLazyload", () => {
    expectTypeOf(imgLazyload).toExtend<MarkdownItPlugin>();
    md.use(imgLazyload);
    markdownExit.use(imgLazyload);
  });

  it("imgMark", () => {
    expectTypeOf(imgMark).toExtend<MarkdownItPlugin>();
    md.use(imgMark);
    markdownExit.use(imgMark);
  });

  it("imgSize", () => {
    expectTypeOf(imgSize).toExtend<MarkdownItPlugin>();
    md.use(imgSize);
    markdownExit.use(imgSize);
  });

  it("legacyImgSize", () => {
    // oxlint-disable-next-line typescript/no-deprecated -- Deprecated variant is still public API and must stay engine-compatible.
    expectTypeOf(legacyImgSize).toExtend<MarkdownItPlugin>();
    // oxlint-disable-next-line typescript/no-deprecated -- Deprecated variant is still public API and must stay engine-compatible.
    md.use(legacyImgSize);
    // oxlint-disable-next-line typescript/no-deprecated -- Deprecated variant is still public API and must stay engine-compatible.
    markdownExit.use(legacyImgSize);
  });

  it("obsidianImgSize", () => {
    expectTypeOf(obsidianImgSize).toExtend<MarkdownItPlugin>();
    md.use(obsidianImgSize);
    markdownExit.use(obsidianImgSize);
  });

  it("include", () => {
    expectTypeOf(include).toExtend<MarkdownItPlugin>();
    md.use(include);
    markdownExit.use(include);
  });

  it("inlineRule", () => {
    expectTypeOf(inlineRule).toExtend<MarkdownItPlugin>();
    md.use(inlineRule);
    markdownExit.use(inlineRule);
  });

  it("ins", () => {
    expectTypeOf(ins).toExtend<MarkdownItPlugin>();
    md.use(ins);
    markdownExit.use(ins);
  });

  it("katex", () => {
    expectTypeOf(katexPlugin).toExtend<MarkdownItPlugin>();
    md.use(katexPlugin, { delimiters: "dollars" });
    markdownExit.use(katexPlugin, { delimiters: "dollars" });
    md.use(katexPlugin<TestKatexEnv>, { delimiters: "dollars" });
    markdownExit.use(katexPlugin<TestKatexEnv>, { delimiters: "dollars" });
  });

  it("katex-slim", () => {
    expectTypeOf(katexSlim).toExtend<MarkdownItPlugin>();
    md.use(katexSlim, { delimiters: "dollars" });
    markdownExit.use(katexSlim, { delimiters: "dollars" });
    md.use(katexSlim<TestKatexEnv>, { delimiters: "dollars" });
    markdownExit.use(katexSlim<TestKatexEnv>, { delimiters: "dollars" });
  });

  it("layout", () => {
    expectTypeOf(layout).toExtend<MarkdownItPlugin>();
    md.use(layout);
    markdownExit.use(layout);
  });

  it("mark", () => {
    expectTypeOf(mark).toExtend<MarkdownItPlugin>();
    md.use(mark);
    markdownExit.use(mark);
  });

  it("mathjax", () => {
    expectTypeOf(syncMathjax).toExtend<MarkdownItPlugin>();
    md.use(syncMathjax, { output: "chtml" });
    markdownExit.use(syncMathjax, { output: "chtml" });
  });

  it("mathjax-slim", () => {
    expectTypeOf(syncMathjaxSlim).toExtend<MarkdownItPlugin>();
    md.use(syncMathjaxSlim, { output: "chtml" });
    markdownExit.use(syncMathjaxSlim, { output: "chtml" });
  });

  it("mathjax/async", () => {
    expectTypeOf(asyncMathjax).toBeFunction();
    md.use(asyncMathjax, null as unknown as Parameters<typeof asyncMathjax>[1]);
    markdownExit.use(asyncMathjax, null as unknown as Parameters<typeof asyncMathjax>[1]);
  });

  it("mathjax-slim/async", () => {
    expectTypeOf(asyncMathjaxSlim).toBeFunction();
    md.use(asyncMathjaxSlim, null as unknown as Parameters<typeof asyncMathjaxSlim>[1]);
    markdownExit.use(asyncMathjaxSlim, null as unknown as Parameters<typeof asyncMathjaxSlim>[1]);
  });

  it("plantuml", () => {
    expectTypeOf(plantuml).toExtend<MarkdownItPlugin>();
    md.use(plantuml);
    markdownExit.use(plantuml);
  });

  it("ruby", () => {
    expectTypeOf(ruby).toExtend<MarkdownItPlugin>();
    md.use(ruby);
    markdownExit.use(ruby);
  });

  it("snippet", () => {
    expectTypeOf(snippet).toExtend<MarkdownItPlugin>();
    md.use(snippet);
    markdownExit.use(snippet);
  });

  it("spoiler", () => {
    expectTypeOf(spoiler).toExtend<MarkdownItPlugin>();
    md.use(spoiler);
    markdownExit.use(spoiler);
  });

  it("stylize", () => {
    expectTypeOf(stylize).toExtend<MarkdownItPlugin>();
    md.use(stylize);
    markdownExit.use(stylize);
  });

  it("sub", () => {
    expectTypeOf(sub).toExtend<MarkdownItPlugin>();
    md.use(sub);
    markdownExit.use(sub);
  });

  it("sup", () => {
    expectTypeOf(sup).toExtend<MarkdownItPlugin>();
    md.use(sup);
    markdownExit.use(sup);
  });

  it("tab", () => {
    expectTypeOf(tab).toExtend<MarkdownItPlugin>();
    md.use(tab);
    markdownExit.use(tab);
  });

  it("tasklist", () => {
    expectTypeOf(tasklist).toExtend<MarkdownItPlugin>();
    md.use(tasklist);
    markdownExit.use(tasklist);
  });

  it("tex", () => {
    expectTypeOf(tex).toExtend<MarkdownItPlugin>();
    md.use(tex);
    markdownExit.use(tex);
  });

  it("uml", () => {
    expectTypeOf(uml).toExtend<MarkdownItPlugin>();
    md.use(uml);
    markdownExit.use(uml);
  });

  it("requires the async MathJax instance", () => {
    expectTypeOf(asyncMathjax).toBeFunction();
    // @ts-expect-error the MathJax instance is required
    asyncMathjax(md);
    // @ts-expect-error the MathJax instance is required
    asyncMathjaxSlim(md);
  });
});
