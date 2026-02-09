import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import type {
  MarkdownItStylizeConfig,
  MarkdownItStylizeOptions,
  MarkdownItStylizeResult,
} from "../src/index.js";
import { stylize } from "../src/index.js";

describe(stylize, () => {
  describe("global config", () => {
    const options: MarkdownItStylizeOptions = {
      config: [
        {
          matcher: "MUST",
          replacer: ({ tag, attrs, content }): MarkdownItStylizeResult | void => {
            if (tag === "strong" || tag === "em") {
              return {
                tag,
                attrs: { ...attrs, class: "badge tip" },
                content,
              };
            }
          },
        },
        {
          matcher: "SHOULD",
          replacer: ({ tag, attrs, content }): MarkdownItStylizeResult | void => {
            if (tag === "strong") {
              return {
                tag,
                attrs: { ...attrs, title: "should" },
                content,
              };
            }
          },
        },
        {
          matcher: "MAY",
          replacer: ({ tag, attrs }): MarkdownItStylizeResult | void => {
            if (tag === "em") return { tag, attrs, content: "MAY:)" };
          },
        },
        {
          matcher: "NOT",
          replacer: ({ tag, attrs, content }): MarkdownItStylizeResult | void => {
            if (tag === "em") return { tag, attrs, content: `MUST_${content}` };
          },
        },
        {
          matcher: /n't$/,
          replacer: ({ tag, attrs, content }): MarkdownItStylizeResult | void => {
            if (tag === "em") {
              return {
                tag: "span",
                attrs: { ...attrs, style: `color:red;${attrs.style || ""}` },
                content,
              };
            }
          },
        },
      ],
      localConfigGetter: (env) => (env as { stylize?: MarkdownItStylizeConfig[] }).stylize ?? null,
    };

    const markdownIt = MarkdownIt({ linkify: true }).use(stylize, options);

    it("should render MUST", () => {
      expect(markdownIt.render(`**MUST**`)).toEqual(
        '<p><strong class="badge tip">MUST</strong></p>\n',
      );
      expect(markdownIt.render(`*MUST*`)).toEqual('<p><em class="badge tip">MUST</em></p>\n');
    });

    it("should render SHOULD", () => {
      expect(markdownIt.render(`**SHOULD**`)).toEqual(
        '<p><strong title="should">SHOULD</strong></p>\n',
      );
      expect(markdownIt.render(`*SHOULD*`)).toEqual("<p><em>SHOULD</em></p>\n");
    });

    it("should render MAY", () => {
      expect(markdownIt.render(`**MAY**`)).toEqual("<p><strong>MAY</strong></p>\n");
      expect(markdownIt.render(`*MAY*`)).toEqual("<p><em>MAY:)</em></p>\n");
    });

    it("should render NOT", () => {
      expect(markdownIt.render(`**NOT**`)).toEqual("<p><strong>NOT</strong></p>\n");
      expect(markdownIt.render(`*NOT*`)).toEqual("<p><em>MUST_NOT</em></p>\n");
    });

    it("should render negative words with red", () => {
      expect(markdownIt.render(`I _don't_ want to talk him, he _isn't_ a friend of mine.`))
        .toEqual(`\
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
      ).toEqual(
        '<p><strong class="badge tip">MUST</strong> at the beginning of the line</p>\n' +
          '<p><strong class="badge tip">MUST</strong> at the beginning of the line</p>\n' +
          '<p>At the end of the line <em class="badge tip">MUST</em></p>\n' +
          '<p>At the end of the line <em class="badge tip">MUST</em></p>\n' +
          '<p>Some content with <strong class="badge tip">MUST</strong> and some words.</p>\n' +
          '<p>Some content with <strong class="badge tip">MUST</strong> and some words.</p>\n',
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
      ).toEqual(
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
      ).toEqual('<p><strong>SHOULD</strong>/<strong class="badge tip">MUST</strong></p>\n');
    });

    it("should skip if replacer returns void", () => {
      const markdownItVoid = MarkdownIt().use(stylize, {
        config: [{ matcher: "TEST", replacer: (): void => {} }],
      });

      expect(markdownItVoid.render("**TEST**")).toEqual("<p><strong>TEST</strong></p>\n");
    });

    it("should handle scanTokens with different token structures", () => {
      const markdownItScan = MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, content, attrs }) => ({
              tag,
              content,
              attrs,
            }),
          } as MarkdownItStylizeConfig,
        ],
      });

      // Nested tags but not matching or different tags
      expect(markdownItScan.render("***TEST***")).toEqual(
        "<p><em><strong>TEST</strong></em></p>\n",
      );

      // Only one side
      expect(markdownItScan.render("**TEST")).toEqual("<p>**TEST</p>\n");
    });

    it("should handle scanTokens when tokenPrev.attrs is null", () => {
      const markdownItAttrs = MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, content, attrs }) => ({
              tag,
              content: `${content}!`,
              attrs,
            }),
          } as MarkdownItStylizeConfig,
        ],
      });

      // Standard markdown tags usually have null attrs
      expect(markdownItAttrs.render("**TEST**")).toEqual("<p><strong>TEST!</strong></p>\n");
    });
  });

  describe("localConfigGetter", () => {
    it("should handle empty local config", () => {
      const markdownIt = MarkdownIt().use(stylize, {
        config: [
          {
            matcher: "TEST",
            replacer: ({ tag, content, attrs }) => ({
              tag,
              content,
              attrs,
            }),
          } as MarkdownItStylizeConfig,
        ],
        localConfigGetter: (env: unknown): MarkdownItStylizeConfig[] | null =>
          (env as { stylize?: MarkdownItStylizeConfig[] }).stylize ?? null,
      });

      // localConfig is undefined
      expect(markdownIt.render("**TEST**", {})).toEqual("<p><strong>TEST</strong></p>\n");

      // localConfig is empty array
      expect(markdownIt.render("**TEST**", { stylize: [] })).toEqual(
        "<p><strong>TEST</strong></p>\n",
      );
    });

    it("should handle global config empty but local config provided", () => {
      const markdownIt = MarkdownIt().use(stylize, {
        config: [],
        localConfigGetter: (env: unknown): MarkdownItStylizeConfig[] | null =>
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
      ).toEqual('<p><strong class="local">LOCAL</strong></p>\n');
    });

    it("should handle effectiveConfig being empty after localConfigGetter", () => {
      const markdownIt = MarkdownIt().use(stylize, {
        config: [],
        localConfigGetter: (env: unknown): MarkdownItStylizeConfig[] | null =>
          (env as { stylize?: MarkdownItStylizeConfig[] }).stylize ?? null,
      });

      // effectiveConfig will be empty because both global and local are empty
      expect(markdownIt.render("**TEST**", { stylize: [] })).toEqual(
        "<p><strong>TEST</strong></p>\n",
      );
    });
  });

  it("should handle when no config is provided", () => {
    const markdownIt1 = MarkdownIt().use(stylize);

    expect(markdownIt1.render(`**MUST**`)).toEqual("<p><strong>MUST</strong></p>\n");

    const markdownIt2 = MarkdownIt().use(stylize, { config: [] });

    expect(markdownIt2.render(`**MUST**`)).toEqual("<p><strong>MUST</strong></p>\n");
  });
});
