import { escapeHtml } from "@mdit/helper";
import MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import { describe, expect, it } from "vitest";

import { demo } from "../src/index.js";

const mdContent = `\
# Heading 1

Content text.

\`\`\`js
const a = 1;
\`\`\`\
`;

describe("demo with highlight", () => {
  const highlight = (code: string, lang: string): string =>
    `<pre class="highlighted"><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;

  it("should use highlight function for the code fence", () => {
    const md = MarkdownIt({ highlight }).use(demo);
    const result = md.render(`
::: demo Title
${mdContent}
:::
`);

    expect(result).toContain('class="highlighted"');
  });

  it("should pass correct language to highlight function", () => {
    const calls: { code: string; lang: string }[] = [];
    const trackingHighlight = (code: string, lang: string): string => {
      calls.push({ code, lang });

      return highlight(code, lang);
    };

    const md = MarkdownIt({ highlight: trackingHighlight }).use(demo);

    md.render(`
::: demo Title
${mdContent}
:::
`);

    // The demo plugin should generate a fence with lang "md"
    // The inner ```js fence should also be highlighted
    const mdCall = calls.find((cc) => cc.lang === "md");

    expect(mdCall).toBeDefined();
    expect(mdCall!.code).toContain("# Heading 1");
  });

  it("should set markup on fence token for compatibility with third-party plugins", () => {
    const md = MarkdownIt().use(demo);
    const tokens = md.parse("::: demo Title\n# Hello\n:::", {});
    const fenceToken = tokens.find((tt: Token) => tt.type === "fence");

    expect(fenceToken).toBeDefined();
    expect(fenceToken!.markup).toBe("```");
    expect(fenceToken!.info).toBe("md");
  });

  it("should work with fence renderer override that checks markup", () => {
    const md = MarkdownIt();

    const originalFence = md.renderer.rules.fence!;

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];

      if (token.markup) {
        return `<div class="code-wrapper">${originalFence(tokens, idx, options, env, self)}</div>`;
      }

      return originalFence(tokens, idx, options, env, self);
    };

    md.use(demo);

    const result = md.render(`
::: demo Title
# Hello
:::
`);

    expect(result).toContain("code-wrapper");
  });
});
