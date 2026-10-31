// oxlint-disable vitest/require-hook
import MarkdownIt from "markdown-it";
import { describe } from "vitest";

import type { BenchPlugin } from "../../../scripts/bench.ts";
import { defineBench, loadBaseline, loadCurrent } from "../../../scripts/bench.ts";

const baselineModule = await loadBaseline("plugin-alert");
const currentModule = await loadCurrent("plugin-alert");
const originalAlert = baselineModule.alert as BenchPlugin;
const alert = currentModule.alert as BenchPlugin;

const generateTestContent = (size: "small" | "medium" | "large"): string => {
  const alertTypes = ["note", "tip", "warning", "caution", "important"];
  let content = "";

  // oxlint-disable-next-line default-case
  switch (size) {
    case "small": {
      for (let i = 0; i < 10; i++) {
        const type = alertTypes[i % alertTypes.length];
        content += `>[!${type}]\n> This is a ${type} alert with some content.\n> Second line of the alert.\n\n`;
      }
      break;
    }

    case "medium": {
      for (let i = 0; i < 50; i++) {
        const type = alertTypes[i % alertTypes.length];
        content += `>[!${type}]\n> This is a ${type} alert with some content.\n> Second line of the alert.\n> Third line with more text.\n\n`;
      }
      break;
    }

    case "large": {
      for (let i = 0; i < 100; i++) {
        const type = alertTypes[i % alertTypes.length];
        content += `>[!${type}]\n> This is a ${type} alert with detailed content.\n> Second line of the alert with more information.\n> Third line explaining something important.\n> Fourth line concluding the point.\n\n`;
      }
      break;
    }
  }

  return content;
};

describe("alert Plugin Performance Benchmarks", () => {
  const testCases = {
    small: generateTestContent("small"),
    medium: generateTestContent("medium"),
    large: generateTestContent("large"),
  };

  defineBench("small document - Original", () => {
    const md = new MarkdownIt().use(originalAlert);
    md.render(testCases.small);
  });

  defineBench("small document - Optimized", () => {
    const md = new MarkdownIt().use(alert);
    md.render(testCases.small);
  });

  defineBench("medium document - Original", () => {
    const md = new MarkdownIt().use(originalAlert);
    md.render(testCases.medium);
  });

  defineBench("medium document - Optimized", () => {
    const md = new MarkdownIt().use(alert);
    md.render(testCases.medium);
  });

  defineBench("large document - Original", () => {
    const md = new MarkdownIt().use(originalAlert);
    md.render(testCases.large);
  });

  defineBench("large document - Optimized", () => {
    const md = new MarkdownIt().use(alert);
    md.render(testCases.large);
  });
});
