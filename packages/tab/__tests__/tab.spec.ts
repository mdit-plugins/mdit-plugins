import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { tab } from "../src/index.js";

const markdownIt = MarkdownIt({ linkify: true }).use(tab);

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

describe("Should support tabs id", () => {
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
});

describe("Should support tab id", () => {
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
});

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

it("should work with multiple instance", () => {
  const markdownItWithMultipleInstance = MarkdownIt({ linkify: true })
    .use(tab)
    .use(tab, {
      name: "test-tabs",
      tabsOpenRenderer: () => "<TestTabs>",
      tabsCloseRenderer: () => "</TestTabs>",
      tabOpenRenderer: () => "<TestTab>",
      tabCloseRenderer: () => "</TestTab>",
    });

  const source = [
    `
::: tabs
@tab test1
A **bold** text 1.
@tab:active test2
A **bold** text 2.
:::
::: test-tabs
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

::: test-tabs

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
    expect(result).toContain(
      "<TestTab><p>A <strong>bold</strong> text 3.</p>\n</TestTab>",
    );

    expect(result).toContain("<p>A <strong>bold</strong> text 2.</p>");
    expect(result).toContain(
      "<TestTab><p>A <strong>bold</strong> text 4.</p>\n</TestTab>",
    );
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

describe("starting correctly", () => {
  it("should work with inline tokens ahead", () => {
    const source = [
      `
test
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
      expect(result).toContain(`<p>test</p>`);
    });
  });
});

describe("ending correctly", () => {
  it("should auto end container when a negative padding text found", () => {
    const source = [
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
      expect(result).toContain(`<p>test</p>`);
    });
  });
});
