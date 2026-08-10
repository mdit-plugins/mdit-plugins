import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tab } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(tab);

describe(tab, () => {
  it("should render single block", () => {
    const sources = [
      `
::: tabs
@tab test
A **bold** text.
:::
`,
      `
::: tabs

@tab test

A **bold** text.

:::
`,
    ];

    sources.forEach((item) => {
      const result = markdownIt.render(item);

      expect(result).toMatchSnapshot();
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="0">test</button>',
      );
      expect(result).toContain("<p>A <strong>bold</strong> text.</p>");
    });
  });

  it("should render multiple block", () => {
    const sources = [
      `
::: tabs
@tab test1
A **bold** text 1.
@tab test2
A **bold** text 2.
:::
`,
      `
::: tabs

@tab test1

A **bold** text 1.

@tab test2

A **bold** text 2.

:::
`,
    ];

    sources.forEach((item) => {
      const result = markdownIt.render(item);

      expect(result).toMatchSnapshot();
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="0">test1</button>',
      );
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="1">test2</button>',
      );
      expect(result).toContain("<p>A <strong>bold</strong> text 1.</p>");
      expect(result).toContain("<p>A <strong>bold</strong> text 2.</p>");
    });
  });

  it("should ignore other markers", () => {
    const sources = [
      `
::: tabs
@tab test1
A **bold** text 1.
@tac
@tab test2
A **bold** text 2.
:::
`,
    ];

    sources.forEach((item) => {
      const result = markdownIt.render(item);

      expect(result).toMatchSnapshot();
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="0">test1</button>',
      );
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="1">test2</button>',
      );
      expect(result).toContain("<p>A <strong>bold</strong> text 1.\n@tac</p>");
      expect(result).toContain("<p>A <strong>bold</strong> text 2.</p>");
    });
  });

  describe("should support tabs id", () => {
    it("simple id", () => {
      const source = [
        `
::: tabs#event
@tab test
A **bold** text.
:::
`,
        `
::: tabs#event

@tab test

A **bold** text.

:::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toContain('data-id="event');
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="0">test</button>',
        );
        expect(result).toContain("<p>A <strong>bold</strong> text.</p>");
      });
    });

    it("should not escape single quote in container and content id", () => {
      const result = markdownIt.render("::: tabs#it's\n@tab A#tab's\ncontent\n:::\n");

      expect(result).toContain('data-id="it\'s"');
      expect(result).toContain('data-id="tab\'s"');
      expect(result).not.toContain("it&#39;s");
    });

    it("id with space", () => {
      const source = [
        `
::: tabs#id with space
@tab test
A **bold** text.
:::
`,
        `
::: tabs#id with space

@tab test

A **bold** text.

:::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toContain('data-id="id with space');
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="0">test</button>',
        );
        expect(result).toContain("<p>A <strong>bold</strong> text.</p>");
      });
    });

    it("should handle tabs with only spaces before ID", () => {
      const source = `
::: tabs   #id
@tab test
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).toContain('data-id="id"');
    });

    it("should handle tabs with empty ID", () => {
      const source = `
::: tabs#
@tab test
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).toContain('class="tabs-tabs-wrapper"');
      expect(result).not.toContain("data-id");
    });

    it("should pass container id to custom openRender via info.id", () => {
      const mdInstance = new MarkdownIt().use(tab, {
        name: "tabs",
        openRender: (info) => `<div data-info-id="${info.id}">`,
        closeRender: () => "</div>",
      });

      const result = mdInstance.render(`
::: tabs#event
@tab test
content
:::
`);

      expect(result).toContain('<div data-info-id="event">');
    });

    it("should pass undefined container id to custom openRender when no id is set", () => {
      const mdInstance = new MarkdownIt().use(tab, {
        name: "tabs",
        openRender: (info) => `<div data-info-id="${info.id}">`,
        closeRender: () => "</div>",
      });

      const result = mdInstance.render(`
::: tabs
@tab test
content
:::
`);

      expect(result).toContain('<div data-info-id="undefined">');
    });
  });

  describe("should support tab id", () => {
    it("simple id", () => {
      const source = [
        `
::: tabs
@tab test#id
A **bold** text.
:::
`,
        `
::: tabs

@tab test#id

A **bold** text.

:::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toContain('data-id="id');
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="0" data-id="id">test</button>',
        );
        expect(result).toContain("<p>A <strong>bold</strong> text.</p>");
      });
    });

    it("id with space", () => {
      const source = [
        `
::: tabs
@tab test#id with space
A **bold** text.
:::
`,
        `
::: tabs

@tab test#id with space

A **bold** text.

:::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toContain('data-id="id with space');
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="0" data-id="id with space">test</button>',
        );
        expect(result).toContain("<p>A <strong>bold</strong> text.</p>");
      });
    });

    it("id with multiple #", () => {
      const source = [
        `
::: tabs
@tab test#abc#def
A **bold** text.
:::
`,
        `
::: tabs

@tab test#abc#def

A **bold** text.

:::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="0" data-id="def">test#abc</button>',
        );
        expect(result).toContain("<p>A <strong>bold</strong> text.</p>");
      });
    });

    it("id with escape #", () => {
      const source = [
        `
::: tabs
@tab test\\#abc
A **bold** text.
:::
`,
        `
::: tabs

@tab test\\#abc

A **bold** text.

:::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="0">test#abc</button>',
        );
        expect(result).toContain("<p>A <strong>bold</strong> text.</p>");
      });
    });

    it("should handle tab with trailing spaces but no ID", () => {
      const source = `
::: tabs
@tab test  
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="0">test</button>',
      );
      expect(result).not.toContain("data-id");
    });

    it("should handle tab with even escaped #", () => {
      const source = `
::: tabs
@tab title\\\\#id
content
:::
`;
      const result = markdownIt.render(source);

      // Even number of escapes before # means it IS an ID separator.
      expect(result).toContain('data-id="id"');
    });

    it("should handle tab with ID and title", () => {
      const source = `
::: tabs
@tab title #id
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).toContain('data-id="id"');
    });
  });

  describe("active", () => {
    it("should handle :active", () => {
      const source = [
        `
::: tabs
@tab test1
A **bold** text 1.
@tab:active test2
A **bold** text 2.
:::
`,
        `
::: tabs

@tab test1

A **bold** text 1.

@tab:active test2

A **bold** text 2.

:::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="0">test1</button>',
        );
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button active" data-tab="1" data-active>test2</button>',
        );
        expect(result).toContain("<p>A <strong>bold</strong> text 1.</p>");
        expect(result).toContain("<p>A <strong>bold</strong> text 2.</p>");
      });
    });

    it("should resolve first :active", () => {
      const source = [
        `
::: tabs
@tab test1
A **bold** text 1.
@tab:active test2
A **bold** text 2.
@tab:active test3
A **bold** text 3.
:::
`,
        `
::: tabs

@tab test1

A **bold** text 1.

@tab:active test2

A **bold** text 2.

@tab:active test3

A **bold** text 3.

:::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="0">test1</button>',
        );
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button active" data-tab="1" data-active>test2</button>',
        );
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="2">test3</button>',
        );
        expect(result).toContain("<p>A <strong>bold</strong> text 1.</p>");
        expect(result).toContain("<p>A <strong>bold</strong> text 2.</p>");
        expect(result).toContain("<p>A <strong>bold</strong> text 3.</p>");
      });
    });

    it("should handle multiple active tabs (only first one stays active)", () => {
      const source = `
::: tabs
@tab:active 1
1
@tab:active 2
2
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button active" data-tab="0" data-active>1</button>',
      );
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="1">2</button>',
      );
    });
  });

  describe("hidden content", () => {
    it("should ignore items before first @tab", () => {
      const source = [
        `
::: tabs
bala bala
@tab test\\#abc
A **bold** text.
:::
`,
        `
::: tabs

bala bala

@tab test\\#abc

A **bold** text.

:::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toContain(
          '<button type="button" class="tabs-tab-button" data-tab="0">test#abc</button>',
        );
        expect(result).not.contain("bala bala");
        expect(result).toContain("<p>A <strong>bold</strong> text.</p>");
      });
    });

    it("should hide deep content before first tab", () => {
      const source = `
::: tabs

- list

@tab test
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).not.toContain("list");
      expect(result).toContain("content");
    });
  });

  it("should work with multiple instance", () => {
    const markdownItWithMultipleInstance = new MarkdownIt({ linkify: true }).use(tab).use(tab, {
      name: "test",
      openRender: () => "<TestTabs>",
      closeRender: () => "</TestTabs>",
      tabOpenRender: () => "<TestTab>",
      tabCloseRender: () => "</TestTab>",
    });

    const source = [
      `
::: tabs
@tab test1
A **bold** text 1.
@tab:active test2
A **bold** text 2.
:::
::: test
@tab test3
A **bold** text 3.
@tab:active test4
A **bold** text 4.
:::
`,
      `
::: tabs

@tab test1

A **bold** text 1.

@tab:active test2

A **bold** text 2.

:::

::: test

@tab test3

A **bold** text 3.

@tab:active test4

A **bold** text 4.

:::
`,
    ];

    source.forEach((item) => {
      const result = markdownItWithMultipleInstance.render(item);

      expect(result).toMatchSnapshot();
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="0">test1</button>',
      );
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button active" data-tab="1" data-active>test2</button>',
      );
      expect(result).toContain("<p>A <strong>bold</strong> text 1.</p>");
      expect(result).toContain("<TestTab><p>A <strong>bold</strong> text 3.</p>\n</TestTab>");

      expect(result).toContain("<p>A <strong>bold</strong> text 2.</p>");
      expect(result).toContain("<TestTab><p>A <strong>bold</strong> text 4.</p>\n</TestTab>");
    });
  });

  it("should not render", () => {
    const source = [
      `
:: tabs
bala bala
@tab test\\#abc
A **bold** text.
::
`,
    ];

    source.forEach((item) => {
      const result = markdownIt.render(item);

      expect(result).toMatchSnapshot();
      expect(result).toContain("@tab");
    });
  });

  describe("marker", () => {
    it("should not match @tab without space or title", () => {
      const source = `
::: tabs
@tab valid
Valid content
@tab
@tab 
@tabtitle
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).toContain(`\
Valid content
@tab
@tab
@tabtitle\
`);
    });

    it("should handle tab with partial active marker", () => {
      const source = `
::: tabs
@tab valid
content
@tab:act
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).toContain("@tab:act");
    });

    it("should support being interrupted by tab", () => {
      const source = `
::: tabs
@tab test
- item
  @tab test2
  content
:::
`;
      // The second @tab has a deeper indent and is inside a list, so it should not be treated as a tab marker for parent tabs.
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).not.toContain('data-tab="1"');
      expect(result).toContain("@tab test2");
    });
  });

  describe("starting correctly", () => {
    it("should work with inline tokens ahead", () => {
      const source = `
test
::: tabs
bala bala
@tab test\\#abc
A **bold** text.
:::
`;

      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).toContain(`<p>test</p>`);
      expect(result).not.toContain("bala bala");
    });

    it("should not match tabs with invalid content after name", () => {
      const source = `
::: tabs-invalid
@tab test
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).toContain("::: tabs-invalid");
    });

    it("should support being interrupted by tabs", () => {
      const source = `
- item
  ::: tabs
  @tab test
  content
  :::
`;
      const result = markdownIt.render(source);

      expect(result).toContain("tabs-tabs-wrapper");
    });
  });

  describe("ending correctly", () => {
    it("should end container when a negative indent text found", () => {
      const source = [
        `
  ::: tabs
  bala bala
  @tab test\\#abc
  A **bold** text.

test
`,
        `
- item 1

  ::: tabs
  bala bala
  @tab test\\#abc
  A **bold** text.

test
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
        expect(result).toMatch(/<p>test<\/p>\n$/u);
      });
    });

    it("should not end when ending marker number is less than start", () => {
      const result = markdownIt.render(`
:::: tabs
@tab test
A **bold** text.
:::
@tab test2
A **bold** text 2.
::::
`);

      expect(result).toMatchSnapshot();
      expect(result).toContain(":::");
    });

    it("should handle tabs closing with more markers", () => {
      const source = `
::: tabs
@tab test
content
:::::
`;
      const result = markdownIt.render(source);

      expect(result).not.toContain(":");
      expect(result).toContain("tabs-tabs-wrapper");
    });

    it("should not close tabs with trailing content", () => {
      const source = `
::: tabs
@tab test
content
::: invalid
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).toMatch(/<\/div>\s*$/u);
      expect(result).toContain("::: invalid");
    });
  });

  describe("nesting", () => {
    it("should render nested tabs", () => {
      const source = [
        `
:::: tabs
@tab test1

A text 1.

@tab test2
  ::: tabs
  @tab sub-test1
  A **bold** text 1.
  @tab:active sub-test2
  A **bold** text 2.
  :::
@tab:active test3
A **bold** text 3.
::::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
      });
    });

    it("should support nesting with others", () => {
      const source = [
        `
> :::: tabs
> @tab test1
> 
> A text 1.
> 
> @tab test2
>   ::: tabs
>   @tab sub-test1
>   A **bold** text 1.
>   @tab:active sub-test2
>   A **bold** text 2.
>   :::
> @tab:active test3
> A **bold** text 3.
> ::::
`,
        `
- :::: tabs
  @tab test1
  
  A text 1.
  
  @tab test2
    ::: tabs
    @tab sub-test1
    A **bold** text 1.
    @tab:active sub-test2
    A **bold** text 2.
    :::
  @tab:active test3
  A **bold** text 3.
  ::::
`,
        `
:::: tabs
@tab test1

A text 1.

@tab test2

- item1

  ::: tabs
  @tab sub-test1
  A **bold** text 1.
  @tab:active sub-test2
  A **bold** text 2.
  :::
@tab:active test3
A **bold** text 3.
::::
`,
      ];

      source.forEach((item) => {
        const result = markdownIt.render(item);

        expect(result).toMatchSnapshot();
      });
    });

    it("should handle nested tabs with more depth", () => {
      const source = `
::: tabs
@tab root
::: tabs
@tab nested
content
:::
:::
`;
      const result = markdownIt.render(source);

      // the second tabs do no have any tab content
      expect(result).toMatchSnapshot();
      expect(result).toContain("tabs-tabs-wrapper");
    });

    it("should handle complex nested content", () => {
      const source = `
::: tabs
- ::: tabs
  @tab nested
  :::
@tab test
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).not.toContain("nested");
      expect(result).toContain("content");
    });

    it("should not parse @tab in fence content", () => {
      const sources = `
::: tabs
@tab test

To declare tabs, use the following syntax:
\`\`\`
@tab
\`\`\`
:::
`;

      const result = markdownIt.render(sources);

      expect(result).toMatchSnapshot();
      expect(result).toContain(
        `\
<pre><code>@tab
</code></pre>
`,
      );
      expect(result).toContain('data-tab="0"');
      expect(result).not.toContain('data-tab="1"');
    });
  });

  it("should handle auto-close", () => {
    const sources = [
      `
::: tabs
@tab test1
A **bold** text 1.
@tab test2
A **bold** text 2.
`,
      `
::: tabs

@tab test1

A **bold** text 1.

@tab test2

A **bold** text 2.
`,
    ];
    const closedSources = [
      `
::: tabs
@tab test1
A **bold** text 1.
@tab test2
A **bold** text 2.
:::
`,
      `
::: tabs

@tab test1

A **bold** text 1.

@tab test2

A **bold** text 2.

:::
`,
    ];

    sources.forEach((item, index) => {
      const result = markdownIt.render(item);

      expect(result).toMatchSnapshot();
      expect(result).toBe(markdownIt.render(closedSources[index]));
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="0">test1</button>',
      );
      expect(result).toContain(
        '<button type="button" class="tabs-tab-button" data-tab="1">test2</button>',
      );
      expect(result).toContain("<p>A <strong>bold</strong> text 1.</p>");
      expect(result).toContain("<p>A <strong>bold</strong> text 2.</p>");
    });
  });

  describe("title escaping", () => {
    it("should not double-escape special HTML characters", () => {
      const source = `
::: tabs
@tab A & B
content
@tab C < D > E
content
@tab "quoted" & 'apos'
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      // Should be single-escaped, not double-escaped
      expect(result).toContain("A &amp; B");
      expect(result).not.toContain("&amp;amp;");

      expect(result).toContain("C &lt; D &gt; E");
      expect(result).not.toContain("&amp;lt;");
      expect(result).not.toContain("&amp;gt;");

      expect(result).toContain("&quot;quoted&quot; &amp; 'apos'");
    });

    it("should render inline markdown in title", () => {
      const source = `
::: tabs
@tab **bold** title
content
@tab *italic* title
content
@tab \`code\` title
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      expect(result).toContain("<strong>bold</strong> title");
      expect(result).toContain("<em>italic</em> title");
      expect(result).toContain("<code>code</code> title");
    });

    it("should not double-escape title with id containing special chars", () => {
      const source = `
::: tabs
@tab A & B#some-id
content
:::
`;
      const result = markdownIt.render(source);

      expect(result).toMatchSnapshot();
      // Title should be single-escaped, id should be escaped
      expect(result).toContain("A &amp; B");
      expect(result).not.toContain("&amp;amp;");
      expect(result).toContain('data-id="some-id"');
    });
  });

  describe("render consistency", () => {
    it("should produce identical output when the same token array is rendered multiple times", () => {
      const source = `
::: tabs
@tab test1
content 1
@tab:active test2
content 2
:::
`;
      const tokens = markdownIt.parse(source, {});
      const first = markdownIt.renderer.render(tokens, markdownIt.options, {});
      const second = markdownIt.renderer.render(tokens, markdownIt.options, {});

      expect(second).toBe(first);
    });

    it("should produce identical output for nested tabs rendered multiple times", () => {
      const source = `
::: tabs
@tab A
content A
::: tabs
@tab C
content C
:::
@tab B
content B
:::
`;
      const tokens = markdownIt.parse(source, {});
      const first = markdownIt.renderer.render(tokens, markdownIt.options, {});
      const second = markdownIt.renderer.render(tokens, markdownIt.options, {});

      expect(second).toBe(first);
    });

    it("should not throw when rendering tokens that bypassed the core rule", () => {
      const mdInstance = new MarkdownIt().use(tab);
      const tokens = mdInstance.parse("::: tabs\n@tab A\ncontent\n:::\n", {});

      // simulate tokens that were not processed by the core rule (missing tabsData)
      tokens
        .filter((token) => token.type === "tabs_tabs_open")
        .forEach((token) => {
          delete token.meta!.tabsData;
        });

      expect(() => mdInstance.renderer.render(tokens, mdInstance.options, {})).not.toThrow();
    });
  });
});
