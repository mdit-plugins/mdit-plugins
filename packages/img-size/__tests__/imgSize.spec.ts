import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { imgSize } from "../src/index.js";

describe("default image Size", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(imgSize);

  it("should render", () => {
    expect(markdownIt.render(`![](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt=""></p>\n',
    );

    expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image"></p>\n',
    );

    expect(markdownIt.render(`![image|200x300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
    );

    expect(markdownIt.render(`![image|200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
    );

    expect(markdownIt.render(`![image|200x](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
    );

    expect(markdownIt.render(`![image|200x0](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
    );

    expect(markdownIt.render(`![image|0x200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" height="200"></p>\n',
    );

    expect(markdownIt.render(`![image|x200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" height="200"></p>\n',
    );
  });

  it("should not render", () => {
    expect(markdownIt.render(`![image|abcxdef](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|abcxdef"></p>\n',
    );

    expect(markdownIt.render(`![image|abcx100](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|abcx100"></p>\n',
    );

    expect(markdownIt.render(`![image|200xdef](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200xdef"></p>\n',
    );

    expect(markdownIt.render(`![image|12ax300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|12ax300"></p>\n',
    );

    expect(markdownIt.render(`![image|200x12a](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200x12a"></p>\n',
    );

    expect(markdownIt.render(`![image|200X300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200X300"></p>\n',
    );

    expect(markdownIt.render(`![image|200×300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200×300"></p>\n',
    );

    expect(markdownIt.render(`![image|0x0](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|0x0"></p>\n',
    );
  });
});

describe("default image Size with strict", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(imgSize, {
    strict: true,
  });

  it("should render", () => {
    expect(markdownIt.render(`![](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt=""></p>\n',
    );

    expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image"></p>\n',
    );

    expect(markdownIt.render(`![image|200x300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
    );

    expect(markdownIt.render(`![image|200x0](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
    );

    expect(markdownIt.render(`![image|0x200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" height="200"></p>\n',
    );
  });

  it("should not render", () => {
    expect(markdownIt.render(`![image|200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200"></p>\n',
    );

    expect(markdownIt.render(`![image|200x](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200x"></p>\n',
    );
    expect(markdownIt.render(`![image|x200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|x200"></p>\n',
    );

    expect(markdownIt.render(`![image|abcxdef](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|abcxdef"></p>\n',
    );

    expect(markdownIt.render(`![image|abcx100](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|abcx100"></p>\n',
    );

    expect(markdownIt.render(`![image|200xdef](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200xdef"></p>\n',
    );

    expect(markdownIt.render(`![image|12ax300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|12ax300"></p>\n',
    );

    expect(markdownIt.render(`![image|200x12a](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200x12a"></p>\n',
    );

    expect(markdownIt.render(`![image|200X300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200X300"></p>\n',
    );

    expect(markdownIt.render(`![image|200×300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200×300"></p>\n',
    );

    expect(markdownIt.render(`![image|0x0](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|0x0"></p>\n',
    );
  });
});
