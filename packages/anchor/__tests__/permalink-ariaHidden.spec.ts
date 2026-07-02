import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { ariaHidden } from "../src/permalink/index.js";
import { anchor } from "../src/plugin.js";

const md = (options?: Record<string, unknown>): MarkdownIt =>
  MarkdownIt({ html: true }).use(anchor, options as Parameters<typeof anchor>[1]);

describe("permalink.ariaHidden", () => {
  it("should render default", () => {
    expect(md({ permalink: ariaHidden() }).render("# H1")).toBe(
      '<h1 id="h1" tabindex="-1">H1 <a class="header-anchor" href="#h1" aria-hidden="true">#</a></h1>\n',
    );
  });

  it("should render with HTML symbol", () => {
    expect(md({ permalink: ariaHidden({ symbol: '<i class="icon"></i>' }) }).render("# H1")).toBe(
      '<h1 id="h1" tabindex="-1">H1 <a class="header-anchor" href="#h1" aria-hidden="true"><i class="icon"></i></a></h1>\n',
    );
  });
});
