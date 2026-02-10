---
title: "@mdit/plugin-emoji"
icon: face-smile
---

markdown-it 的表情插件。

<!-- more -->

## 安装

::: code-tabs#shell

@tab pnpm

```bash
pnpm add @mdit/plugin-emoji
```

@tab yarn

```bash
yarn add @mdit/plugin-emoji
```

@tab npm

```bash
npm i @mdit/plugin-emoji
```

:::

## 使用

```ts
import MarkdownIt from "markdown-it";
import { fullEmoji } from "@mdit/plugin-emoji";

const mdIt = MarkdownIt().use(fullEmoji);

mdIt.render("来自火星的问候 :satellite:");
```

提供了几种不同的预设：

- `fullEmoji`: 包含所有可用的表情支持
- `lightEmoji`: 包含常用表情的一个子集
- `bareEmoji`: 不包含任何默认定义，仅包含你在选项中定义的内容

## 格式

- `:表情名称:`
- 捷键短语，如 `:)`, `:D` 等 (如果启用)

## 示例

::: preview 示例

来自火星的问候 :satellite:

经典快捷键: :-) :-(

:::

## 选项

### definitions

- 类型: `Record<string, string>`
- 默认值: `{}` (取决于预设)

重写可用的表情定义。键是表情名称，值是表情字符。

示例: `{ name1: 'char1', name2: 'char2', ... }`

### enabled

- 类型: `string[]`
- 默认值: `[]`

如果指定，则仅渲染此列表中的表情。否则，将渲染定义中的所有表情。

### shortcuts

- 类型: `Record<string, string | string[]>`
- 默认值: `{}` (取决于预设)

重写默认快捷键。键是表情名称，值是表情的快捷键短语。

示例: `{ "smile": [ ":)", ":-)" ], "laughing": ":D" }`

## 自定义渲染器

默认情况下，表情被渲染为相应的 Unicode 字符。但你可以根据需要更改渲染器函数。

例如，使用 [twemoji](https://github.com/twitter/twemoji)：

```ts
import MarkdownIt from "markdown-it";
import { fullEmoji } from "@mdit/plugin-emoji";
import twemoji from "twemoji";

const mdIt = MarkdownIt().use(fullEmoji);

mdIt.renderer.rules.emoji = (tokens, idx) => {
  return twemoji.parse(tokens[idx].content);
};
```

你可以使用以下样式使图片高度与行高匹配：

```css
.emoji {
  height: 1.2em;
}
```
