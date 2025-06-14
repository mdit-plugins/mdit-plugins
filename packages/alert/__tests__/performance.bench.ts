import { bench, describe } from "vitest";
import MarkdownIt from "markdown-it";

import { alert } from "../src/index.js";
// @ts-ignore
import { alert as originalAlert } from "../src-old/index.js";

const generateTestContent = (size: "small" | "medium" | "large"): string => {
  const alertTypes = ["note", "tip", "warning", "caution", "important"];
  let content = "";

  switch (size) {
    case "small":
      for (let i = 0; i < 10; i++) {
        const type = alertTypes[i % alertTypes.length];
        content += `>[!${type}]\n> This is a ${type} alert with some content.\n> Second line of the alert.\n\n`;
      }
      break;

    case "medium":
      for (let i = 0; i < 50; i++) {
        const type = alertTypes[i % alertTypes.length];
        content += `>[!${type}]\n> This is a ${type} alert with some content.\n> Second line of the alert.\n> Third line with more text.\n\n`;
      }
      break;

    case "large":
      for (let i = 0; i < 100; i++) {
        const type = alertTypes[i % alertTypes.length];
        content += `>[!${type}]\n> This is a ${type} alert with detailed content.\n> Second line of the alert with more information.\n> Third line explaining something important.\n> Fourth line concluding the point.\n\n`;
      }
      break;
  }

  return content;
};

describe("Alert Plugin Performance Benchmarks", () => {
  const testCases = {
    small: generateTestContent("small"),
    medium: generateTestContent("medium"),
    large: generateTestContent("large"),
  };

  bench("Small document - Original", () => {
    const md = new MarkdownIt().use(originalAlert);
    md.render(testCases.small);
  });

  bench("Small document - Optimized", () => {
    const md = new MarkdownIt().use(alert);
    md.render(testCases.small);
  });

  bench("Medium document - Original", () => {
    const md = new MarkdownIt().use(originalAlert);
    md.render(testCases.medium);
  });

  bench("Medium document - Optimized", () => {
    const md = new MarkdownIt().use(alert);
    md.render(testCases.medium);
  });

  bench("Large document - Original", () => {
    const md = new MarkdownIt().use(originalAlert);
    md.render(testCases.large);
  });

  bench("Large document - Optimized", () => {
    const md = new MarkdownIt().use(alert);
    md.render(testCases.large);
  });
});
