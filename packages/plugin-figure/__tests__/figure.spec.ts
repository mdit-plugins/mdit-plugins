import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe, expect, it } from "vitest";

import { figure } from "../src/index.js";

/**
 * Test-only helper: add non-native attributes to every image token before figure runs.
 *
 * 测试辅助：在 figure 运行前给每个图片 token 添加非原生属性。
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param attrs - Attributes to add / 要添加的属性
 */
const addImageAttrs = (md: MarkdownItType, attrs: [string, string][]): void => {
  md.core.ruler.before("figure", "test-image-attrs", (state) => {
    for (const token of state.tokens) {
      if (token.type !== "inline" || !token.children) continue;

      for (const child of token.children)
        if (child.type === "image") for (const [key, value] of attrs) child.attrPush([key, value]);
    }
  });
};

/**
 * Test-only helper: add attributes to every paragraph token before figure runs, so the figure token
 * already has attributes when the plugin merges image attributes into it.
 *
 * 测试辅助：在 figure 运行前给段落 token 添加属性，使 figure token 预先带有属性。
 *
 * @param md - MarkdownIt instance / MarkdownIt 实例
 * @param attrs - Attributes to add / 要添加的属性
 */
const addFigureAttrs = (md: MarkdownItType, attrs: [string, string][]): void => {
  md.core.ruler.before("figure", "test-figure-attrs", (state) => {
    for (const token of state.tokens) {
      if (token.type !== "paragraph_open") continue;

      for (const [key, value] of attrs) token.attrPush([key, value]);
    }
  });
};

describe(figure, () => {
  const markdownIt = new MarkdownIt({ html: true, linkify: true }).use(figure);

  it("should ignore unrelated content", () => {
    expect(
      markdownIt.render(`\
test

![image](/logo.svg) test

test ![image](/logo.svg)
`),
    ).toBe(
      `\
<p>test</p>
<p><img src="/logo.svg" alt="image"> test</p>
<p>test <img src="/logo.svg" alt="image"></p>
`,
    );
  });

  it("should use alt it no title is found", () => {
    expect(markdownIt.render(`![image](/logo.svg)`)).toBe(
      '<figure><img src="/logo.svg" alt="image" tabindex="0"><figcaption>image</figcaption></figure>\n',
    );
  });

  it("should use title and remove original title on image", () => {
    expect(markdownIt.render(`![image](/logo.svg "A image")`)).toBe(
      '<figure><img src="/logo.svg" alt="image" tabindex="0"><figcaption>A image</figcaption></figure>\n',
    );
  });

  it("should not change inline image", () => {
    expect(markdownIt.render(`A ![image](/logo.svg "A image") in text`)).toBe(
      '<p>A <img src="/logo.svg" alt="image" title="A image"> in text</p>\n',
    );
  });

  it("should support image with links", () => {
    expect(markdownIt.render(`[![image](/logo.svg)](https://example.com)`)).toBe(
      '<figure><a href="https://example.com"><img src="/logo.svg" alt="image" tabindex="0"></a><figcaption>image</figcaption></figure>\n',
    );

    expect(markdownIt.render(`[![image](/logo.svg "A image")](https://example.com)`)).toBe(
      '<figure><a href="https://example.com"><img src="/logo.svg" alt="image" tabindex="0"></a><figcaption>A image</figcaption></figure>\n',
    );
  });

  it("should ignore image in headings or tables", () => {
    expect(markdownIt.render("# ![image](/logo.svg)")).toBe(
      '<h1><img src="/logo.svg" alt="image"></h1>\n',
    );
    expect(markdownIt.render("| ![image](/logo.svg) |\n| --- |")).toContain(
      '<th><img src="/logo.svg" alt="image"></th>',
    );
  });

  it("should not convert images in tight list items", () => {
    expect(
      markdownIt.render(`\
- ![a](1.png "c1")
- ![b](2.png "c2")
`),
    ).toBe(
      `\
<ul>
<li><img src="1.png" alt="a" title="c1"></li>
<li><img src="2.png" alt="b" title="c2"></li>
</ul>
`,
    );
  });

  it("should convert images in loose list items", () => {
    expect(
      markdownIt.render(`\
- ![a](1.png "c1")

- ![b](2.png "c2")
`),
    ).toBe(
      `\
<ul>
<li>
<figure><img src="1.png" alt="a" tabindex="0"><figcaption>c1</figcaption></figure>
</li>
<li>
<figure><img src="2.png" alt="b" tabindex="0"><figcaption>c2</figcaption></figure>
</li>
</ul>
`,
    );
  });

  it("should not add figcaption when caption is empty", () => {
    expect(markdownIt.render("![](/logo.svg)")).toBe(
      '<figure><img src="/logo.svg" alt="" tabindex="0"></figure>\n',
    );

    expect(markdownIt.render("[![](/logo.svg)](https://example.com)")).toBe(
      '<figure><a href="https://example.com"><img src="/logo.svg" alt="" tabindex="0"></a></figure>\n',
    );
  });

  it("should support focusable option", () => {
    const md = new MarkdownIt().use(figure, { focusable: false });

    expect(md.render("![image](/logo.svg)")).toBe(
      '<figure><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
    );
  });

  it("should keep an existing tabindex on the image", () => {
    const md = new MarkdownIt().use(figure);

    addImageAttrs(md, [["tabindex", "1"]]);

    const result = md.render("![image](/logo.svg)");

    expect(result).toBe(
      '<figure><img src="/logo.svg" alt="image" tabindex="1"><figcaption>image</figcaption></figure>\n',
    );
    expect(result.match(/tabindex=/g)).toHaveLength(1);
  });

  it("should keep an existing tabindex with a different case", () => {
    const md = new MarkdownIt().use(figure);

    // HTML attribute names are case-insensitive, and authored attrs keep their case
    addImageAttrs(md, [["TABINDEX", "1"]]);

    const result = md.render("![image](/logo.svg)");

    expect(result).toBe(
      '<figure><img src="/logo.svg" alt="image" TABINDEX="1"><figcaption>image</figcaption></figure>\n',
    );
    expect(result.match(/tabindex=/gi)).toHaveLength(1);
  });

  it("should support linkImage option", () => {
    const md = new MarkdownIt().use(figure, { linkImage: false });

    expect(md.render("![image](/logo.svg)")).toBe(
      '<figure><img src="/logo.svg" alt="image" tabindex="0"><figcaption>image</figcaption></figure>\n',
    );
    expect(md.render(`[![image](/logo.svg)](https://example.com)`)).toBe(
      '<p><a href="https://example.com"><img src="/logo.svg" alt="image"></a></p>\n',
    );
  });

  describe("moveAttrs", () => {
    it("should copy non-native attrs to figure with true", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: true, focusable: false });

      addImageAttrs(md, [["class", "main"]]);

      // class is a non-native attr — copied to figure (img keeps it)
      // title is a native img attr — stays as caption, never copied to figure
      expect(md.render('![image](/logo.svg "A title")')).toBe(
        '<figure class="main"><img src="/logo.svg" alt="image" class="main"><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should not copy native attrs to figure with true", () => {
      const md = new MarkdownIt().use(figure, {
        moveAttrs: true,
        focusable: false,
      });

      // title is a native img attr — never copied to figure, stays as caption
      expect(md.render('![image](/logo.svg "A title")')).toBe(
        '<figure><img src="/logo.svg" alt="image"><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should move matching non-native attrs to figure with array", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: ["class"], focusable: false });

      addImageAttrs(md, [["class", "main"]]);

      // class is moved to figure (img loses it); title stays as caption
      expect(md.render('![image](/logo.svg "A title")')).toBe(
        '<figure class="main"><img src="/logo.svg" alt="image"><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should not move native attrs even when explicitly matched with array", () => {
      const md = new MarkdownIt().use(figure, {
        moveAttrs: ["title"],
        focusable: false,
      });

      // title is a native img attr — never moved to figure even if explicitly listed
      expect(md.render('![image](/logo.svg "A title")')).toBe(
        '<figure><img src="/logo.svg" alt="image"><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should support RegExp patterns in array", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: [/^data-/], focusable: false });

      addImageAttrs(md, [["data-x", "1"]]);

      // data-x matched by RegExp — moved to figure; title stays as caption
      expect(md.render('![image](/logo.svg "A title")')).toBe(
        '<figure data-x="1"><img src="/logo.svg" alt="image"><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should keep moving attrs matched by a global RegExp across attrs and images", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: [/^data-/g], focusable: false });

      addImageAttrs(md, [
        ["data-a", "1"],
        ["data-b", "2"],
      ]);

      // a global regex keeps lastIndex between tests, so without a reset every other attr is dropped
      expect(md.render(`![one](/1.svg)\n\n![two](/2.svg)`)).toBe(
        '<figure data-a="1" data-b="2"><img src="/1.svg" alt="one"><figcaption>one</figcaption></figure>\n' +
          '<figure data-a="1" data-b="2"><img src="/2.svg" alt="two"><figcaption>two</figcaption></figure>\n',
      );
    });

    it("should keep moving attrs matched by a sticky RegExp across attrs and images", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: [/^data-/y], focusable: false });

      addImageAttrs(md, [
        ["data-a", "1"],
        ["data-b", "2"],
      ]);

      expect(md.render(`![one](/1.svg)\n\n![two](/2.svg)`)).toBe(
        '<figure data-a="1" data-b="2"><img src="/1.svg" alt="one"><figcaption>one</figcaption></figure>\n' +
          '<figure data-a="1" data-b="2"><img src="/2.svg" alt="two"><figcaption>two</figcaption></figure>\n',
      );
    });

    it("should not move unmatched attrs", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: ["class"], focusable: false });

      // no class attr — nothing moved; title stays as caption
      expect(md.render('![image](/logo.svg "A title")')).toBe(
        '<figure><img src="/logo.svg" alt="image"><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should keep title as caption for linked images", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: true, focusable: false });

      addImageAttrs(md, [["class", "main"]]);

      // title stays as caption for linked images too; class copied to figure
      expect(md.render('[![alt](/url "A title")](https://example.com)')).toBe(
        '<figure class="main"><a href="https://example.com"><img src="/url" alt="alt" class="main"></a><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should keep title as caption when alt is empty", () => {
      const md = new MarkdownIt().use(figure, {
        moveAttrs: true,
        focusable: false,
      });

      // empty alt — title is still used as caption
      expect(md.render('![](/url "A title")')).toBe(
        '<figure><img src="/url" alt=""><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should not move title even when matched by a RegExp pattern", () => {
      const md = new MarkdownIt().use(figure, {
        moveAttrs: [/^tit/],
        focusable: false,
      });

      // title is a native img attr — never moved even if a RegExp matches it
      expect(md.render('![image](/logo.svg "A title")')).toBe(
        '<figure><img src="/logo.svg" alt="image"><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should not move native attrs like src or alt with array", () => {
      const md = new MarkdownIt().use(figure, {
        moveAttrs: ["src", "alt"],
        focusable: false,
      });

      // src/alt are native img attrs — never moved to figure
      expect(md.render('![image](/logo.svg "A title")')).toBe(
        '<figure><img src="/logo.svg" alt="image"><figcaption>A title</figcaption></figure>\n',
      );
    });

    it("should merge class into an existing figure class with true", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: true, focusable: false });

      addFigureAttrs(md, [["class", "para"]]);
      addImageAttrs(md, [["class", "main"]]);

      // class is merged into the existing figure class; img keeps its own class
      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure class="para main"><img src="/logo.svg" alt="image" class="main"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should merge style into an existing figure style with true", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: true, focusable: false });

      addFigureAttrs(md, [["style", "color:red"]]);
      addImageAttrs(md, [["style", "width:100%"]]);

      // style declarations are merged; img keeps its own style
      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure style="color:red;width:100%"><img src="/logo.svg" alt="image" style="width:100%"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should normalize trailing semicolons when merging style with array", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: ["style"], focusable: false });

      addFigureAttrs(md, [["style", "color:red;"]]);
      addImageAttrs(md, [["style", "width:100%;"]]);

      // trailing semicolons are dropped so no empty declaration is left; img loses style
      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure style="color:red;width:100%"><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should replace an empty figure style with the image style", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: true, focusable: false });

      addFigureAttrs(md, [["style", ";"]]);
      addImageAttrs(md, [["style", "width:100%"]]);

      // an empty existing style is replaced instead of producing a leading semicolon
      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure style="width:100%"><img src="/logo.svg" alt="image" style="width:100%"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should skip an empty image style", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: ["style"], focusable: false });

      addFigureAttrs(md, [["style", "color:red"]]);
      addImageAttrs(md, [["style", " ; "]]);

      // an empty image style adds no declaration; img loses the empty style
      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure style="color:red"><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should keep the first value of duplicate non-class/style attrs with true", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: true, focusable: false });

      addFigureAttrs(md, [["data-x", "1"]]);
      addImageAttrs(md, [["data-x", "2"]]);

      // the figure value wins; img keeps its own data-x
      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure data-x="1"><img src="/logo.svg" alt="image" data-x="2"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should keep the first value of duplicate non-class/style attrs with array", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: ["data-x"], focusable: false });

      addFigureAttrs(md, [["data-x", "1"]]);
      addImageAttrs(md, [["data-x", "2"]]);

      // the figure value wins; the matching img attr is still moved away
      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure data-x="1"><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should merge class into an existing figure class with array", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: ["class"], focusable: false });

      addFigureAttrs(md, [["class", "para"]]);
      addImageAttrs(md, [["class", "main"]]);

      // class is merged; img loses its class
      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure class="para main"><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should not duplicate identical class tokens", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: ["class"], focusable: false });

      addFigureAttrs(md, [["class", "a"]]);
      addImageAttrs(md, [["class", "a b"]]);

      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure class="a b"><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should handle empty class values", () => {
      const mdWithoutFigureClass = new MarkdownIt().use(figure, {
        moveAttrs: ["class"],
        focusable: false,
      });

      addFigureAttrs(mdWithoutFigureClass, [["class", ""]]);
      addImageAttrs(mdWithoutFigureClass, [["class", "main"]]);

      // an empty figure class is replaced instead of producing a leading space
      expect(mdWithoutFigureClass.render("![image](/logo.svg)")).toBe(
        '<figure class="main"><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
      );

      const mdWithEmptyImageClass = new MarkdownIt().use(figure, {
        moveAttrs: ["class"],
        focusable: false,
      });

      addFigureAttrs(mdWithEmptyImageClass, [["class", "a"]]);
      addImageAttrs(mdWithEmptyImageClass, [["class", ""]]);

      // an empty image class adds no token
      expect(mdWithEmptyImageClass.render("![image](/logo.svg)")).toBe(
        '<figure class="a"><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should not mutate image attrs when copying duplicate keys with true", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: true, focusable: false });

      addImageAttrs(md, [
        ["class", "a"],
        ["class", "b"],
        ["style", "color:red"],
        ["style", "width:1px"],
      ]);

      // figure gets the merged values; the image token must keep its own tuples untouched
      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure class="a b" style="color:red;width:1px"><img src="/logo.svg" alt="image" class="a" class="b" style="color:red" style="width:1px"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should drop empty declarations when merging styles", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: true, focusable: false });

      addFigureAttrs(md, [["style", "; color:red"]]);
      addImageAttrs(md, [["style", ";; width:1px;"]]);

      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure style="color:red;width:1px"><img src="/logo.svg" alt="image" style=";; width:1px;"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should treat attr keys case-insensitively when merging", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: true, focusable: false });

      addFigureAttrs(md, [["CLASS", "para"]]);
      addImageAttrs(md, [["class", "main"]]);

      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure CLASS="para main"><img src="/logo.svg" alt="image" class="main"><figcaption>image</figcaption></figure>\n',
      );
    });

    it("should merge every attr with the same key", () => {
      const md = new MarkdownIt().use(figure, { moveAttrs: ["style"], focusable: false });

      addFigureAttrs(md, [["style", "color:red"]]);
      addImageAttrs(md, [
        ["style", "width:100%"],
        ["style", "font-weight:bold"],
      ]);

      expect(md.render("![image](/logo.svg)")).toBe(
        '<figure style="color:red;width:100%;font-weight:bold"><img src="/logo.svg" alt="image"><figcaption>image</figcaption></figure>\n',
      );
    });
  });

  it("should not covert existing figure tags to markdown-it-figure", () => {
    expect(
      markdownIt.render(`\
<figure>
<img src="/logo.svg" alt="image" tabindex="0"><figcaption>A image</figcaption>
</figure>
`),
    ).toBe(
      `<figure>\n<img src="/logo.svg" alt="image" tabindex="0"><figcaption>A image</figcaption>\n</figure>\n`,
    );

    expect(
      markdownIt.render(`\
<figure>

<img src="/logo.svg" alt="image" tabindex="0">

</figure>
`),
    ).toBe(`<figure>\n<img src="/logo.svg" alt="image" tabindex="0">\n</figure>\n`);
  });
});
