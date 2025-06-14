import { bench, describe } from "vitest";
import MarkdownIt from "markdown-it";

// 导入当前优化后的插件
import { alert } from "../src/index.js";
// 导入原始版本的插件
import { alert as originalAlert } from "../src-old/index.js";

// 生成包含不同长度 alert 内容的测试数据
const generateTestContent = (size: "small" | "medium" | "large"): string => {
  const alertTypes = ["note", "tip", "warning", "caution", "important"];
  let content = "";

  switch (size) {
    case "small":
      // 生成约 1000 字符的内容
      for (let i = 0; i < 10; i++) {
        const type = alertTypes[i % alertTypes.length];
        content += `>[!${type}]\n> This is a ${type} alert with some content.\n> Second line of the alert.\n\n`;
      }
      break;

    case "medium":
      // 生成约 5000 字符的内容
      for (let i = 0; i < 50; i++) {
        const type = alertTypes[i % alertTypes.length];
        content += `>[!${type}]\n> This is a ${type} alert with some content.\n> Second line of the alert.\n> Third line with more text.\n\n`;
      }
      break;

    case "large":
      // 生成约 10000+ 字符的内容
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

  // 小型文档测试
  bench("Small document - Original", () => {
    const md = new MarkdownIt().use(originalAlert);
    md.render(testCases.small);
  });

  bench("Small document - Optimized", () => {
    const md = new MarkdownIt().use(alert);
    md.render(testCases.small);
  });

  // 中型文档测试
  bench("Medium document - Original", () => {
    const md = new MarkdownIt().use(originalAlert);
    md.render(testCases.medium);
  });

  bench("Medium document - Optimized", () => {
    const md = new MarkdownIt().use(alert);
    md.render(testCases.medium);
  });

  // 大型文档测试
  bench("Large document - Original", () => {
    const md = new MarkdownIt().use(originalAlert);
    md.render(testCases.large);
  });

  bench("Large document - Optimized", () => {
    const md = new MarkdownIt().use(alert);
    md.render(testCases.large);
  });
});
