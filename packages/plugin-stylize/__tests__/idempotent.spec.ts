import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type { MarkdownItStylizeOptions } from "../src/index.js";
import { stylize } from "../src/index.js";

describe("stylize repeated use", () => {
  it("should not apply the replacer twice", () => {
    const options: MarkdownItStylizeOptions = {
      config: [
        {
          matcher: "MUST",
          replacer: ({ tag, attrs, content }) => ({
            tag,
            attrs,
            content: `${content}!`,
          }),
        },
      ],
    };
    const source = "**MUST**";
    const single = new MarkdownIt().use(stylize, options).render(source);
    const doubled = new MarkdownIt().use(stylize, options).use(stylize, options).render(source);

    expect(doubled).toBe(single);
    expect(doubled).toContain("MUST!");
    expect(doubled).not.toContain("MUST!!");
  });
});
