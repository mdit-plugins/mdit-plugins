import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { cjkFriendly } from "../src/index.js";

const markdownIt = new MarkdownIt({ linkify: true }).use(cjkFriendly);
const markdownItOriginal = new MarkdownIt({ linkify: true });

describe(cjkFriendly, () => {
  describe("strong emphasis", () => {
    it("should render strong emphasis around Kana/Han", () => {
      const testCases = [
        [
          "これは**私のやりたかったこと。**だからするの。",
          "<p>これは<strong>私のやりたかったこと。</strong>だからするの。</p>\n",
        ],
        [
          "カッコに注意**（太字にならない）**文が続く場合に要警戒。",
          "<p>カッコに注意<strong>（太字にならない）</strong>文が続く場合に要警戒。</p>\n",
        ],
        [
          "**C#**や**F#**は**「.NET」**というプラットフォーム上で動作します。",
          "<p><strong>C#</strong>や<strong>F#</strong>は<strong>「.NET」</strong>というプラットフォーム上で動作します。</p>\n",
        ],
        [
          "Go**「初心者」**を対象とした記事です。",
          "<p>Go<strong>「初心者」</strong>を対象とした記事です。</p>\n",
        ],
        [
          "太郎は**「こんにちわ」**といった",
          "<p>太郎は<strong>「こんにちわ」</strong>といった</p>\n",
        ],
        [
          '太郎は**"こんにちわ"**といった',
          "<p>太郎は<strong>&quot;こんにちわ&quot;</strong>といった</p>\n",
        ],
        ["**⻲田太郎**と申します", "<p><strong>⻲田太郎</strong>と申します</p>\n"],
        ["・**㋐**:選択肢１つ目", "<p>・<strong>㋐</strong>:選択肢１つ目</p>\n"],
        [
          "税込**¥10,000**で入手できます。",
          "<p>税込<strong>¥10,000</strong>で入手できます。</p>\n",
        ],
        [
          "先頭の**`コード`も注意。**",
          "<p>先頭の<strong><code>コード</code>も注意。</strong></p>\n",
        ],
        [
          "**末尾の`コード`**も注意。",
          "<p><strong>末尾の<code>コード</code></strong>も注意。</p>\n",
        ],
        ["IDが**００１号**になります。", "<p>IDが<strong>００１号</strong>になります。</p>\n"],
        [
          "**推荐几个框架：**React、Vue等前端框架。",
          "<p><strong>推荐几个框架：</strong>React、Vue等前端框架。</p>\n",
        ],
        [
          "**さようなら︙**と太郎はいった。",
          "<p><strong>さようなら︙</strong>と太郎はいった。</p>\n",
        ],
        [
          "「禰\u{E0100}」の偏は示ではなく**礻**です。",
          "<p>「禰\u{E0100}」の偏は示ではなく<strong>礻</strong>です。</p>\n",
        ],
        [
          "大塚\uFE00**(U+585A U+FE00)** 大塚**(U+FA10)**",
          "<p>大塚\uFE00<strong>(U+585A U+FE00)</strong> 大塚<strong>(U+FA10)</strong></p>\n",
        ],
        ["〽\uFE0E**(庵点)**は、", "<p>〽\uFE0E<strong>(庵点)</strong>は、</p>\n"],
        ["**“\uFE01Git”\uFE01**Hub", "<p><strong>“\uFE01Git”\uFE01</strong>Hub</p>\n"],
        ["𰻞𰻞**（ビャンビャン）**麺", "<p>𰻞𰻞<strong>（ビャンビャン）</strong>麺</p>\n"],
        [
          "**[製品ほげ](./product-foo)**と**[製品ふが](./product-bar)**をお試しください",
          '<p><strong><a href="./product-foo">製品ほげ</a></strong>と<strong><a href="./product-bar">製品ふが</a></strong>をお試しください</p>\n',
        ],
        [
          "単語と**[単語と](word-and)**単語",
          '<p>単語と<strong><a href="word-and">単語と</a></strong>単語</p>\n',
        ],
        [
          "**[リンク](https://example.com)**も注意。（画像も同様）",
          '<p><strong><a href="https://example.com">リンク</a></strong>も注意。（画像も同様）</p>\n',
        ],
        ["正解は**④**です。", "<p>正解は<strong>④</strong>です。</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });

    it("should handle CJK punctuation around strong emphasis", () => {
      const testCases = [
        ["**真，**她", "<p><strong>真，</strong>她</p>\n"],
        ["**真。**她", "<p><strong>真。</strong>她</p>\n"],
        ["**真、**她", "<p><strong>真、</strong>她</p>\n"],
        ["**真；**她", "<p><strong>真；</strong>她</p>\n"],
        ["**真：**她", "<p><strong>真：</strong>她</p>\n"],
        ["**真？**她", "<p><strong>真？</strong>她</p>\n"],
        ["**真！**她", "<p><strong>真！</strong>她</p>\n"],
        ["**真“**她", "<p><strong>真“</strong>她</p>\n"],
        ["**真”**她", "<p><strong>真”</strong>她</p>\n"],
        ["**真‘**她", "<p><strong>真‘</strong>她</p>\n"],
        ["**真’**她", "<p><strong>真’</strong>她</p>\n"],
        ["**真（**她", "<p><strong>真（</strong>她</p>\n"],
        ["真**（她**", "<p>真<strong>（她</strong></p>\n"],
        ["**真）**她", "<p><strong>真）</strong>她</p>\n"],
        ["**真【**她", "<p><strong>真【</strong>她</p>\n"],
        ["真**【她**", "<p>真<strong>【她</strong></p>\n"],
        ["**真】**她", "<p><strong>真】</strong>她</p>\n"],
        ["**真《**她", "<p><strong>真《</strong>她</p>\n"],
        ["真**《她**", "<p>真<strong>《她</strong></p>\n"],
        ["**真》**她", "<p><strong>真》</strong>她</p>\n"],
        ["**真—**她", "<p><strong>真—</strong>她</p>\n"],
        ["**真～**她", "<p><strong>真～</strong>她</p>\n"],
        ["**真…**她", "<p><strong>真…</strong>她</p>\n"],
        ["**真·**她", "<p><strong>真·</strong>她</p>\n"],
        ["**真〃**她", "<p><strong>真〃</strong>她</p>\n"],
        ["**真-**她", "<p><strong>真-</strong>她</p>\n"],
        ["**真々**她", "<p><strong>真々</strong>她</p>\n"],
        ["**真**她", "<p><strong>真</strong>她</p>\n"],
        ["**真，** 她", "<p><strong>真，</strong> 她</p>\n"],
        ["**真**，她", "<p><strong>真</strong>，她</p>\n"],
        ["**真，**\u200B她", "<p><strong>真，</strong>\u200B她</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });

    it("should render strong emphasis around Korean", () => {
      const testCases = [
        [
          "**이 [링크](https://example.kr/)**만을 강조하고 싶다.",
          '<p><strong>이 <a href="https://example.kr/">링크</a></strong>만을 강조하고 싶다.</p>\n',
        ],
        ["**스크립트(script)**라고", "<p><strong>스크립트(script)</strong>라고</p>\n"],
        [
          "패키지를 발행하려면 **`npm publish`**를 실행하십시오.",
          "<p>패키지를 발행하려면 <strong><code>npm publish</code></strong>를 실행하십시오.</p>\n",
        ],
        ["**안녕(hello)**하세요.", "<p><strong>안녕(hello)</strong>하세요.</p>\n"],
        ["ᅡ**(a)**", "<p>ᅡ<strong>(a)</strong></p>\n"],
        ["**(k)**ᄏ", "<p><strong>(k)</strong>ᄏ</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });

    it("should render strong emphasis around pseudo-emoji CJK symbols", () => {
      const testCases = [
        ["a**〰**a", "<p>a<strong>〰</strong>a</p>\n"],
        ["a**〽**a", "<p>a<strong>〽</strong>a</p>\n"],
        ["a**🈂**a", "<p>a<strong>🈂</strong>a</p>\n"],
        ["a**🈷**a", "<p>a<strong>🈷</strong>a</p>\n"],
        ["a**㊗**a", "<p>a<strong>㊗</strong>a</p>\n"],
        ["a**㊙**a", "<p>a<strong>㊙</strong>a</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });

    it("should handle non-BMP punctuation and symbols", () => {
      const testCases = [
        ["a**a«**a", "<p>a**a«**a</p>\n"],
        ["a**»a**a", "<p>a**»a**a</p>\n"],
        ["a**a∇**a", "<p>a**a∇**a</p>\n"],
        ["a**∇a**a", "<p>a**∇a**a</p>\n"],
        ["a**a𝜵**a", "<p>a**a𝜵**a</p>\n"],
        ["a**𝜵a**a", "<p>a**𝜵a**a</p>\n"],
        ["a**𐬻a**a", "<p>a**𐬻a**a</p>\n"],
        ["a**a𐬻**a", "<p>a**a𐬻**a</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });
  });

  describe("emphasis and underscores", () => {
    it("should render CJK emphasis", () => {
      const testCases = [
        ["*強調*です。", "<p><em>強調</em>です。</p>\n"],
        ["これは*強調*です。", "<p>これは<em>強調</em>です。</p>\n"],
        ["。*強調*。", "<p>。<em>強調</em>。</p>\n"],
        ["あ*。*", "<p>あ<em>。</em></p>\n"],
        ["*「強調」*", "<p><em>「強調」</em></p>\n"],
        ["**太字**と*強調*", "<p><strong>太字</strong>と<em>強調</em></p>\n"],
        ["*あ\nい*", "<p><em>あ\nい</em></p>\n"],
        ["_強調_です。", "<p>_強調_です。</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });

    it("should process underscores around CJK punctuation", () => {
      const testCases = [
        ["__注意__：注意事項", "<p><strong>注意</strong>：注意事項</p>\n"],
        ["注意：__注意事項__", "<p>注意：<strong>注意事項</strong></p>\n"],
        ["正體字。\uFE01_Traditional._", "<p>正體字。\uFE01<em>Traditional.</em></p>\n"],
        [
          "正體字。\uFE01__Hong Kong and Taiwan.__",
          "<p>正體字。\uFE01<strong>Hong Kong and Taiwan.</strong></p>\n",
        ],
        [
          "简体字 / 新字体。\uFE00_Simplified._",
          "<p>简体字 / 新字体。\uFE00<em>Simplified.</em></p>\n",
        ],
        [
          "简体字 / 新字体。\uFE00__Mainland China or Japan.__",
          "<p>简体字 / 新字体。\uFE00<strong>Mainland China or Japan.</strong></p>\n",
        ],
        ["“\uFE01Git”\uFE01__Hub__", "<p>“\uFE01Git”\uFE01<strong>Hub</strong></p>\n"],
        ["foo_bar_baz", "<p>foo_bar_baz</p>\n"],
        ["あ_い_う", "<p>あ_い_う</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });
  });

  describe("gfm strikethrough", () => {
    it("should render strikethrough around CJK", () => {
      const testCases = [
        ["a~~a()~~あ", "<p>a<s>a()</s>あ</p>\n"],
        ["あ~~()a~~a", "<p>あ<s>()a</s>a</p>\n"],
        ["𩸽~~()a~~a", "<p>𩸽<s>()a</s>a</p>\n"],
        ["a~~a()~~𩸽", "<p>a<s>a()</s>𩸽</p>\n"],
        ["葛\u{E0100}~~()a~~a", "<p>葛\u{E0100}<s>()a</s>a</p>\n"],
        ["羽\uFE00~~()a~~a", "<p>羽\uFE00<s>()a</s>a</p>\n"],
        ["a~~「a~~」", "<p>a<s>「a</s>」</p>\n"],
        ["「~~a」~~a", "<p>「<s>a」</s>a</p>\n"],
        ["~~a~~：~~a~~", "<p><s>a</s>：<s>a</s></p>\n"],
        ["~~日本語。\uFE00~~English.", "<p><s>日本語。\uFE00</s>English.</p>\n"],
        ["~~“\uFE01a”\uFE01~~a", "<p><s>“\uFE01a”\uFE01</s>a</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toBe(expected);
      });
    });

    it("should keep non-CJK strikethrough unchanged", () => {
      const testCases = [
        "~~strikethrough~~",
        "This will ~~~not~~~ strike.",
        "~~Hi~~ Hello, ~there~ world!",
        "a~~()a~~a",
        "This ~is ~ legit~ isn't ~ legit.",
      ];

      testCases.forEach((input) => {
        expect(markdownIt.render(input)).toBe(markdownItOriginal.render(input));
      });

      expect(markdownIt.render("~~strikethrough~~")).toBe("<p><s>strikethrough</s></p>\n");
    });
  });

  describe("non-CJK documents", () => {
    it("should keep the output unchanged", () => {
      const testCases = [
        "*emphasis* and **strong**",
        "_emphasis_ and __strong__",
        "`code` and ``code ` with backtick``",
        "[link](https://example.com) and ![image](./image.png)",
        "- list item 1\n- list item 2",
        "> blockquote",
        "foo_bar_baz",
        "***bold italic***",
        "~~strikethrough~~",
        "<span>inline html</span>",
        "http://example.com/foo",
        "A paragraph with **bold** text, *italic* text, `code`, and a [link](https://example.com).\n\nSecond paragraph.",
      ];

      testCases.forEach((input) => {
        expect(markdownIt.render(input)).toBe(markdownItOriginal.render(input));
      });
    });
  });

  describe("edge cases", () => {
    it("should handle whitespace adjacent to markers", () => {
      expect(markdownIt.render("** a**")).toBe("<p>** a**</p>\n");
      expect(markdownIt.render("a **b**")).toBe("<p>a <strong>b</strong></p>\n");
      expect(markdownIt.render("a**")).toBe("<p>a**</p>\n");
      expect(markdownIt.render("a ** b**")).toBe("<p>a ** b**</p>\n");
      expect(markdownIt.render("a **b** c")).toBe("<p>a <strong>b</strong> c</p>\n");
    });

    it("should handle halfwidth and fullwidth characters", () => {
      expect(markdownIt.render("a**ｱ**a")).toBe("<p>a<strong>ｱ</strong>a</p>\n");
      expect(markdownIt.render("a**ＡＢＣ**a")).toBe("<p>a<strong>ＡＢＣ</strong>a</p>\n");
      expect(markdownIt.render("Ａ**b**c")).toBe("<p>Ａ<strong>b</strong>c</p>\n");
      expect(markdownIt.render("ｱ**b**c")).toBe("<p>ｱ<strong>b</strong>c</p>\n");
      expect(markdownIt.render("a**b⟧**")).toBe("<p>a<strong>b⟧</strong></p>\n");
      expect(markdownIt.render("a**⟦**a")).toBe("<p>a**⟦**a</p>\n");
      expect(markdownIt.render("⟦**a**")).toBe("<p>⟦<strong>a</strong></p>\n");
    });

    it("should not treat emoji presentation characters as CJK", () => {
      expect(markdownIt.render("a**😀**a")).toBe("<p>a**😀**a</p>\n");
      expect(markdownIt.render("a**👩**a")).toBe("<p>a**👩**a</p>\n");
      expect(markdownIt.render("a**❤\uFE0F**a")).toBe("<p>a**❤\uFE0F**a</p>\n");
      expect(markdownIt.render("a**あ😀**a")).toBe("<p>a**あ😀**a</p>\n");
      expect(markdownIt.render("a**😀あ**a")).toBe("<p>a**😀あ**a</p>\n");
    });

    it("should handle variation selectors", () => {
      expect(markdownIt.render("a\uFE00**b**")).toBe("<p>a\uFE00<strong>b</strong></p>\n");
      expect(markdownIt.render("a \uFE00**b**")).toBe("<p>a \uFE00<strong>b</strong></p>\n");
      expect(markdownIt.render("\uFE00**b**")).toBe("<p>\uFE00<strong>b</strong></p>\n");
      expect(markdownIt.render("a ”\uFE00**b**")).toBe("<p>a ”\uFE00<strong>b</strong></p>\n");
      expect(markdownIt.render("∇\uFE01**b**")).toBe("<p>∇\uFE01<strong>b</strong></p>\n");
      expect(markdownIt.render("**“\uFE01Git”\uFE01**Hub")).toBe(
        "<p><strong>“\uFE01Git”\uFE01</strong>Hub</p>\n",
      );
      expect(markdownIt.render("a**\uFE00(庵点)**")).toBe(
        "<p>a<strong>\uFE00(庵点)</strong></p>\n",
      );
    });

    it("should handle ideographic variation selectors", () => {
      expect(markdownIt.render("禰\u{E0100}**a**")).toBe("<p>禰\u{E0100}<strong>a</strong></p>\n");
      expect(markdownIt.render("a**禰\u{E0100}**a")).toBe(
        "<p>a<strong>禰\u{E0100}</strong>a</p>\n",
      );
      expect(markdownIt.render("𰻞**（x）**")).toBe("<p>𰻞<strong>（x）</strong></p>\n");
      expect(markdownIt.render("a🄀**b**")).toBe("<p>a🄀<strong>b</strong></p>\n");
    });

    it("should handle Hangul", () => {
      expect(markdownIt.render("ᅡ**(a)**")).toBe("<p>ᅡ<strong>(a)</strong></p>\n");
      expect(markdownIt.render("ㅏ**a**")).toBe("<p>ㅏ<strong>a</strong></p>\n");
      expect(markdownIt.render("ᄏ**(k)**")).toBe("<p>ᄏ<strong>(k)</strong></p>\n");
      expect(markdownIt.render("가**a**")).toBe("<p>가<strong>a</strong></p>\n");
      expect(markdownIt.render("a**가**a")).toBe("<p>a<strong>가</strong>a</p>\n");
    });

    it("should handle stray surrogates", () => {
      expect(markdownIt.render("a\uDC00**b**")).toBe("<p>a\uDC00<strong>b</strong></p>\n");
      expect(markdownIt.render("\uDC00**a**")).toBe("<p>\uDC00<strong>a</strong></p>\n");
    });

    it("should handle newlines inside strong emphasis", () => {
      expect(markdownIt.render("**あ\nい**")).toBe("<p><strong>あ\nい</strong></p>\n");
    });
  });

  describe("plugin installation", () => {
    it("should be safe to install twice", () => {
      const instance = new MarkdownIt({ linkify: true }).use(cjkFriendly).use(cjkFriendly);

      expect(instance.render("**あ**")).toBe("<p><strong>あ</strong></p>\n");
      expect(instance.render("a**b**c")).toBe("<p>a<strong>b</strong>c</p>\n");
    });
  });
});
