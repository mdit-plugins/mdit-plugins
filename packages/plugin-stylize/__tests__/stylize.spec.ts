import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import type {
  MarkdownItStylizeConfig,
  MarkdownItStylizeOptions,
  MarkdownItStylizeResult,
} from "../src/index.js";
import { stylize } from "../src/index.js";

const addStrongAttr = (md: MarkdownItType, attr: [string, number]): void => {
  md.core.ruler.before("stylize_tag", "test-strong-attr", (state) => {
    for (const token of state.tokens) {
      if (token.type !== "inline" || !token.children) continue;

      for (const child of token.children)
        if (child.tag === "strong" && child.nesting === 1) child.attrSet(attr[0], attr[1]);
    }
  });
};

describe(stylize, () => {
  describe("global config", () => {
    const options: MarkdownItStylizeOptions = {
      config: [
        {
          matcher: "MUST",
          replacer: ({ tag, attrs, content }): MarkdownItStylizeResult | undefined => {
            if (tag === "strong" || tag === "em") {
              return {
                tag,
                attrs: { ...attrs, class: "badge tip" },
                content,
              };
            }

            return undefined;
          },
        },
        {
          matcher: "SHOULD",
          replacer: ({ tag, attrs, content }): MarkdownItStylizeResult | undefined => {
            if (tag === "strong") {
              return {
                tag,
                attrs: { ...attrs, title: "should" },
                content,
              };
            }

            return undefined;
          },
        },
        {
          matcher: "MAY",
          replacer: ({ tag, attrs }): MarkdownItStylizeResult | undefined => {
            if (tag === "em") return { tag, attrs, content: "MAY:)" };

            return undefined;
          },
        },
        {
          matcher: "NOT",
          replacer: ({ tag, attrs, content }): MarkdownItStylizeResult | undefined => {
            if (tag === "em") return { tag, attrs, content: `MUST_${content}` };

            return undefined;
          },
        },
        {
          matcher: /n't$/,
          replacer: ({ tag, attrs, content }): MarkdownItStylizeResult | undefined => {
            if (tag === "em") {
              return {
                tag: "span",
                attrs: { ...attrs, style: `color:red;${attrs.style ?? ""}` },
                content,
              };
            }

            return undefined;
          },
        },
      ],
      localConfigGetter: (env) => (env as { stylize?: MarkdownItStylizeConfig[] }).stylize ?? null,
    };

    const markdownIt = new MarkdownIt({ linkify: true }).use(stylize, options);

    it("should render MUST", () => {
      expect(markdownIt.render(`**MUST**`)).toBe(
        '<p><strong class="badge tip">MUST</strong></p>\n',
      );
      expect(markdownIt.render(`*MUST*`)).toBe('<p><em class="badge tip">MUST</em></p>\n');
    });

    it("should render SHOULD", () => {
      expect(markdownIt.render(`**SHOULD**`)).toBe(
        '<p><strong title="should">SHOULD</strong></p>\n',
      );
      expect(markdownIt.render(`*SHOULD*`)).toBe("<p><em>SHOULD</em></p>\n");
    });

    it("should render MAY", () => {
      expect(markdownIt.render(`**MAY**`)).toBe("<p><strong>MAY</strong></p>\n");
      expect(markdownIt.render(`*MAY*`)).toBe("<p><em>MAY:)</em></p>\n");
    });

    it("should render NOT", () => {
      expect(markdownIt.render(`**NOT**`)).toBe("<p><strong>NOT</strong></p>\n");
      expect(markdownIt.render(`*NOT*`)).toBe("<p><em>MUST_NOT</em></p>\n");
    });

    it("should render negative words with red", () => {
      expect(markdownIt.render(`I _don't_ want to talk him, he _isn't_ a friend of mine.`)).toBe(`\
<p>I <span style="color:red;">don't</span> want to talk him, he <span style="color:red;">isn't</span> a friend of mine.</p>
`);
    });

    it("should render lines with MUST", () => {
      expect(
        markdownIt.render(
          "**MUST** at the beginning of the line\n\n" +
            "__MUST__ at the beginning of the line\n\n" +
            "At the end of the line *MUST*\n\n" +
            "At the end of the line _MUST_\n\n" +
            "Some content with **MUST** and some words.\n\n" +
            "Some content with __MUST__ and some words.\n\n",
        ),
      ).toStrictEqual(
        '<p><strong class="badge tip">MUST</strong> at the beginning of the line</p>\n' +
          '<p><strong class="badge tip">MUST</strong> at the beginning of the line</p>\n' +
          '<p>At the end of the line <em class="badge tip">MUST</em></p>\n' +
          '<p>At the end of the line <em class="badge tip">MUST</em></p>\n' +
          '<p>Some content with <strong class="badge tip">MUST</strong> and some words.</p>\n' +
          '<p>Some content with <strong class="badge tip">MUST</strong> and some words.</p>\n',
      );
    });

    it("should not carry lastIndex across tokens with a global regexp", () => {
      const md = new MarkdownIt().use(stylize, {
        config: [
          {
            matcher: /MUST/g,
            replacer: ({ tag, content }): MarkdownItStylizeResult => ({
              tag,
              attrs: { class: "styled" },
              content,
            }),
          },
        ],
      });

      expect(md.render("**MUST** **MUST** **MUST**")).toBe(
        '<p><strong class="styled">MUST</strong> <strong class="styled">MUST</strong> <strong class="styled">MUST</strong></p>\n',
      );
    });

    it("should render complex with SHOULD", () => {
      expect(
        markdownIt.render(
          "`**MUST**` in inline code should be rendered as is.\n\n" +
            "Other syntax like _italic_ and **bold** should work with **MUST**\n\n" +
            "A invalid syntax like_MUST_ should not be parsed.\n\n" +
            "Other word not matching keywords like **MUS** and **MUSTS** should not be parsed.\n\n",
        ),
      ).toStrictEqual(
        "<p><code>**MUST**</code> in inline code should be rendered as is.</p>\n" +
          '<p>Other syntax like <em>italic</em> and <strong>bold</strong> should work with <strong class="badge tip">MUST</strong></p>\n' +
          "<p>A invalid syntax like_MUST_ should not be parsed.</p>\n" +
          "<p>Other word not matching keywords like <strong>MUS</strong> and <strong>MUSTS</strong> should not be parsed.</p>\n",
      );
    });

    it("should support local config", () => {
      expect(
        markdownIt.render(`**SHOULD**/**MUST**`, {
          stylize: [
            // do nothing with SHOULD
            {
              matcher: "SHOULD",
              replacer: ({ tag, attrs, content }): MarkdownItStylizeResult => ({
                tag,
                attrs,
                content,
              }),
            } as MarkdownItStylizeConfig,
          ],
        }),
      ).toBe('<p><strong>SHOULD</strong>/<strong class="badge tip">MUST</strong></p>\n');
    });

    it("should skip if replacer returns void", () => {
      const markdownItVoid = new MarkdownIt().use(stylize, {
        config: [{ matcher: "TEST", replacer: (): null => null }],
      });

      expect(markdownItVoid.render("**TEST**")).toBe("<p><strong>TEST</strong></p>\n");
    });

    it("should handle non-empty attrs on the previous token", () => {
      const markdownItLink = new MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, attrs, content }): MarkdownItStylizeResult => ({
              tag,
              attrs,
              content,
            }),
          },
        ],
      });

      // a link open token carries `href` attrs
      expect(markdownItLink.render("[TEST](https://example.com)")).toBe(
        '<p><a href="https://example.com">TEST</a></p>\n',
      );
    });

    it("should preserve numeric attr values", () => {
      let receivedValue: unknown;

      const markdownItNumeric = new MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, attrs, content }): MarkdownItStylizeResult => {
              receivedValue = attrs["data-n"];

              return { tag, attrs, content };
            },
          },
        ],
      });

      addStrongAttr(markdownItNumeric, ["data-n", 5]);

      expect(markdownItNumeric.render("**TEST**")).toBe(
        '<p><strong data-n="5">TEST</strong></p>\n',
      );
      expect(receivedValue).toBe(5);
    });

    it("should handle scanTokens with different token structures", () => {
      const markdownItScan = new MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, content, attrs }): MarkdownItStylizeResult => ({
              tag,
              content,
              attrs,
            }),
          },
        ],
      });

      // Nested tags but not matching or different tags
      expect(markdownItScan.render("***TEST***")).toBe("<p><em><strong>TEST</strong></em></p>\n");

      // Only one side
      expect(markdownItScan.render("**TEST")).toBe("<p>**TEST</p>\n");
    });

    it("should handle scanTokens when tokenPrev.attrs is null", () => {
      const markdownItAttrs = new MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, content, attrs }): MarkdownItStylizeResult => ({
              tag,
              content: `${content}!`,
              attrs,
            }),
          },
        ],
      });

      // Standard markdown tags usually have null attrs
      expect(markdownItAttrs.render("**TEST**")).toBe("<p><strong>TEST!</strong></p>\n");
    });

    it("should not throw when replacer returns a result without attrs", () => {
      const markdownItMissingAttrs = new MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, content }): MarkdownItStylizeResult =>
              ({ tag, content }) as MarkdownItStylizeResult,
          },
        ],
      });

      // Replacer omitting `attrs` should not crash on Object.entries(undefined)
      expect(markdownItMissingAttrs.render("**TEST**")).toBe("<p><strong>TEST</strong></p>\n");
    });

    it("should keep original content when replacer returns a result without content", () => {
      const markdownItMissingContent = new MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, attrs }): MarkdownItStylizeResult =>
              ({ tag, attrs }) as MarkdownItStylizeResult,
          },
        ],
      });

      // Replacer omitting `content` should fall back to the original text
      // instead of rendering the literal string "undefined"
      expect(markdownItMissingContent.render("**TEST**")).toBe("<p><strong>TEST</strong></p>\n");
    });
  });

  describe("localConfigGetter", () => {
    it("should handle empty local config", () => {
      const markdownIt = new MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, content, attrs }): MarkdownItStylizeResult => ({
              tag,
              content,
              attrs,
            }),
          },
        ],
        localConfigGetter: (env: unknown): MarkdownItStylizeConfig[] | null =>
          // oxlint-disable-next-line vitest/no-conditional-in-test
          (env as { stylize?: MarkdownItStylizeConfig[] }).stylize ?? null,
      });

      // localConfig is undefined
      expect(markdownIt.render("**TEST**", {})).toBe("<p><strong>TEST</strong></p>\n");

      // localConfig is empty array
      expect(markdownIt.render("**TEST**", { stylize: [] })).toBe("<p><strong>TEST</strong></p>\n");
    });

    it("should handle global config empty but local config provided", () => {
      const markdownIt = new MarkdownIt().use(stylize, {
        config: [],
        localConfigGetter: (env: unknown): MarkdownItStylizeConfig[] | null =>
          // oxlint-disable-next-line vitest/no-conditional-in-test
          (env as { stylize?: MarkdownItStylizeConfig[] }).stylize ?? null,
      });

      expect(
        markdownIt.render("**LOCAL**", {
          stylize: [
            {
              matcher: "LOCAL",
              replacer: ({ tag, content, attrs }) => ({
                tag,
                content,
                attrs: { ...attrs, class: "local" },
              }),
            } as MarkdownItStylizeConfig,
          ],
        }),
      ).toBe('<p><strong class="local">LOCAL</strong></p>\n');
    });

    it("should handle effectiveConfig being empty after localConfigGetter", () => {
      const markdownIt = new MarkdownIt().use(stylize, {
        config: [],
        localConfigGetter: (env: unknown): MarkdownItStylizeConfig[] | null =>
          // oxlint-disable-next-line vitest/no-conditional-in-test
          (env as { stylize?: MarkdownItStylizeConfig[] }).stylize ?? null,
      });

      // effectiveConfig will be empty because both global and local are empty
      expect(markdownIt.render("**TEST**", { stylize: [] })).toBe("<p><strong>TEST</strong></p>\n");
    });
  });

  it("should handle when no config is provided", () => {
    const markdownIt1 = new MarkdownIt().use(stylize);

    expect(markdownIt1.render(`**MUST**`)).toBe("<p><strong>MUST</strong></p>\n");

    const markdownIt2 = new MarkdownIt().use(stylize, { config: [] });

    expect(markdownIt2.render(`**MUST**`)).toBe("<p><strong>MUST</strong></p>\n");
  });
});
