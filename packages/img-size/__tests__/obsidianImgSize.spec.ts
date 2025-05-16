import { figure } from "@mdit/plugin-figure";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

import { obsidianImgSize } from "../src/index.js";

describe("obsidian image Size", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(obsidianImgSize);

  it("should not break original behavior", () => {
    expect(markdownIt.render(`![](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt=""></p>\n',
    );

    expect(markdownIt.render(`![image](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image"></p>\n',
    );
  });

  it("should render with width and height", () => {
    expect(markdownIt.render(`![image|200x300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
    );
  });

  it("should render with width=0 or height=0", () => {
    expect(markdownIt.render(`![image|200x0](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
    );

    expect(markdownIt.render(`![image|0x200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" height="200"></p>\n',
    );
  });

  it("should render with width=0 or height =0", () => {
    expect(markdownIt.render(`![image|0x0](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|0x0"></p>\n',
    );
  });

  it("should not render if width or height is missing", () => {
    expect(markdownIt.render(`![image|200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200"></p>\n',
    );

    expect(markdownIt.render(`![image|200x](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200x"></p>\n',
    );
    expect(markdownIt.render(`![image| 200 x](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image| 200 x"></p>\n',
    );

    expect(markdownIt.render(`![image|x200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|x200"></p>\n',
    );
    expect(markdownIt.render(`![image | x 200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image | x 200"></p>\n',
    );
  });

  it("should render with multiple zeros", () => {
    expect(markdownIt.render(`![image|200x00](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
    );

    expect(markdownIt.render(`![image|00x150](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" height="150"></p>\n',
    );
  });

  it("should render with spaces", () => {
    expect(markdownIt.render(`![image|200 x 300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200" height="300"></p>\n',
    );

    expect(markdownIt.render(`![image|200 x 0](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200"></p>\n',
    );

    expect(markdownIt.render(`![image  |  0 x 200](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" height="200"></p>\n',
    );

    expect(markdownIt.render(`![ image | 200 x 100 ](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image" width="200" height="100"></p>\n',
    );
  });

  it("should not render if width or height is not number", () => {
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
  });

  it("should not render with capital X or math times", () => {
    expect(markdownIt.render(`![image|200X300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200X300"></p>\n',
    );

    expect(markdownIt.render(`![image|200×300](/logo.svg)`)).toEqual(
      '<p><img src="/logo.svg" alt="image|200×300"></p>\n',
    );
  });
});

describe("work with figure plugin", () => {
  const markdownIt1 = MarkdownIt().use(obsidianImgSize).use(figure);
  const markdownIt2 = MarkdownIt().use(figure).use(obsidianImgSize);

  it("should render with figure", () => {
    expect(markdownIt1.render(`![image|200x300](/logo.svg)`)).toEqual(
      '<figure><img src="/logo.svg" alt="image" width="200" height="300" tabindex="0"><figcaption>image</figcaption></figure>\n',
    );
    expect(markdownIt2.render(`![image|200x300](/logo.svg)`)).toEqual(
      '<figure><img src="/logo.svg" alt="image" width="200" height="300" tabindex="0"><figcaption>image</figcaption></figure>\n',
    );
  });
});
