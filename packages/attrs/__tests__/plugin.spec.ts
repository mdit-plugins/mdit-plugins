import { katex } from "@mdit/plugin-katex";
import { mark } from "@mdit/plugin-mark";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { attrs } from "../src/index.js";

describe("plugin compatibility", () => {
  it("should work with katex plugin", () => {
    const markdownIt = MarkdownIt({ linkify: true }).use(attrs).use(katex);

    expect(markdownIt.render("$a^{3}$")).toBe(
      '<p><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>a</mi><mn>3</mn></msup></mrow><annotation encoding="application/x-tex">a^{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span></span></span></span></span></span></span></span></p>\n',
    );
  });

  describe("should work with mark plugin", () => {
    const markdownIt = MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })
      .use(mark)
      .use(attrs);

    it("should apply attrs to mark element", () => {
      expect(markdownIt.render("==text=={.desc}")).toBe('<p><mark class="desc">text</mark></p>\n');
    });

    it("should apply block-level attrs when paragraph contains mark inside link", () => {
      const source = `[Zhi-Guang Lu, Guo-Qing Tian, Xin-You Lü, and ==Cheng Shang==, _Topological Quantum Batteries_, **Phys. Rev. Lett.** **134**, 180401 (2025).](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.134.180401)

This work was featured in [PRL Trending](https://x.com/PhysRevLett/status/1924474721149542443), highlighted in a Press Release by [RIKEN](https://www.riken.jp/en/news_pubs/research_news/pr/2025/20250513_2/index.html), and presented as an Invited Talk at the [21st International Workshop on Pseudo-Hermitian Hamiltonians in Quantum Physics (PHHQP-XXI)](https://events.physics.uoc.gr/event/1/page/5-speakers), Chania, Greece. As of February 2026, this study has 82 citations on Google Scholar. {.desc}`;

      expect(() => markdownIt.render(source)).not.toThrow();

      const result = markdownIt.render(source);

      expect(result).toContain('class="desc"');
    });

    it("should apply inline attrs to link containing mark tokens", () => {
      expect(markdownIt.render("[text with ==mark==](url){.c}")).toBe(
        '<p><a href="url" class="c">text with <mark>mark</mark></a></p>\n',
      );
    });
  });
});
