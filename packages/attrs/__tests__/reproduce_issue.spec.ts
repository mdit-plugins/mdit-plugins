import MarkdownIt from "markdown-it";
import { mark } from "@mdit/plugin-mark";
import { describe, expect, it } from "vitest";

import { attrs } from "../src/index.js";

describe("reproduce issue", () => {
  it("test 1 - simple mark with attrs", () => {
    const md = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mark).use(attrs);
    const src = "==text=={.desc}";
    console.log("Test 1 result:", md.render(src));
    expect(() => md.render(src)).not.toThrow();
  });
  
  it("test 2 - full example from issue", () => {
    const md = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mark).use(attrs);
    const source = `[Zhi-Guang Lu, Guo-Qing Tian, Xin-You Lü, and ==Cheng Shang==, _Topological Quantum Batteries_, **Phys. Rev. Lett.** **134**, 180401 (2025).](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.134.180401)

This work was featured in [PRL Trending](https://x.com/PhysRevLett/status/1924474721149542443), highlighted in a Press Release by [RIKEN](https://www.riken.jp/en/news_pubs/research_news/pr/2025/20250513_2/index.html), and presented as an Invited Talk at the [21st International Workshop on Pseudo-Hermitian Hamiltonians in Quantum Physics (PHHQP-XXI)](https://events.physics.uoc.gr/event/1/page/5-speakers), Chania, Greece. As of February 2026, this study has 82 citations on Google Scholar. {.desc}`;
    expect(() => md.render(source)).not.toThrow();
  });
  
  it("test 3 - with trailing backslash", () => {
    const md = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mark).use(attrs);
    const source = `[Zhi-Guang Lu, Guo-Qing Tian, Xin-You Lü, and ==Cheng Shang==, _Topological Quantum Batteries_, **Phys. Rev. Lett.** **134**, 180401 (2025).](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.134.180401)

This work was featured in [PRL Trending](https://x.com/PhysRevLett/status/1924474721149542443), highlighted in a Press Release by [RIKEN](https://www.riken.jp/en/news_pubs/research_news/pr/2025/20250513_2/index.html), and presented as an Invited Talk at the [21st International Workshop on Pseudo-Hermitian Hamiltonians in Quantum Physics (PHHQP-XXI)](https://events.physics.uoc.gr/event/1/page/5-speakers), Chania, Greece. As of February 2026, this study has 82 citations on Google Scholar. {.desc}\\
`;
    expect(() => md.render(source)).not.toThrow();
  });
  
  it("test 4 - dump tokens", () => {
    const md = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mark).use(attrs);
    const source = `[==mark==, _em_](https://example.com)

text {.desc}`;
    
    // Dump token structure
    const tokens = md.parse(source, {});
    for (const token of tokens) {
      console.log(`Token: ${token.type}`);
      if (token.children) {
        for (const child of token.children) {
          console.log(`  Child: ${child.type} nesting=${child.nesting} content="${child.content?.substring(0, 30)}"`);
        }
      }
    }
    expect(() => md.render(source)).not.toThrow();
  });
});
