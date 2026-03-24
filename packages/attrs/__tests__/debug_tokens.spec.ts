import MarkdownIt from "markdown-it";
import { mark } from "@mdit/plugin-mark";
import { describe, it, expect } from "vitest";

import { attrs } from "../src/index.js";

describe("debug tokens", () => {
  it("dump tokens before AND after attrs processing", () => {
    const mdNoAttrs = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mark);
    const mdWithAttrs = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mark).use(attrs);

    // First, check what tokens look like WITHOUT attrs for the second paragraph
    const source = `test {.desc}`;

    console.log("\n=== Without attrs ===");
    const tokens = mdNoAttrs.parse(source, {});
    for (const t of tokens) {
      console.log(`${t.type}`);
      if (t.children) {
        t.children.forEach((c, i) => {
          console.log(`  [${i}] type=${c.type} level=${c.level} nesting=${c.nesting} content="${c.content?.substring(0,60)}"`);
        });
      }
    }

    // Then test rendering with attrs
    console.log("\n=== With attrs ===");
    console.log("Rendered:", mdWithAttrs.render(source));
  });
  
  it("test attrs with closing tag at index 0", () => {
    // This would be a pathological case: inline token whose first child is a closing tag
    // followed by text starting with {
    const md = MarkdownIt().use(attrs);
    
    // This won't happen in practice but let's see how the rule handles it
    const source = "*em*{.c}";
    console.log("Result:", md.render(source));
    expect(() => md.render(source)).not.toThrow();
  });
  
  it("reproduce - link with attrs in next paragraph", () => {
    const md = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mark).use(attrs);
    
    const source = `[link with ==mark== inside](https://example.com)

Second paragraph. {.desc}`;
    
    console.log("Result:", md.render(source));
    expect(() => md.render(source)).not.toThrow();
  });
  
  it("find the crashing case", () => {
    const md = MarkdownIt({ html: true, linkify: true, typographer: true }).use(mark).use(attrs);
    
    // Try various inline attribute cases that might cause issues
    const cases = [
      "==mark=={.c}",  // mark followed immediately by attrs
      "*em*{.c}",  // em followed by attrs
      "**bold**{.c}",  // strong followed by attrs
      "[link](url){.c}",  // link followed by attrs
      "==mark== text {.c}",  // mark, then text, then attrs (inline)
      "end paragraph {.c}",  // block level attrs
    ];
    
    for (const src of cases) {
      console.log(`Testing: "${src}"`);
      try {
        const result = md.render(src);
        console.log(`  → "${result.trim()}"`);
      } catch (e: any) {
        console.error(`  → THROWS: ${e.message}`);
      }
    }
  });
});
