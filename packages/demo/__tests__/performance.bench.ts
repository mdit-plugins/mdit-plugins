import { describe, bench } from "vitest";
import MarkdownIt from "markdown-it";
import { demo as demoNew } from "../src/index.js";
// @ts-ignore
import { demo as demoOld } from "../src-old/index.js";

describe("Demo Plugin Benchmark", () => {
  // 初始化 MarkdownIt 实例并使用插件，避免在 bench 中重复 use
  const mdOld = new MarkdownIt().use(demoOld);
  const mdNew = new MarkdownIt().use(demoNew);

  // 小文档测试用例
  describe("Small Document (1,000 chars)", () => {
    const smallContent = `
::: demo Small Demo Title
# Small Document Demo
This is a small document for benchmarking the demo plugin.

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

> This is a blockquote in the demo
> With multiple lines

1. First ordered item
2. Second ordered item
3. Third ordered item

***

## Second Section
This is another section in the small document.

\`inline code\` and **bold text** and *italic text*.
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
::: demo Medium Demo Title
# Medium Document Demo
This is a medium sized document for benchmarking the demo plugin.

${
  // oxlint-disable-next-line unicorn/new-for-builtins
  Array(10)
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
class DemoClass {
  constructor(name) {
    this.name = name;
    this.created = new Date();
  }
  
  greet() {
    return \`Hello, I am \${this.name}!\`;
  }
  
  static create(names) {
    return names.map(name => new DemoClass(name));
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

| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`,
    )
    .join("")
}
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
::: demo Large Demo with Very Long Title That Might Need Trimming and Processing with Multiple Words and Spaces
# Large Document Demo
${Array(20)
  .fill(
    `
## Major Section

This is a large document for benchmarking the demo plugin with complex content and structure.

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

1. First ordered item with some longer text to make the content more realistic and ensure we have enough content for benchmarking
2. Second ordered item with some longer text to make the content more realistic and ensure we have enough content for benchmarking
   1. Nested ordered item 2.1
   2. Nested ordered item 2.2
      1. Deep nested ordered item 2.2.1
      2. Deep nested ordered item 2.2.2
   3. Nested ordered item 2.3
3. Third ordered item with some longer text to make the content more realistic and ensure we have enough content for benchmarking

- Unordered list item 1 with additional text for content
  - Nested item 1.1 with additional text for content
    - Deep nested item 1.1.1
    - Deep nested item 1.1.2
  - Nested item 1.2 with additional text for content
- Unordered list item 2 with additional text for content
  - Nested item 2.1 with additional text for content
  - Nested item 2.2 with additional text for content
    - Deep nested item 2.2.1
    - Deep nested item 2.2.2
      - Even deeper nested item
      - Even deeper nested item

| Complex Header 1 | Complex Header 2 | Complex Header 3 | Complex Header 4 |
| --------------- | --------------- | --------------- | --------------- |
| Row 1 Cell 1    | Row 1 Cell 2    | Row 1 Cell 3    | Row 1 Cell 4    |
| Row 2 Cell 1    | Row 2 Cell 2    | Row 2 Cell 3    | Row 2 Cell 4    |
| Row 3 Cell 1    | Row 3 Cell 2    | Row 3 Cell 3    | Row 3 Cell 4    |
| Row 4 Cell 1    | Row 4 Cell 2    | Row 4 Cell 3    | Row 4 Cell 4    |

### Subsection 2

More text and content to increase document size and complexity...
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

  // 真实世界文档测试用例
  describe("Real-world Document", () => {
    const realWorldContent = `
::: demo Vue Demo
# Vue Component Demo

\`\`\`vue
<template>
  <div class="demo-component">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <ul>
      <li v-for="(item, index) in items" :key="index">
        {{ item.name }}: {{ item.value }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'DemoComponent',
  props: {
    title: {
      type: String,
      default: 'Demo Title'
    }
  },
  data() {
    return {
      count: 0,
      items: [
        { name: 'Item 1', value: 100 },
        { name: 'Item 2', value: 200 },
        { name: 'Item 3', value: 300 }
      ]
    }
  },
  methods: {
    increment() {
      this.count += 1
    }
  }
}
</script>

<style>
.demo-component {
  padding: 20px;
  border: 2px solid #42b983;
  border-radius: 4px;
}
.demo-component h2 {
  color: #42b983;
}
button {
  background: #42b983;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
\`\`\`

## API Documentation

\`\`\`ts
interface DemoOptions {
  /**
   * Title of the demo
   */
  title: string;
  
  /**
   * Whether to show code first
   */
  showCodeFirst?: boolean;
  
  /**
   * Custom render function for opening tag
   */
  openRender?: RenderRule;
  
  /**
   * Custom render function for closing tag
   */
  closeRender?: RenderRule;
  
  /**
   * Custom render function for opening content tag
   */
  contentOpenRender?: RenderRule;
  
  /**
   * Custom render function for closing content tag
   */
  contentCloseRender?: RenderRule;
}
\`\`\`

## Complex Nesting

> This blockquote contains a list
> 
> - Item 1
> - Item 2
>   - Nested Item 
> - Item 3
>
> And some code too:
> \`\`\`js
> console.log("Inside blockquote!");
> \`\`\`

### Final Section

This is the final section of our demo with some **bold text** and *italic text* and \`inline code\` and [links](https://example.com).

1. Ordered list
2. With multiple items
3. For testing purposes
:::
`;

    bench("Old Implementation", () => {
      mdOld.render(realWorldContent);
    });

    bench("New Implementation", () => {
      mdNew.render(realWorldContent);
    });
  });

  // 测试嵌套的 Demo 容器场景
  describe("Multiple Demo Containers", () => {
    const multipleContent = `
::: demo First Demo
# First Demo Content
Some content in the first demo.

\`\`\`js
console.log("First demo");
\`\`\`
:::

Some text between demos.

::: demo Second Demo
# Second Demo Content
Some content in the second demo.

\`\`\`js
console.log("Second demo");
\`\`\`
:::

More text between demos.

::: demo Third Demo
# Third Demo Content
Some content in the third demo.

\`\`\`js
console.log("Third demo");
\`\`\`
:::
`;

    bench("Old Implementation", () => {
      mdOld.render(multipleContent);
    });

    bench("New Implementation", () => {
      mdNew.render(multipleContent);
    });
  });

  // 测试自定义配置
  describe("Custom Configuration", () => {
    const customContent = `
::: preview Custom Demo Title
# Custom Demo Content
This content is using a custom container name.

\`\`\`js
console.log("Custom demo");
\`\`\`
:::
`;

    bench("Old Implementation", () => {
      const md = new MarkdownIt().use(demoOld, {
        name: "preview",
        showCodeFirst: true,
        openRender: () => `<section class="custom-demo"><div class="title">`,
        closeRender: () => `</div></section>\n`,
      });

      md.render(customContent);
    });

    bench("New Implementation", () => {
      const md = new MarkdownIt().use(demoNew, {
        name: "preview",
        showCodeFirst: true,
        openRender: () => `<section class="custom-demo"><div class="title">`,
        closeRender: () => `</div></section>\n`,
      });

      md.render(customContent);
    });
  });
});
