import { figure } from "@mdit/plugin-figure";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { legacyImgSize } from "../src/index.js";

describe("legacy image size", () => {
  // oxlint-disable-next-line typescript/no-deprecated
  const markdownIt = MarkdownIt().use(legacyImgSize);

  describe("should not break original image syntax", () => {
    it("simple", () => {
      const testCases = [
        [`![image](/a)`, '<p><img src="/a" alt="image"></p>\n'],
        [`![image](/logo.svg)`, '<p><img src="/logo.svg" alt="image"></p>\n'],
        [`![image](/logo.svg )`, '<p><img src="/logo.svg" alt="image"></p>\n'],
        [`![image]( /logo.svg)`, '<p><img src="/logo.svg" alt="image"></p>\n'],
        [
          `![image]( /logo.svg "title")`,
          '<p><img src="/logo.svg" alt="image" title="title"></p>\n',
        ],
        [`![image](data:script)`, "<p>![image](data:script)</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with title", () => {
      const testCases = [
        [`![image](/logo.svg "title")`, '<p><img src="/logo.svg" alt="image" title="title"></p>\n'],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with label", () => {
      const testCases = [
        [
          `\
![image][logo]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="image"></p>\n',
        ],
        [
          `\
![image] [logo]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="image"></p>\n',
        ],
        [
          `\
![logo] 

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="logo"></p>\n',
        ],
        [
          `\
![image][logo 

[logo]: /logo.svg
`,
          "<p>![image][logo</p>\n",
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with label and title", () => {
      const testCases = [
        [
          `\
![image][logo]

[logo]: /logo.svg "title"
`,
          '<p><img src="/logo.svg" alt="image" title="title"></p>\n',
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });
  });

  it("should not render", () => {
    const testCases = [
      [`![image`, "<p>![image</p>\n"],
      [`![image][]`, "<p>![image][]</p>\n"],
      [`![image](< =200x)`, "<p>![image](&lt; =200x)</p>\n"],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  describe("should render with width and height", () => {
    it("simple", () => {
      const testCases = [
        [
          `![image](/logo.svg =200x300)`,
          '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
        ],
        [
          `![image](/logo.svg =200x300  )`,
          '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with title", () => {
      const testCases = [
        [
          `![image](/logo.svg "title" =200x300)`,
          '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });
  });

  describe("should render with width or height", () => {
    it("simple", () => {
      const testCases = [
        [`![image](/logo.svg =200x)`, '<p><img src="/logo.svg" alt="image" width="200"></p>\n'],
        [`![image](/logo.svg =1x)`, '<p><img src="/logo.svg" alt="image" width="1"></p>\n'],
        [`![image](/logo.svg =x300)`, '<p><img src="/logo.svg" alt="image" height="300"></p>\n'],
        [`![image](/logo.svg =x1)`, '<p><img src="/logo.svg" alt="image" height="1"></p>\n'],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with title", () => {
      const testCases = [
        [
          `![image](/logo.svg "title" =200x)`,
          '<p><img src="/logo.svg" alt="image" title="title" width="200"></p>\n',
        ],
        [
          `![image](/logo.svg "title" =x300)`,
          '<p><img src="/logo.svg" alt="image" title="title" height="300"></p>\n',
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });
  });

  describe("should not render if width or height is not number", () => {
    it("simple", () => {
      const testCases = [
        [`![image](/logo.svg =abcxdef)`, "<p>![image](/logo.svg =abcxdef)</p>\n"],
        [`![image](/logo.svg =abcx100)`, "<p>![image](/logo.svg =abcx100)</p>\n"],
        [`![image](/logo.svg =200xdef)`, "<p>![image](/logo.svg =200xdef)</p>\n"],
        [`![image](/logo.svg =12ax300)`, "<p>![image](/logo.svg =12ax300)</p>\n"],
        [`![image](/logo.svg =200x12a)`, "<p>![image](/logo.svg =200x12a)</p>\n"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with title", () => {
      const testCases = [
        [
          `![image](/logo.svg "title" =abcxdef)`,
          "<p>![image](/logo.svg &quot;title&quot; =abcxdef)</p>\n",
        ],
        [
          `![image](/logo.svg "title" =abcx100)`,
          "<p>![image](/logo.svg &quot;title&quot; =abcx100)</p>\n",
        ],
        [
          `![image](/logo.svg "title" =200xdef)`,
          "<p>![image](/logo.svg &quot;title&quot; =200xdef)</p>\n",
        ],
        [
          `![image](/logo.svg "title" =12ax300)`,
          "<p>![image](/logo.svg &quot;title&quot; =12ax300)</p>\n",
        ],
        [
          `![image](/logo.svg "title" =200x12a)`,
          "<p>![image](/logo.svg &quot;title&quot; =200x12a)</p>\n",
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });
  });

  it("should not render with capital X or math times", () => {
    const testCases = [
      [`![image](/logo.svg =200X300)`, "<p>![image](/logo.svg =200X300)</p>\n"],
      [`![image](/logo.svg =200×300)`, "<p>![image](/logo.svg =200×300)</p>\n"],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });
});

describe("work with figure plugin", () => {
  // oxlint-disable-next-line typescript/no-deprecated
  const markdownIt1 = MarkdownIt().use(legacyImgSize).use(figure);
  // oxlint-disable-next-line typescript/no-deprecated
  const markdownIt2 = MarkdownIt().use(figure).use(legacyImgSize);

  it("should render with figure", () => {
    const testCases = [
      [
        `![image](/logo.svg =200x300)`,
        '<figure><img src="/logo.svg" alt="image" width="200" height="300" tabindex="0"><figcaption>image</figcaption></figure>\n',
      ],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt1.render(input)).toEqual(expected);
      expect(markdownIt2.render(input)).toEqual(expected);
    });
  });
});

describe("legacy-img-size silent mode", () => {
  // oxlint-disable-next-line typescript/no-deprecated
  const markdownIt = MarkdownIt().use(legacyImgSize);

  it("should handle silent mode", () => {
    expect(markdownIt.render('[![image](/logo.svg "title" =100x200)](url)')).toContain(
      '<a href="url"><img src="/logo.svg" alt="image" title="title" width="100" height="200"></a>',
    );
  });
});
