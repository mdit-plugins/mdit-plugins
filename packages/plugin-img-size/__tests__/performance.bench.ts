// oxlint-disable vitest/require-hook
import MarkdownIt from "markdown-it";
import { describe } from "vitest";

import type { BenchPlugin } from "../../../scripts/bench.ts";
import { defineBench, loadBaseline, loadCurrent } from "../../../scripts/bench.ts";

const baselineModule = await loadBaseline("plugin-img-size");
const currentModule = await loadCurrent("plugin-img-size");
const oldObsidianImgSize = baselineModule.obsidianImgSize as BenchPlugin;
const oldImgSize = baselineModule.imgSize as BenchPlugin;
const newObsidianImgSize = currentModule.obsidianImgSize as BenchPlugin;
const newImgSize = currentModule.imgSize as BenchPlugin;

const generateMarkdownWithImages = (count: number, format: "normal" | "obsidian"): string => {
  let markdown = "";

  for (let i = 0; i < count; i++) {
    markdown +=
      format === "normal"
        ? `![Image ${i} =300x200](/path/to/image-${i}.png "Image ${i} Title")\n\n`
        : `![Image ${i}|300x200](/path/to/image-${i}.png "Image ${i} Title")\n\n`;

    markdown += `This is a paragraph with some text. It describes image ${i}.\n\n`;
  }

  return markdown;
};

describe("imgSize plugin performance", () => {
  const smallContent = generateMarkdownWithImages(10, "normal");
  const mediumContent = generateMarkdownWithImages(50, "normal");
  const largeContent = generateMarkdownWithImages(200, "normal");

  defineBench("old imgSize - Small content", () => {
    const md = new MarkdownIt().use(oldImgSize);
    md.render(smallContent);
  });

  defineBench("new imgSize - Small content", () => {
    const md = new MarkdownIt().use(newImgSize);
    md.render(smallContent);
  });

  defineBench("old imgSize - Medium content", () => {
    const md = new MarkdownIt().use(oldImgSize);
    md.render(mediumContent);
  });

  defineBench("new imgSize - Medium content", () => {
    const md = new MarkdownIt().use(newImgSize);
    md.render(mediumContent);
  });

  defineBench("old imgSize - Large content", () => {
    const md = new MarkdownIt().use(oldImgSize);
    md.render(largeContent);
  });

  defineBench("new imgSize - Large content", () => {
    const md = new MarkdownIt().use(newImgSize);
    md.render(largeContent);
  });
});

describe("obsidianImgSize plugin performance", () => {
  const smallContent = generateMarkdownWithImages(10, "obsidian");
  const mediumContent = generateMarkdownWithImages(50, "obsidian");
  const largeContent = generateMarkdownWithImages(200, "obsidian");

  defineBench("old obsidianImgSize - Small content", () => {
    const md = new MarkdownIt().use(oldObsidianImgSize);
    md.render(smallContent);
  });

  defineBench("new obsidianImgSize - Small content", () => {
    const md = new MarkdownIt().use(newObsidianImgSize);
    md.render(smallContent);
  });

  defineBench("old obsidianImgSize - Medium content", () => {
    const md = new MarkdownIt().use(oldObsidianImgSize);
    md.render(mediumContent);
  });

  defineBench("new obsidianImgSize - Medium content", () => {
    const md = new MarkdownIt().use(newObsidianImgSize);
    md.render(mediumContent);
  });

  defineBench("old obsidianImgSize - Large content", () => {
    const md = new MarkdownIt().use(oldObsidianImgSize);
    md.render(largeContent);
  });

  defineBench("new obsidianImgSize - Large content", () => {
    const md = new MarkdownIt().use(newObsidianImgSize);
    md.render(largeContent);
  });
});
