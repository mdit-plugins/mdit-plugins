import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { imgSize, legacyImgSize, obsidianImgSize } from "../src/index.js";

describe("working together", () => {
  // legacyImgSize must be used before the other two
  const markdownIt = MarkdownIt({ linkify: true })
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    .use(legacyImgSize)
    .use(imgSize)
    .use(obsidianImgSize);

  it("original", () => {
    expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image"></p>\n',
    );

    expect(markdownIt.render(`![image]( /logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image"></p>\n',
    );

    expect(markdownIt.render(`![image](data:script)`)).toEqual(
      "<p>![image](data:script)</p>\n",
    );

    expect(markdownIt.render(`![image](/logo.svg "title")`)).toEqual(
      '<p><img src="/logo.svg" alt="image" title="title"></p>\n',
    );

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

    expect(
      markdownIt.render(`\
![image][logo]

[logo]: /logo.svg "title"
`),
    ).toEqual('<p><img src="/logo.svg" alt="image" title="title"></p>\n');
  });

  it("img size", () => {
    expect(markdownIt.render(`![image =200x300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
    );
    expect(markdownIt.render(`![image =200x300](/logo.svg "title")`)).toEqual(
      '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
    );
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
    expect(
      markdownIt.render(
        `\
![logo =200x300]

[logo]: /logo.svg
`,
      ),
    ).toEqual(
      '<p><img src="/logo.svg" alt="logo" width="200" height="300"></p>\n',
    );
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
    expect(
      markdownIt.render(
        `\
![logo =200x300]

[logo]: /logo.svg "title"
`,
      ),
    ).toEqual(
      '<p><img src="/logo.svg" alt="logo" title="title" width="200" height="300"></p>\n',
    );
    expect(markdownIt.render(`![image =200x](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
    );
    expect(markdownIt.render(`![image =x300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" height="300"></p>\n',
    );
    expect(markdownIt.render(`![image =200x](/logo.svg "title")`)).toEqual(
      '<p><img src="/logo.svg" alt="image" title="title" width="200"></p>\n',
    );
    expect(markdownIt.render(`![image =x300](/logo.svg "title")`)).toEqual(
      '<p><img src="/logo.svg" alt="image" title="title" height="300"></p>\n',
    );
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
![logo =200x]

[logo]: /logo.svg
`,
      ),
    ).toEqual('<p><img src="/logo.svg" alt="logo" width="200"></p>\n');
    expect(
      markdownIt.render(
        `\
![image =x300][logo]

[logo]: /logo.svg
`,
      ),
    ).toEqual('<p><img src="/logo.svg" alt="image" height="300"></p>\n');
    expect(
      markdownIt.render(
        `\
![logo =x300]

[logo]: /logo.svg
`,
      ),
    ).toEqual('<p><img src="/logo.svg" alt="logo" height="300"></p>\n');
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
![logo =200x]

[logo]: /logo.svg "title"
`,
      ),
    ).toEqual(
      '<p><img src="/logo.svg" alt="logo" title="title" width="200"></p>\n',
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
    expect(
      markdownIt.render(
        `\
![logo =x300]

[logo]: /logo.svg "title"
`,
      ),
    ).toEqual(
      '<p><img src="/logo.svg" alt="logo" title="title" height="300"></p>\n',
    );
  });

  it("obsidian img size", () => {
    expect(markdownIt.render(`![image|200x300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
    );
    expect(markdownIt.render(`![image|200x300](/logo.svg "title")`)).toEqual(
      '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
    );
    expect(
      markdownIt.render(
        `\
![image|200x300][logo]

[logo]: /logo.svg
    `,
      ),
    ).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
    );
    expect(
      markdownIt.render(
        `\
![logo|200x300]

[logo]: /logo.svg
    `,
      ),
    ).toEqual(
      '<p><img src="/logo.svg" alt="logo" width="200" height="300"></p>\n',
    );
    expect(
      markdownIt.render(
        `\
![image|200x300][logo]

[logo]: /logo.svg "title"
    `,
      ),
    ).toEqual(
      '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
    );
    expect(
      markdownIt.render(
        `\
![logo|200x300]

[logo]: /logo.svg "title"
    `,
      ),
    ).toEqual(
      '<p><img src="/logo.svg" alt="logo" title="title" width="200" height="300"></p>\n',
    );
  });

  it("legacy img size", () => {
    expect(markdownIt.render(`![image](/logo.svg =200x300)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
    );
    expect(markdownIt.render(`![image](/logo.svg "title" =200x300)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" title="title" width="200" height="300"></p>\n',
    );
    expect(markdownIt.render(`![image](/logo.svg =200x)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
    );
    expect(markdownIt.render(`![image](/logo.svg =x300)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" height="300"></p>\n',
    );
    expect(markdownIt.render(`![image](/logo.svg "title" =200x)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" title="title" width="200"></p>\n',
    );
    expect(markdownIt.render(`![image](/logo.svg "title" =x300)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" title="title" height="300"></p>\n',
    );
  });
});
