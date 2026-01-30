// oxlint-disable typescript/no-unsafe-argument
import { bench, describe } from "vitest";
import MarkdownIt from "markdown-it";

import { obsidianImgSize as newObsidianImgSize } from "../src/obsidian.js";
import { imgSize as newImgSize } from "../src/plugin.js";

// @ts-ignore: file may not exist
import { obsidianImgSize as oldObsidianImgSize } from "../src-old/obsidian.js";
// @ts-ignore: file may not exist
import { imgSize as oldImgSize } from "../src-old/plugin.js";

const generateMarkdownWithImages = (count: number, format: "normal" | "obsidian"): string => {
  let markdown = "";

  for (let i = 0; i < count; i++) {
    if (format === "normal")
      markdown += `![Image ${i} =300x200](/path/to/image-${i}.png "Image ${i} Title")\n\n`;
    else markdown += `![Image ${i}|300x200](/path/to/image-${i}.png "Image ${i} Title")\n\n`;

    markdown += `This is a paragraph with some text. It describes image ${i}.\n\n`;
  }

  return markdown;
};

describe("imgSize plugin performance", () => {
  const smallContent = generateMarkdownWithImages(10, "normal");
  const mediumContent = generateMarkdownWithImages(50, "normal");
  const largeContent = generateMarkdownWithImages(200, "normal");

  bench("Old imgSize - Small content", () => {
    const md = MarkdownIt().use(oldImgSize);
    md.render(smallContent);
  });

  bench("New imgSize - Small content", () => {
    const md = MarkdownIt().use(newImgSize);
    md.render(smallContent);
  });

  bench("Old imgSize - Medium content", () => {
    const md = MarkdownIt().use(oldImgSize);
    md.render(mediumContent);
  });

  bench("New imgSize - Medium content", () => {
    const md = MarkdownIt().use(newImgSize);
    md.render(mediumContent);
  });

  bench("Old imgSize - Large content", () => {
    const md = MarkdownIt().use(oldImgSize);
    md.render(largeContent);
  });

  bench("New imgSize - Large content", () => {
    const md = MarkdownIt().use(newImgSize);
    md.render(largeContent);
  });
});

describe("obsidianImgSize plugin performance", () => {
  const smallContent = generateMarkdownWithImages(10, "obsidian");
  const mediumContent = generateMarkdownWithImages(50, "obsidian");
  const largeContent = generateMarkdownWithImages(200, "obsidian");

  bench("Old obsidianImgSize - Small content", () => {
    const md = MarkdownIt().use(oldObsidianImgSize);
    md.render(smallContent);
  });

  bench("New obsidianImgSize - Small content", () => {
    const md = MarkdownIt().use(newObsidianImgSize);
    md.render(smallContent);
  });

  bench("Old obsidianImgSize - Medium content", () => {
    const md = MarkdownIt().use(oldObsidianImgSize);
    md.render(mediumContent);
  });

  bench("New obsidianImgSize - Medium content", () => {
    const md = MarkdownIt().use(newObsidianImgSize);
    md.render(mediumContent);
  });

  bench("Old obsidianImgSize - Large content", () => {
    const md = MarkdownIt().use(oldObsidianImgSize);
    md.render(largeContent);
  });

  bench("New obsidianImgSize - Large content", () => {
    const md = MarkdownIt().use(newObsidianImgSize);
    md.render(largeContent);
  });
});
