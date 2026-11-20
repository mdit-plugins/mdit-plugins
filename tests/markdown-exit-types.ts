/* oxlint-disable import/max-dependencies -- This contract imports every plugin on purpose. */
import { MarkdownExit } from "markdown-exit";
/**
 * Compile-time contract: every plugin must be installable on both `markdown-it` and `markdown-exit`
 * instances without a type assertion.
 *
 * This file intentionally has no `.spec` suffix: it is never executed, only type-checked by the
 * repository lint/type-check gate (`pnpm run lint:check`). If a plugin stops being assignable to
 * either engine, the `.use()` call below fails to compile.
 */
import MarkdownIt from "markdown-it";
import type { Env } from "markdown-it";

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

const md = new MarkdownIt();
const markdownExit = new MarkdownExit();

interface TestKatexEnv extends Env {
  answer: number;
}

md.use(abbr);
markdownExit.use(abbr);
md.use(advancedLinks);
markdownExit.use(advancedLinks);
md.use(alert);
markdownExit.use(alert);
md.use(align);
markdownExit.use(align);
md.use(anchor);
markdownExit.use(anchor);
md.use(attrs, { rule: "all" });
markdownExit.use(attrs, { rule: "all" });
md.use(cjkBreaks);
markdownExit.use(cjkBreaks);
md.use(cjkFriendly);
markdownExit.use(cjkFriendly);
md.use(container);
markdownExit.use(container);
md.use(demo);
markdownExit.use(demo);
md.use(dl);
markdownExit.use(dl);
md.use(embed);
markdownExit.use(embed);
md.use(bareEmoji);
markdownExit.use(bareEmoji);
md.use(lightEmoji);
markdownExit.use(lightEmoji);
md.use(fullEmoji);
markdownExit.use(fullEmoji);
md.use(field);
markdownExit.use(field);
md.use(figure);
markdownExit.use(figure);
md.use(footnote);
markdownExit.use(footnote);
md.use(frontmatter);
markdownExit.use(frontmatter);
md.use(icon);
markdownExit.use(icon);
md.use(imgLazyload);
markdownExit.use(imgLazyload);
md.use(imgMark);
markdownExit.use(imgMark);
md.use(imgSize);
markdownExit.use(imgSize);
// oxlint-disable-next-line typescript/no-deprecated -- Deprecated variant is still public API and must stay engine-compatible.
md.use(legacyImgSize);
// oxlint-disable-next-line typescript/no-deprecated -- Deprecated variant is still public API and must stay engine-compatible.
markdownExit.use(legacyImgSize);
md.use(obsidianImgSize);
markdownExit.use(obsidianImgSize);
md.use(include);
markdownExit.use(include);
md.use(inlineRule);
markdownExit.use(inlineRule);
md.use(ins);
markdownExit.use(ins);
md.use(katexPlugin, { delimiters: "dollars" });
markdownExit.use(katexPlugin, { delimiters: "dollars" });
md.use(katexSlim, { delimiters: "dollars" });
markdownExit.use(katexSlim, { delimiters: "dollars" });
md.use(katexPlugin<TestKatexEnv>, { delimiters: "dollars" });
markdownExit.use(katexPlugin<TestKatexEnv>, { delimiters: "dollars" });
md.use(katexSlim<TestKatexEnv>, { delimiters: "dollars" });
markdownExit.use(katexSlim<TestKatexEnv>, { delimiters: "dollars" });
md.use(layout);
markdownExit.use(layout);
md.use(mark);
markdownExit.use(mark);
md.use(syncMathjax, { output: "chtml" });
markdownExit.use(syncMathjax, { output: "chtml" });
md.use(syncMathjaxSlim, { output: "chtml" });
markdownExit.use(syncMathjaxSlim, { output: "chtml" });
md.use(asyncMathjax, null as unknown as Parameters<typeof asyncMathjax>[1]);
markdownExit.use(asyncMathjax, null as unknown as Parameters<typeof asyncMathjax>[1]);
// @ts-expect-error the MathJax instance is required
asyncMathjax(md);
// @ts-expect-error the MathJax instance is required
asyncMathjaxSlim(md);
md.use(asyncMathjaxSlim, null as unknown as Parameters<typeof asyncMathjaxSlim>[1]);
markdownExit.use(asyncMathjaxSlim, null as unknown as Parameters<typeof asyncMathjaxSlim>[1]);
md.use(plantuml);
markdownExit.use(plantuml);
md.use(ruby);
markdownExit.use(ruby);
md.use(snippet);
markdownExit.use(snippet);
md.use(spoiler);
markdownExit.use(spoiler);
md.use(stylize);
markdownExit.use(stylize);
md.use(sub);
markdownExit.use(sub);
md.use(sup);
markdownExit.use(sup);
md.use(tab);
markdownExit.use(tab);
md.use(tasklist);
markdownExit.use(tasklist);
md.use(tex);
markdownExit.use(tex);
md.use(uml);
markdownExit.use(uml);
