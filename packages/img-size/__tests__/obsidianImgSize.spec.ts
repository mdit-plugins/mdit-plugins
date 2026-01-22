import { figure } from "@mdit/plugin-figure";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { obsidianImgSize } from "../src/index.js";

describe("obsidian image size", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(obsidianImgSize);

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

  it("should not render", () => {
    const testCases = [
      [
        `\
![logo

[logo]: /logo.svg "title"
`,
        "<p>![logo</p>\n",
      ],
      [
        `\
![image|200x300](  
`,
        "<p>![image|200x300](</p>\n",
      ],
      [
        `\
![image|200x300][logo

[logo]: /logo.svg "title"
`,
        "<p>![image|200x300][logo</p>\n",
      ],
      [
        `\
![image| ](/logo.svg)
`,
        '<p><img src="/logo.svg" alt="image| "></p>\n',
      ],
      [
        `\
![image|200x300](<)
`,
        "<p>![image|200x300](&lt;)</p>\n",
      ],
      [
        `\
![image|200x300](/logo.svg "logo" aa)
`,
        "<p>![image|200x300](/logo.svg &quot;logo&quot; aa)</p>\n",
      ],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  describe("should render with width and height", () => {
    it("simple", () => {
      const testCases = [
        [
          `![image|200x300](/logo.svg)`,
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
          `![image|200x300](/logo.svg "title")`,
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
![image|200x300][logo]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
        ],
        [
          `\
![image|200x300]  [logo]

[logo]: /logo.svg
`,
          '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
        ],
        [
          `\
![logo|200x300]

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
![image|200x300][logo]

[logo]: /logo.svg "title"
`,
          '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
        ],
        [
          `\
![logo|200x300]

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

  describe("should render with width=0 or height=0", () => {
    it("simple", () => {
      const testCases = [
        [`![image|200x0](/logo.svg)`, '<p><img src="/logo.svg" alt="image" width="200"></p>\n'],
        [`![image|0x200](/logo.svg)`, '<p><img src="/logo.svg" alt="image" height="200"></p>\n'],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });

    it("with title", () => {
      const testCases = [
        [
          `![image|200x0](/logo.svg "title")`,
          '<p><img src="/logo.svg" alt="image" title="title" width="200"></p>\n',
        ],
        [
          `![image|0x200](/logo.svg "title")`,
          '<p><img src="/logo.svg" alt="image" title="title" height="200"></p>\n',
        ],
      ];

      testCases.forEach(([input, expected]) => {
        expect(markdownIt.render(input)).toEqual(expected);
      });
    });
  });

  it("should render with width=0 or height =0", () => {
    const testCases = [
      [`![image|0x0](/logo.svg)`, '<p><img src="/logo.svg" alt="image|0x0"></p>\n'],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("should not render if width or height is missing", () => {
    const testCases = [
      [`![image|200](/logo.svg)`, '<p><img src="/logo.svg" alt="image|200"></p>\n'],
      [`![image|200x](/logo.svg)`, '<p><img src="/logo.svg" alt="image|200x"></p>\n'],
      [`![image| 200 x](/logo.svg)`, '<p><img src="/logo.svg" alt="image| 200 x"></p>\n'],
      [`![image|x200](/logo.svg)`, '<p><img src="/logo.svg" alt="image|x200"></p>\n'],
      [`![image | x 200](/logo.svg)`, '<p><img src="/logo.svg" alt="image | x 200"></p>\n'],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("should render with multiple zeros", () => {
    const testCases = [
      [`![image|200x00](/logo.svg)`, '<p><img src="/logo.svg" alt="image" width="200"></p>\n'],
      [`![image|00x150](/logo.svg)`, '<p><img src="/logo.svg" alt="image" height="150"></p>\n'],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("should render with spaces", () => {
    const testCases = [
      [
        `![image|200 x 300](/logo.svg)`,
        '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
      ],
      [`![image|200 x 0](/logo.svg)`, '<p><img src="/logo.svg" alt="image" width="200"></p>\n'],
      [
        `![image  |  0 x 200](/logo.svg)`,
        '<p><img src="/logo.svg" alt="image" height="200"></p>\n',
      ],
      [
        `![image| 200 x 100 ](/logo.svg)`,
        '<p><img src="/logo.svg" alt="image" width="200" height="100"></p>\n',
      ],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("should not render if width or height is not number", () => {
    const testCases = [
      [`![image|abcxdef](/logo.svg)`, '<p><img src="/logo.svg" alt="image|abcxdef"></p>\n'],
      [`![image|abcx100](/logo.svg)`, '<p><img src="/logo.svg" alt="image|abcx100"></p>\n'],
      [`![image|200xdef](/logo.svg)`, '<p><img src="/logo.svg" alt="image|200xdef"></p>\n'],
      [`![image|12ax300](/logo.svg)`, '<p><img src="/logo.svg" alt="image|12ax300"></p>\n'],
      [`![image|200x12a](/logo.svg)`, '<p><img src="/logo.svg" alt="image|200x12a"></p>\n'],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("should not render with capital X or math times", () => {
    const testCases = [
      [`![image|200X300](/logo.svg)`, '<p><img src="/logo.svg" alt="image|200X300"></p>\n'],
      [`![image|200×300](/logo.svg)`, '<p><img src="/logo.svg" alt="image|200×300"></p>\n'],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });

  it("image syntax check", () => {
    const testCases = [
      [
        `![image|200x300]( /logo.svg)`,
        '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
      ],
      [
        `![image|200x300](data:unknown;base64,abc)`,
        "<p>![image|200x300](data:unknown;base64,abc)</p>\n",
      ],
      [`![image|200x300][[nested]`, "<p>![image|200x300][[nested]</p>\n"],
      [`![image|200x300][\nbroken`, "<p>![image|200x300][\nbroken</p>\n"],
      [`![image|200x300][unclosed\nreference`, "<p>![image|200x300][unclosed\nreference</p>\n"],
      [`![image|200x300][nonexistent]`, "<p>![image|200x300][nonexistent]</p>\n"],
      [
        `\
![image|200x300][empty]

[empty]:
`,
        "<p>![image|200x300][empty]</p>\n<p>[empty]:</p>\n",
      ],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt.render(input)).toEqual(expected);
    });
  });
});

describe("work with figure plugin", () => {
  const markdownIt1 = MarkdownIt().use(obsidianImgSize).use(figure);
  const markdownIt2 = MarkdownIt().use(figure).use(obsidianImgSize);

  it("should render with figure", () => {
    const testCases = [
      [
        `![image|200x300](/logo.svg)`,
        '<figure><img src="/logo.svg" alt="image" width="200" height="300" tabindex="0"><figcaption>image</figcaption></figure>\n',
      ],
    ];

    testCases.forEach(([input, expected]) => {
      expect(markdownIt1.render(input)).toEqual(expected);
      expect(markdownIt2.render(input)).toEqual(expected);
    });
  });
});
