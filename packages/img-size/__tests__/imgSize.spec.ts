import { figure } from "@mdit/plugin-figure";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { imgSize } from "../src/index.js";

describe("default image size", () => {
  const markdownIt = MarkdownIt().use(imgSize);

  describe("should not break original image syntax", () => {
    it("simple", () => {
      const testCases = [
        [`![image](/logo.svg)`, '<p><img src="/logo.svg" alt="image"></p>\n'],
        [`![image]( /logo.svg)`, '<p><img src="/logo.svg" alt="image"></p>\n'],
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

  describe("should render with width and height", () => {
    it("simple", () => {
      const testCases = [
        [
          `![image =200x300](/logo.svg)`,
          '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
        ],
        [
          `![image =200x300 ](/logo.svg)`,
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
          `![image =200x300](/logo.svg "title")`,
          '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with label", () => {
      const testCases = [
        [
          `\
![image =200x300][logo]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
        ],
        [
          `\
![image =200x300] [logo]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
        ],
        [
          `\
![logo =200x300]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="logo" width="200" height="300"></p>\n',
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
![image =200x300][logo]

[logo]: /logo.svg "title"
`,
          '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
        ],
        [
          `\
![logo =200x300]

[logo]: /logo.svg "title"
`,
          '<p><img src="/logo.svg" alt="logo" title="title" width="200" height="300"></p>\n',
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
        [`![image =200x](/logo.svg)`, '<p><img src="/logo.svg" alt="image" width="200"></p>\n'],
        [`![image =x300](/logo.svg)`, '<p><img src="/logo.svg" alt="image" height="300"></p>\n'],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with title", () => {
      const testCases = [
        [
          `![image =200x](/logo.svg "title")`,
          '<p><img src="/logo.svg" alt="image" title="title" width="200"></p>\n',
        ],
        [
          `![image =x300](/logo.svg "title")`,
          '<p><img src="/logo.svg" alt="image" title="title" height="300"></p>\n',
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with label", () => {
      const testCases = [
        [
          `\
![image =200x][logo]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
        ],
        [
          `\
![logo =200x]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="logo" width="200"></p>\n',
        ],
        [
          `\
![image =x300][logo]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="image" height="300"></p>\n',
        ],
        [
          `\
![logo =x300]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="logo" height="300"></p>\n',
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
![image =200x][logo]

[logo]: /logo.svg "title"
`,
          '<p><img src="/logo.svg" alt="image" title="title" width="200"></p>\n',
        ],
        [
          `\
![logo =200x]

[logo]: /logo.svg "title"
`,
          '<p><img src="/logo.svg" alt="logo" title="title" width="200"></p>\n',
        ],
        [
          `\
![image =x300][logo]

[logo]: /logo.svg "title"
`,
          '<p><img src="/logo.svg" alt="image" title="title" height="300"></p>\n',
        ],
        [
          `\
![logo =x300]

[logo]: /logo.svg "title"
`,
          '<p><img src="/logo.svg" alt="logo" title="title" height="300"></p>\n',
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });
  });

  it("should not render if width or height is not number", () => {
    const testCases = [
      [`![image =!bcxdef](/logo.svg)`, '<p><img src="/logo.svg" alt="image =!bcxdef"></p>\n'],
      [`![image =abcx100](/logo.svg)`, '<p><img src="/logo.svg" alt="image =abcx100"></p>\n'],
      [`![image =200xdef](/logo.svg)`, '<p><img src="/logo.svg" alt="image =200xdef"></p>\n'],
      [`![image =12ax300](/logo.svg)`, '<p><img src="/logo.svg" alt="image =12ax300"></p>\n'],
      [`![image =200x12a](/logo.svg)`, '<p><img src="/logo.svg" alt="image =200x12a"></p>\n'],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("should not render with capital X or math times", () => {
    const testCases = [
      [`![image =200X300](/logo.svg)`, '<p><img src="/logo.svg" alt="image =200X300"></p>\n'],
      [`![image =200×300](/logo.svg)`, '<p><img src="/logo.svg" alt="image =200×300"></p>\n'],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("image syntax check", () => {
    const testCases = [
      [
        `![image =200x300]( /logo.svg)`,
        '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
      ],
      [
        `![image =200x300](data:unknown;base64,abc)`,
        "<p>![image =200x300](data:unknown;base64,abc)</p>\n",
      ],
      // Test for line 125: parseLinkLabel fails (malformed reference)
      [`![image =200x300][label`, "<p>![image =200x300][label</p>\n"],
      // Test for line 139-141: reference doesn't exist
      [`![image =200x300][undefined]`, "<p>![image =200x300][undefined]</p>\n"],
      // Additional test for line 125: invalid reference label syntax
      [`![image =200x300][\nbroken]`, "<p>![image =200x300][\nbroken]</p>\n"],
      // Test for line 125: parseLinkLabel fails with complex malformed reference
      [`![image =200x300][`, "<p>![image =200x300][</p>\n"],
      // Test for line 139-141: reference exists but is empty
      [
        `\
![image =200x300][empty]

[empty]:
`,
        "<p>![image =200x300][empty]</p>\n<p>[empty]:</p>\n",
      ],
      [`![image`, "<p>![image</p>\n"],
      [`![image =200x300](  `, "<p>![image =200x300](</p>\n"],
      [`![image =200x300](<)`, "<p>![image =200x300](&lt;)</p>\n"],
      [
        `![image =200x300](/logo.svg "title" aa)`,
        "<p>![image =200x300](/logo.svg &quot;title&quot; aa)</p>\n",
      ],

      [
        `
![image =200x300][logo

[logo]: /logo.svg
`,
        "<p>![image =200x300][logo</p>\n",
      ],
      [
        `
![image =200x300][logo1]

[logo2]: /logo.svg
`,
        "<p>![image =200x300][logo1]</p>\n",
      ],
      [`![image =](/logo.svg)`, '<p><img src="/logo.svg" alt="image ="></p>\n'],
      [`![image=200x300](/logo.svg)`, '<p><img src="/logo.svg" alt="image=200x300"></p>\n'],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });
});

describe("work with figure plugin", () => {
  const markdownIt1 = MarkdownIt().use(imgSize).use(figure);
  const markdownIt2 = MarkdownIt().use(figure).use(imgSize);

  it("should render with figure", () => {
    const testCases = [
      [
        `![image =200x300](/logo.svg)`,
        '<figure><img src="/logo.svg" alt="image" width="200" height="300" tabindex="0"><figcaption>image</figcaption></figure>\n',
      ],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt1.render(input)).toEqual(expected);
      expect(markdownIt2.render(input)).toEqual(expected);
    });
  });
});
