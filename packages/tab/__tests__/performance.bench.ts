// oxlint-disable typescript/no-unsafe-argument, unicorn/new-for-builtins
import { describe, bench } from "vitest";
import MarkdownIt from "markdown-it";
import type { MarkdownItTabData } from "../src/index.js";
import { tab as tabNew } from "../src/index.js";
// @ts-ignore
import { tab as tabOld } from "../src-old/index.js";

describe("Tab Plugin Benchmark", () => {
  const mdOld = new MarkdownIt().use(tabOld);
  const mdNew = new MarkdownIt().use(tabNew);

  // 简单标签测试
  describe("Simple Tabs (Small Content)", () => {
    const simpleTabsContent = `
::: tabs
@tab tab 1
Content of tab 1

- Item 1
- Item 2
- Item 3

@tab tab 2
Content of tab 2

\`\`\`js
const message = "Hello from tab 2";
console.log(message);
\`\`\`

@tab:active tab 3
Content of tab 3

> This is a quote in tab 3
> Second line of the quote

:::
`;

    bench("Old Implementation", () => {
      mdOld.render(simpleTabsContent);
    });

    bench("New Implementation", () => {
      mdNew.render(simpleTabsContent);
    });
  });

  // 中等复杂度标签测试
  describe("Medium Complexity Tabs", () => {
    const mediumTabsContent = `
::: tabs
@tab JavaScript
\`\`\`js
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log(fibonacci(10)); // 55
\`\`\`

@tab Python
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))  # 55
\`\`\`

@tab:active Java
\`\`\`java
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        System.out.println(fibonacci(10));  // 55
    }
}
\`\`\`

@tab C++
\`\`\`cpp
#include <iostream>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    std::cout << fibonacci(10) << std::endl;  // 55
    return 0;
}
\`\`\`
:::
`;

    bench("Old Implementation", () => {
      mdOld.render(mediumTabsContent);
    });

    bench("New Implementation", () => {
      mdNew.render(mediumTabsContent);
    });
  });

  // 复杂标签测试（多个标签组、嵌套内容）
  describe("Complex Tabs (Multiple Tab Groups)", () => {
    const complexTabsContent = `
::: tabs
@tab Introduction
# Introduction

This is an introduction to our complex tabs example.

- Point 1
- Point 2
- Point 3

::: tabs
@tab Nested Tab 1
Nested content in tab 1

\`\`\`js
console.log("Nested tab 1");
\`\`\`

@tab Nested Tab 2
Nested content in tab 2

\`\`\`js
console.log("Nested tab 2");
\`\`\`
:::

@tab Installation
# Installation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 12.0 or higher
- npm or yarn

## Step 1

\`\`\`bash
npm install my-package
\`\`\`

## Step 2

\`\`\`js
import { myFunction } from 'my-package';

myFunction();
\`\`\`

@tab Configuration
# Configuration

You can configure the package using the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| option1 | String | 'default' | Description of option1 |
| option2 | Number | 42 | Description of option2 |
| option3 | Boolean | true | Description of option3 |

\`\`\`js
// Configuration example
const config = {
  option1: 'custom',
  option2: 100,
  option3: false
};

init(config);
\`\`\`

@tab:active Examples
# Examples

Here are some examples of how to use the package:

## Basic Example

\`\`\`js
import { basic } from 'my-package';

basic();
\`\`\`

## Advanced Example

\`\`\`js
import { advanced } from 'my-package';

advanced({
  feature1: true,
  feature2: 'enabled',
  callbacks: {
    onSuccess: () => console.log('Success!'),
    onError: (err) => console.error('Error:', err)
  }
});
\`\`\`
:::

Here's some content between tab groups.

::: tabs#second-group
@tab First Tab
Content of the first tab in the second group.

@tab:active Second Tab
Content of the second tab in the second group.

@tab Third Tab
Content of the third tab in the second group.
:::
`;

    bench("Old Implementation", () => {
      mdOld.render(complexTabsContent);
    });

    bench("New Implementation", () => {
      mdNew.render(complexTabsContent);
    });
  });

  // 大型文档测试（多个标签组、大量内容）
  describe("Large Document with Many Tabs", () => {
    const largeTabsContent = `
${Array(5)
  .fill(0)
  .map(
    (_, groupIndex) => `
::: tabs#group-${groupIndex}
${Array(4)
  .fill(0)
  .map(
    (_, tabIndex) => `
@tab${tabIndex === 0 ? ":active" : ""} Tab ${tabIndex + 1}
# Heading for Tab ${tabIndex + 1} in Group ${groupIndex + 1}

This is the content for tab ${tabIndex + 1} in group ${groupIndex + 1}.

## Subheading 1

- List item 1
- List item 2
- List item 3

## Subheading 2

\`\`\`js
// Code example for Tab ${tabIndex + 1}, Group ${groupIndex + 1}
function example${groupIndex + 1}_${tabIndex + 1}() {
  console.log("This is an example function");
  
  // Some complex code
  const items = Array(10).fill(0).map((_, i) => ({
    id: i,
    value: Math.random() * 100,
    processed: i % 2 === 0
  }));
  
  return items
    .filter(item => item.processed)
    .map(item => item.value)
    .reduce((sum, value) => sum + value, 0);
}

console.log(example${groupIndex + 1}_${tabIndex + 1}());
\`\`\`

> This is a blockquote for Tab ${tabIndex + 1} in Group ${groupIndex + 1}
> It contains some additional information.

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
| Data 7   | Data 8   | Data 9   |
`,
  )
  .join("")}
:::
`,
  )
  .join("\n\n")}
`;

    bench("Old Implementation", () => {
      mdOld.render(largeTabsContent);
    });

    bench("New Implementation", () => {
      mdNew.render(largeTabsContent);
    });
  });

  // 自定义名称测试
  describe("Custom Tab Name", () => {
    const customTabContent = `
::: code-group
@tab JavaScript
\`\`\`js
console.log("Hello from JavaScript");
\`\`\`

@tab TypeScript
\`\`\`ts
console.log("Hello from TypeScript");
\`\`\`

@tab Python
\`\`\`python
print("Hello from Python")
\`\`\`
:::
`;

    mdOld.use(tabOld, { name: "code-group" });
    mdNew.use(tabNew, { name: "code-group" });

    bench("Old Implementation", () => {
      mdOld.render(customTabContent);
    });

    bench("New Implementation", () => {
      mdNew.render(customTabContent);
    });
  });

  // 自定义渲染测试
  describe("Custom Renderers", () => {
    const customRenderContent = `
::: tabs
@tab Tab 1
Content of tab 1

@tab Tab 2
Content of tab 2

@tab:active Tab 3
Content of tab 3
:::
`;

    const customOpenRender = (info: MarkdownItTabData[]): string => {
      const tabs = info.map(
        ({ title, isActive }, index) =>
          `<div class="custom-tab${
            isActive ? " custom-active" : ""
          }" data-index="${index}">${title}</div>`,
      );

      return `<div class="custom-tabs-wrapper">\n<div class="custom-tabs-header">\n${tabs.join(
        "\n",
      )}\n</div>\n<div class="custom-tabs-content">`;
    };

    const customCloseRender = (): string => `</div>\n</div>\n`;

    mdOld.use(tabOld, {
      openRender: customOpenRender,
      closeRender: customCloseRender,
    });
    mdNew.use(tabNew, {
      openRender: customOpenRender,
      closeRender: customCloseRender,
    });

    bench("Old Implementation", () => {
      mdOld.render(customRenderContent);
    });

    bench("New Implementation", () => {
      mdNew.render(customRenderContent);
    });
  });
});
