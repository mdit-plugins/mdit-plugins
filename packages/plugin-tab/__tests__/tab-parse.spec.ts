import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tab } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(tab);

describe("tab parsing", () => {
  describe("fenced code blocks", () => {
    it("should not treat `@tab` inside a fenced code block as a tab marker", () => {
      const source = `:::tabs
@tab A

\`\`\`
@tab B
\`\`\`

text
:::
`;
      const result = markdownIt.render(source);

      // only the real marker creates a tab
      expect(result.match(/class="tabs-tab-button(?: active)?"/g)).toHaveLength(1);
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="0">A</button>',
      );
      // the fenced code block is kept intact as the first tab content
      expect(result).toContain("<pre><code>@tab B\n</code></pre>");
      expect(result).toContain("<p>text</p>");
    });

    it("should not treat `:::` inside a fenced code block as the container closing marker", () => {
      const source = `:::tabs
@tab A

\`\`\`
:::
\`\`\`

@tab B
x
:::
`;
      const result = markdownIt.render(source);

      expect(result.match(/class="tabs-tab-button(?: active)?"/g)).toHaveLength(2);
      // the fenced code block stays inside the first tab
      expect(result).toContain("<pre><code>:::\n</code></pre>");
      // the second tab is parsed normally
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="1">B</button>',
      );
      expect(result).toContain("<p>x</p>");
    });
  });

  describe("outdented content", () => {
    it("should end the current tab item on an outdented line", () => {
      const source = `:::tabs
  @tab A
outdented content
@tab B
b
:::

after
`;
      const result = markdownIt.render(source);

      // both tab markers are parsed although the first one is indented
      expect(result.match(/class="tabs-tab-button(?: active)?"/g)).toHaveLength(2);
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="0">A</button>',
      );
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="1">B</button>',
      );
      // the second tab content is not swallowed
      expect(result).toContain("<p>b</p>");
      // the outdented line is outside every tab item, so it is not rendered
      expect(result).not.toContain("outdented content");
      // parsing continues normally after the container
      expect(result).toContain("<p>after</p>");
    });
  });
});
