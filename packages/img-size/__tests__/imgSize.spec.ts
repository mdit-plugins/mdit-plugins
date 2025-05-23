import { figure } from "@mdit/plugin-figure";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { imgSize } from "../src/index.js";

describe("default image size", () => {
  const markdownIt = MarkdownIt().use(imgSize);

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
      expect(markdownIt.render(`![image =200x300](/logo.svg)`)).toEqual(
        '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
      );
    });

    it("with title", () => {
      expect(markdownIt.render(`![image =200x300](/logo.svg "title")`)).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
      );
    });

    it("with label", () => {
      expect(
        markdownIt.render(
          `\
![image =200x300][logo]

[logo]: /logo.svg
`,
        ),
      ).toEqual(
        '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
      );
    });

    it("with label and title", () => {
      expect(
        markdownIt.render(
          `\
![image =200x300][logo]

[logo]: /logo.svg "title"
`,
        ),
      ).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
      );
    });
  });

  describe("should render with width or height", () => {
    it("simple", () => {
      expect(markdownIt.render(`![image =200x](/logo.svg)`)).toEqual(
        '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
      );

      expect(markdownIt.render(`![image =x300](/logo.svg)`)).toEqual(
        '<p><img src="/logo.svg" alt="image" height="300"></p>\n',
      );
    });

    it("with title", () => {
      expect(markdownIt.render(`![image =200x](/logo.svg "title")`)).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title" width="200"></p>\n',
      );

      expect(markdownIt.render(`![image =x300](/logo.svg "title")`)).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title" height="300"></p>\n',
      );
    });

    it("with label", () => {
      expect(
        markdownIt.render(
          `\
![image =200x][logo]

[logo]: /logo.svg
`,
        ),
      ).toEqual('<p><img src="/logo.svg" alt="image" width="200"></p>\n');

      expect(
        markdownIt.render(
          `\
![image =x300][logo]

[logo]: /logo.svg
`,
        ),
      ).toEqual('<p><img src="/logo.svg" alt="image" height="300"></p>\n');
    });

    it("with label and title", () => {
      expect(
        markdownIt.render(
          `\
![image =200x][logo]

[logo]: /logo.svg "title"
`,
        ),
      ).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title" width="200"></p>\n',
      );

      expect(
        markdownIt.render(
          `\
![image =x300][logo]

[logo]: /logo.svg "title"
`,
        ),
      ).toEqual(
        '<p><img src="/logo.svg" alt="image" title="title" height="300"></p>\n',
      );
    });
  });

  it("should not render if width or height is not number", () => {
    expect(markdownIt.render(`![image =abcxdef](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image =abcxdef"></p>\n',
    );

    expect(markdownIt.render(`![image =abcx100](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image =abcx100"></p>\n',
    );

    expect(markdownIt.render(`![image =200xdef](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image =200xdef"></p>\n',
    );

    expect(markdownIt.render(`![image =12ax300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image =12ax300"></p>\n',
    );

    expect(markdownIt.render(`![image =200x12a](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image =200x12a"></p>\n',
    );
  });

  it("should not render with capital X or math times", () => {
    expect(markdownIt.render(`![image =200X300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image =200X300"></p>\n',
    );

    expect(markdownIt.render(`![image =200×300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image =200×300"></p>\n',
    );
  });
});

describe("work with figure plugin", () => {
  const markdownIt1 = MarkdownIt().use(imgSize).use(figure);
  const markdownIt2 = MarkdownIt().use(figure).use(imgSize);

  it("should render with figure", () => {
    expect(markdownIt1.render(`![image =200x300](/logo.svg)`)).toEqual(
      '<figure><img src="/logo.svg" alt="image" width="200" height="300" tabindex="0"><figcaption>image</figcaption></figure>\n',
    );
    expect(markdownIt2.render(`![image =200x300](/logo.svg)`)).toEqual(
      '<figure><img src="/logo.svg" alt="image" width="200" height="300" tabindex="0"><figcaption>image</figcaption></figure>\n',
    );
  });
});
