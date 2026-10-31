// oxlint-disable vitest/require-hook
import MarkdownIt from "markdown-it";
import type { MarkdownIt as MarkdownItType } from "markdown-it";
import { describe } from "vitest";

import type { BenchPlugin } from "../../../scripts/bench.ts";
import { defineBench, loadBaseline, loadCurrent } from "../../../scripts/bench.ts";

const baselineModule = await loadBaseline("plugin-tasklist");
const currentModule = await loadCurrent("plugin-tasklist");
const tasklistOriginal = baselineModule.tasklist as BenchPlugin;
const tasklistOptimized = currentModule.tasklist as BenchPlugin;

const createTestContent = (size: "small" | "medium" | "large"): string => {
  const simpleTasks = `- [ ] Simple task 1\n- [x] Completed task 2\n- [ ] Simple task 3\n\n`;

  const nestedTasks =
    "- [ ] Parent task {.parent}\n  - [ ] Child task 1 {.child}\n  - [x] Child task 2\n    - [ ] Grandchild task\n\n";

  const complexTasks =
    "- [ ] Task with inline code `code(){}` {.code}\n- [ ] Task with link [example](https://example.com){.link}\n- [x] Task with image ![alt](/img.png){.img}\n\n";

  const checklistBlock = `> Checklist block:\n> - [ ] item a\n> - [x] item b\n> - [ ] item c\n\n`;

  const fencedWithTasks =
    "```text\n- [ ] task in fenced block (should not be converted)\n- [x] done\n```\n\n";

  const mixedList = "1. Ordered item {.num}\n2. Another ordered\n\n- Unrelated bullet\n\n";

  const basicUnit =
    simpleTasks + nestedTasks + complexTasks + checklistBlock + fencedWithTasks + mixedList;

  switch (size) {
    case "small": {
      return basicUnit.repeat(3);
    }
    case "medium": {
      return basicUnit.repeat(8);
    }
    case "large": {
      return basicUnit.repeat(20);
    }
    default: {
      return basicUnit;
    }
  }
};

const smallContent = createTestContent("small");
const mediumContent = createTestContent("medium");
const largeContent = createTestContent("large");

const createOriginalRenderer = (): MarkdownItType => new MarkdownIt().use(tasklistOriginal);
const createOptimizedRenderer = (): MarkdownItType => new MarkdownIt().use(tasklistOptimized);

describe("tasklist: Original vs Optimized Performance", () => {
  describe("small document", () => {
    defineBench("original version", () => {
      const mdIt = createOriginalRenderer();
      mdIt.render(smallContent);
    });

    defineBench("optimized version", () => {
      const mdIt = createOptimizedRenderer();
      mdIt.render(smallContent);
    });
  });

  describe("medium document", () => {
    defineBench("original version", () => {
      const mdIt = createOriginalRenderer();
      mdIt.render(mediumContent);
    });

    defineBench("optimized version", () => {
      const mdIt = createOptimizedRenderer();
      mdIt.render(mediumContent);
    });
  });

  describe("large document", () => {
    defineBench("original version", () => {
      const mdIt = createOriginalRenderer();
      mdIt.render(largeContent);
    });

    defineBench("optimized version", () => {
      const mdIt = createOptimizedRenderer();
      mdIt.render(largeContent);
    });
  });

  describe("real document test (tasklist documentation)", () => {
    const realDocContent = [
      "---",
      'title: "@mdit/plugin-tasklist"',
      "---",
      "",
      "# Tasklist plugin",
      "",
      "This document demonstrates tasklist usage.",
      "",
      "- [ ] Write tests {.todo}",
      "- [x] Implement feature {.done}",
      "",
      "## Nested",
      "",
      "- [ ] Parent",
      "  - [ ] Child A",
      "  - [x] Child B",
      "",
      "> Note: blockquote with tasks should be supported.",
      "",
      "## Fences",
      "",
      "Some fenced code:",
      "",
      "```md",
      "- [ ] not a task inside fence",
      "```",
      "",
      "## Mixed content",
      "",
      "1. Step one",
      "2. Step two",
      "",
      "- [ ] Final checklist item",
      "",
    ].join("\n");

    defineBench("original version - Real document", () => {
      const mdIt = createOriginalRenderer();
      mdIt.render(realDocContent);
    });

    defineBench("optimized version - Real document", () => {
      const mdIt = createOptimizedRenderer();
      mdIt.render(realDocContent);
    });
  });
});
