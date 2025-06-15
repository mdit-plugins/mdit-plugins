import { describe, bench } from "vitest";
import MarkdownIt from "markdown-it";
import { container as containerNew } from "../src/index.js";
// @ts-ignore
import { container as containerOld } from "../src-old/index.js";

describe("Container Plugin Benchmark", () => {
  // 初始化 MarkdownIt 实例并使用插件，避免在 bench 中重复 use
  const mdOld = new MarkdownIt().use(containerOld, { name: "info" });
  const mdNew = new MarkdownIt().use(containerNew, { name: "info" });

  // 小文档测试用例
  describe("Small Document (1,000 chars)", () => {
    const smallContent = `
::: info
# Small Container Demo
This is a small document for benchmarking the container plugin.

- List item 1
- List item 2
- List item 3

## Code Example
\`\`\`js
// This is a simple function
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

> This is a blockquote in the container
> With multiple lines

1. First ordered item
2. Second ordered item
3. Third ordered item
:::
`;

    bench("Old Implementation", () => {
      mdOld.render(smallContent);
    });

    bench("New Implementation", () => {
      mdNew.render(smallContent);
    });
  });

  // 中等文档测试用例
  describe("Medium Document (5,000+ chars)", () => {
    const mediumContent = `
::: info
# Medium Container Demo
This is a medium sized document for benchmarking the container plugin.

${Array(10)
  .fill(
    `
## Section Title

This is some paragraph text with **bold formatting** and *italics* and \`inline code\`.

\`\`\`js
// This is a code block
function complexCalculation(a, b) {
  const result = a * b + Math.sqrt(a + b);
  return result.toFixed(2);
}

// More complex code
class ContainerClass {
  constructor(name) {
    this.name = name;
    this.created = new Date();
  }
  
  greet() {
    return \`Hello, I am \${this.name}!\`;
  }
  
  static create(names) {
    return names.map(name => new ContainerClass(name));
  }
}
\`\`\`

> This is a blockquote
> With nested formatting like **bold** and *italics*
> And multiple lines

1. First ordered item with some longer text to make the content more realistic
2. Second ordered item with some longer text to make the content more realistic
3. Third ordered item with some longer text to make the content more realistic

- Unordered list item 1
  - Nested item 1.1
  - Nested item 1.2
- Unordered list item 2
  - Nested item 2.1
  - Nested item 2.2
`,
  )
  .join("")}
:::
`;

    bench("Old Implementation", () => {
      mdOld.render(mediumContent);
    });

    bench("New Implementation", () => {
      mdNew.render(mediumContent);
    });
  });

  // 大型文档测试用例
  describe("Large Document (10,000+ chars)", () => {
    const largeContent = `
::: info
# Large Container Demo
${Array(20)
  .fill(
    `
## Major Section

This is a large document for benchmarking the container plugin with complex content and structure.

### Subsection 1

This section contains multiple paragraphs, lists, code blocks, and other markdown elements to simulate a realistic large document.

Here's some paragraph text with **bold formatting**, *italics*, and \`inline code\`. We need to make sure the document has enough content to properly test performance.

\`\`\`js
// This is a complex code block
function processData(data) {
  return data
    .filter(item => item.value > 10)
    .map(item => ({
      ...item,
      processed: true,
      score: calculateScore(item),
      timestamp: new Date().toISOString()
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function calculateScore(item) {
  const baseScore = item.value * item.weight;
  const modifier = item.isSpecial ? 1.5 : 1;
  const ageModifier = Math.exp(-item.age / 100);
  return baseScore * modifier * ageModifier;
}

class DataProcessor {
  constructor(config) {
    this.config = {
      threshold: 10,
      maxResults: 100,
      sortField: 'score',
      ...config
    };
    this.cache = new Map();
  }
  
  process(data) {
    const cacheKey = JSON.stringify(data.slice(0, 5));
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const results = processData(data);
    this.cache.set(cacheKey, results);
    return results;
  }
}
\`\`\`

> This is a complex blockquote
> With nested formatting like **bold** and *italics*
> And multiple lines of text
> 
> > Even with nested blockquotes
> > That contain more text and formatting
>
> And then back to the original level
`,
  )
  .join("")}
:::
`;

    bench("Old Implementation", () => {
      mdOld.render(largeContent);
    });

    bench("New Implementation", () => {
      mdNew.render(largeContent);
    });
  });

  // 真实文档测试用例
  describe("Real-world Document", () => {
    const realContent = `
::: info Information Container
This is an information container with some content.
:::

Some text between containers.

::: warning
# Warning Container
This is warning content.
:::

More text between containers.

::: danger
# Danger Container
This is dangerous content.
:::
`;

    // 这里需要为多容器测试单独创建 MarkdownIt 实例
    bench("Old Implementation", () => {
      const md = new MarkdownIt()
        .use(containerOld, { name: "info" })
        .use(containerOld, { name: "warning" })
        .use(containerOld, { name: "danger" });

      md.render(realContent);
    });

    bench("New Implementation", () => {
      const md = new MarkdownIt()
        .use(containerNew, { name: "info" })
        .use(containerNew, { name: "warning" })
        .use(containerNew, { name: "danger" });

      md.render(realContent);
    });
  });
});
