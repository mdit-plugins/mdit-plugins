import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { legacyImgSize } from "../src/index.js";

describe("legacy image size", () => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const markdownIt = MarkdownIt().use(legacyImgSize);

  describe("should not break original image syntax", () => {
    it("simple", () => {
      expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
        '<p><img src="/logo.svg" alt="image"></p>\n',
      );

      expect(markdownIt.render(`![image]( /logo.svg)`)).toEqual(
        '<p><img src="/logo.svg" alt="image"></p>\n',
      );

      expect(markdownIt.render(`![image](data:script)`)).toEqual(
        "<p>![image](data:script)</p>\n",
      );
    });

    it("with title", () => {
      expect(markdownIt.render(`![image](/logo.svg "title")`)).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title"></p>\n',
      );
    });

    it("with label", () => {
      expect(
        markdownIt.render(
          `\
![image][logo]

[logo]: /logo.svg
`,
        ),
      ).toEqual('<p><img src="/logo.svg" alt="image"></p>\n');

      expect(
        markdownIt.render(
          `\
![logo] 

[logo]: /logo.svg
`,
        ),
      ).toEqual('<p><img src="/logo.svg" alt="logo"></p>\n');

      expect(
        markdownIt.render(
          `\
![image][logo 

[logo]: /logo.svg
`,
        ),
      ).toEqual("<p>![image][logo</p>\n");
    });

    it("with label and title", () => {
      expect(
        markdownIt.render(`\
![image][logo]

[logo]: /logo.svg "title"
`),
      ).toEqual('<p><img src="/logo.svg" alt="image" title="title"></p>\n');
    });
  });

  describe("should render with width and height", () => {
    it("simple", () => {
      expect(markdownIt.render(`![image](/logo.svg =200x300)`)).toEqual(
        '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
      );
    });

    it("with title", () => {
      expect(markdownIt.render(`![image](/logo.svg "title" =200x300)`)).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
      );
    });
  });

  describe("should render with width or height", () => {
    it("simple", () => {
      expect(markdownIt.render(`![image](/logo.svg =200x)`)).toEqual(
        '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
      );

      expect(markdownIt.render(`![image](/logo.svg =x300)`)).toEqual(
        '<p><img src="/logo.svg" alt="image" height="300"></p>\n',
      );
    });

    it("with title", () => {
      expect(markdownIt.render(`![image](/logo.svg "title" =200x)`)).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title" width="200"></p>\n',
      );

      expect(markdownIt.render(`![image](/logo.svg "title" =x300)`)).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title" height="300"></p>\n',
      );
    });
  });

  describe("should not render if width or height is not number", () => {
    it("simple", () => {
      expect(markdownIt.render(`![image](/logo.svg =abcxdef)`)).toEqual(
        "<p>![image](/logo.svg =abcxdef)</p>\n",
      );

      expect(markdownIt.render(`![image](/logo.svg =abcx100)`)).toEqual(
        "<p>![image](/logo.svg =abcx100)</p>\n",
      );

      expect(markdownIt.render(`![image](/logo.svg =200xdef)`)).toEqual(
        "<p>![image](/logo.svg =200xdef)</p>\n",
      );

      expect(markdownIt.render(`![image](/logo.svg =12ax300)`)).toEqual(
        "<p>![image](/logo.svg =12ax300)</p>\n",
      );

      expect(markdownIt.render(`![image](/logo.svg =200x12a)`)).toEqual(
        "<p>![image](/logo.svg =200x12a)</p>\n",
      );
    });

    it("with title", () => {
      expect(markdownIt.render(`![image](/logo.svg "title" =abcxdef)`)).toEqual(
        "<p>![image](/logo.svg &quot;title&quot; =abcxdef)</p>\n",
      );

      expect(markdownIt.render(`![image](/logo.svg "title" =abcx100)`)).toEqual(
        "<p>![image](/logo.svg &quot;title&quot; =abcx100)</p>\n",
      );

      expect(markdownIt.render(`![image](/logo.svg "title" =200xdef)`)).toEqual(
        "<p>![image](/logo.svg &quot;title&quot; =200xdef)</p>\n",
      );

      expect(markdownIt.render(`![image](/logo.svg "title" =12ax300)`)).toEqual(
        "<p>![image](/logo.svg &quot;title&quot; =12ax300)</p>\n",
      );

      expect(markdownIt.render(`![image](/logo.svg "title" =200x12a)`)).toEqual(
        "<p>![image](/logo.svg &quot;title&quot; =200x12a)</p>\n",
      );
    });
  });

  it("should not render with capital X or math times", () => {
    expect(markdownIt.render(`![image](/logo.svg =200X300)`)).toEqual(
      "<p>![image](/logo.svg =200X300)</p>\n",
    );

    expect(markdownIt.render(`![image](/logo.svg =200×300)`)).toEqual(
      "<p>![image](/logo.svg =200×300)</p>\n",
    );
  });
});
