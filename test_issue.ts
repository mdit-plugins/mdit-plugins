import MarkdownIt from 'markdown-it';
import { mark } from '@mdit/plugin-mark';
import { attrs } from './packages/attrs/src/plugin.js';

const md = MarkdownIt({ html: true, linkify: true, typographer: true })
  .use(mark)
  .use(attrs);

// Test case 1: mark followed by attrs
const src1 = "==text=={.desc}";
console.log("Test 1:", src1);
try {
  const result = md.render(src1);
  console.log("✓ Success");
  console.log(result);
} catch (e: any) {
  console.error("✗ Error:", e.message);
}

// Test case 2: The full example
const src2 = `[Zhi-Guang Lu, Guo-Qing Tian, Xin-You Lü, and ==Cheng Shang==, _Topological Quantum Batteries_, **Phys. Rev. Lett.** **134**, 180401 (2025).](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.134.180401)

This work was featured in [PRL Trending](https://x.com/PhysRevLett/status/1924474721149542443), highlighted in a Press Release by [RIKEN](https://www.riken.jp/en/news_pubs/research_news/pr/2025/20250513_2/index.html), and presented as an Invited Talk at the [21st International Workshop on Pseudo-Hermitian Hamiltonians in Quantum Physics (PHHQP-XXI)](https://events.physics.uoc.gr/event/1/page/5-speakers), Chania, Greece. As of February 2026, this study has 82 citations on Google Scholar. {.desc}`;

console.log("\n\nTest 2: Full example");
try {
  const result = md.render(src2);
  console.log("✓ Success");
} catch (e: any) {
  console.error("✗ Error:", e.message);
  console.error("  Stack:", e.stack);
}
