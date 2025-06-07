---
title: "@mdit/plugin-embed"
icon: code
---

在 Markdown 中嵌入外部内容的插件。

<!-- more -->

## 安装

::: code-tabs#shell

@tab pnpm

```bash
pnpm add @mdit/plugin-embed
```

@tab yarn

```bash
yarn add @mdit/plugin-embed
```

@tab npm

```bash
npm i @mdit/plugin-embed
```

:::

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { embed } from "@mdit/plugin-embed";

const md = MarkdownIt().use(embed, {
  config: [
    {
      name: "youtube",
      setup: (id: string) =>
        `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`,
    },
    {
      name: "twitter", 
      setup: (url: string) =>
        `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`,
    },
    {
      name: "icon",
      allowInline: true,
      setup: (name: string) =>
        `<i class="icon icon-${name}"></i>`,
    },
  ],
});
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { embed } = require("@mdit/plugin-embed");

const md = MarkdownIt().use(embed, {
  config: [
    {
      name: "youtube",
      setup: (id) =>
        `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`,
    },
    {
      name: "twitter", 
      setup: (url) =>
        `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`,
    },
    {
      name: "icon",
      allowInline: true,
      setup: (name) =>
        `<i class="icon icon-${name}"></i>`,
    },
  ],
});
```

:::

## 语法

插件解析以下格式的嵌入语法：

```markdown
{% name params %}
```

其中：
- `name` 是嵌入类型标识符
- `params` 是传递给设置函数的参数

## 示例

### YouTube 视频

**输入：**

```markdown
{% youtube dQw4w9WgXcQ %}
```

**输出：**

<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>

### Twitter 嵌入

**输入：**

```markdown
{% twitter https://twitter.com/user/status/12345 %}
```

**输出：**

<blockquote class="twitter-tweet"><a href="https://twitter.com/user/status/12345"></a></blockquote>

### 行内图标嵌入

**设置：**

```ts
const md = MarkdownIt().use(embed, {
  config: [
    {
      name: "icon",
      allowInline: true,
      setup: (name: string) =>
        `<i class="icon icon-${name}"></i>`,
    },
  ],
});
```

**输入：**

```markdown
点击 {% icon home %} 按钮回到首页。
```

**输出：**

点击 <i class="icon icon-home"></i> 按钮回到首页。

### CodePen 嵌入

**设置：**

```ts
const md = MarkdownIt().use(embed, {
  config: [
    {
      name: "codepen",
      setup: (params: string) => {
        const [user, slug] = params.split("/");
        return `<iframe src="https://codepen.io/${user}/embed/${slug}" frameborder="0"></iframe>`;
      },
    },
  ],
});
```

**输入：**

```markdown
{% codepen username/pen-slug %}
```

**输出：**

<iframe src="https://codepen.io/username/embed/pen-slug" frameborder="0"></iframe>

### GitHub 仓库链接

**设置：**

```ts
const md = MarkdownIt().use(embed, {
  config: [
    {
      name: "github",
      setup: (repo: string) =>
        `<div class="github-embed"><a href="https://github.com/${repo}">github.com/${repo}</a></div>`,
    },
  ],
});
```

**输入：**

```markdown
{% github octocat/Hello-World %}
```

**输出：**

<div class="github-embed"><a href="https://github.com/octocat/Hello-World">github.com/octocat/Hello-World</a></div>

## 配置选项

### config

- 类型: `EmbedConfig[]`
- 默认值: `[]`

嵌入配置数组。

```ts
interface EmbedConfig {
  /**
   * 嵌入令牌名称
   */
  name: string;

  /**
   * 生成嵌入 HTML 的设置函数
   */
  setup: (params: string) => string;

  /**
   * 是否允许在行内使用
   * @default false
   */
  allowInline?: boolean;
}
```

每个配置必须包含：

- `name`: 在嵌入语法中使用的令牌名称
- `setup`: 接受参数并返回要嵌入的 HTML 字符串的函数
- `allowInline`: 可选，是否允许在行内使用（默认为 `false`，仅在块级使用）

当 `allowInline` 设置为 `true` 时，嵌入既可以在块级使用（单独一行），也可以在行内使用（段落中）。

## 高级用法

### 复杂参数处理

你可以在 `setup` 函数中处理复杂的参数：

```ts
const md = MarkdownIt().use(embed, {
  config: [
    {
      name: "video",
      setup: (params: string) => {
        // 解析参数：src width height
        const [src, width = "560", height = "315"] = params.split(" ");
        return `<video width="${width}" height="${height}" controls>
          <source src="${src}" type="video/mp4">
          您的浏览器不支持视频播放。
        </video>`;
      },
    },
  ],
});
```

**输入：**

```markdown
{% video https://example.com/video.mp4 800 600 %}
```

### 多个嵌入类型

你可以配置多种不同的嵌入类型：

```ts
const md = MarkdownIt().use(embed, {
  config: [
    // YouTube
    {
      name: "youtube",
      setup: (id) => `<iframe src="https://www.youtube.com/embed/${id}"></iframe>`,
    },
    // Bilibili
    {
      name: "bilibili",
      setup: (bvid) => `<iframe src="https://player.bilibili.com/player.html?bvid=${bvid}"></iframe>`,
    },
    // 自定义 HTML
    {
      name: "alert",
      setup: (message) => `<div class="alert alert-warning">${message}</div>`,
    },
  ],
});
```

**使用：**

```markdown
{% youtube dQw4w9WgXcQ %}

{% bilibili BV1xx411c7mu %}

{% alert 这是一个重要提示！ %}
```

## 注意事项

1. **安全性**: 请确保在 `setup` 函数中正确处理用户输入，避免 XSS 攻击
2. **性能**: 对于大量嵌入内容，考虑使用懒加载
3. **兼容性**: 确保生成的 HTML 与你的目标环境兼容

## 迁移指南

如果你正在从其他嵌入插件迁移，这里是一些常见的迁移示例：

### 从 markdown-it-video 迁移

```ts
// 之前
md.use(video);

// 现在
md.use(embed, {
  config: [
    {
      name: "video",
      setup: (src) => `<video controls><source src="${src}"></video>`,
    },
  ],
});
```

### 从 markdown-it-youtube 迁移

```ts
// 之前
md.use(youtube);

// 现在  
md.use(embed, {
  config: [
    {
      name: "youtube",
      setup: (id) => `<iframe src="https://www.youtube.com/embed/${id}"></iframe>`,
    },
  ],
});
```
