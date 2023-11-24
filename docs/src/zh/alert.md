---
title: "@mdit/plugin-alert"
icon: bell
---

支持 GFM 风格的警告语法。([参考](https://github.com/orgs/community/discussions/16925))

<!-- more -->

## 使用

:::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { alert } from "@mdit/plugin-alert";

const mdIt = MarkdownIt().use(alert);

mdIt.render(`
> [!warning]
> 警告文字
`);
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { alert } = require("@mdit/plugin-alert");

const mdIt = MarkdownIt().use(alert);

mdIt.render(`
> [!warning]
> 警告文字
:::
`);
```

::::

<!-- markdownlint-disable MD028 -->

## 语法

通过此插件，您可以创建以 `[!警告名称]` 开头的块级警告，如：

```md
> [!warning]
> 警告文字
```

`警告名称` 不区分大小写，可以是以下字符串：

- `note`
- `tip`
- `important`
- `caution`
- `warning`

::: tip 嵌套和转义

- 默认情况下，GFM 风格的警告只能放置在根级，但是您可以使用 `deep: true` 来启用深层和嵌套支持：

  ```js
  md.use(alert, {
    name: "warning",
    deep: true,
  });
  ```

  ```md
  > [!warning]
  > 警告文字
  >
  > > [!warning]
  > > 嵌套警告文字

  - > [!warning]
    > 警告文字
  ```

  会被渲染为

  > [!warning]
  > 警告文字
  >
  > > [!warning]
  > > 嵌套警告文字

  - > [!warning]
    > 警告文字

- Escaping can be done by adding `\` to escape the `!` `[` or `]` marker:

  ```md
  > [\!warning]
  > 警告文字

  > \[!warning]
  > 警告文字
  ```

  会被渲染为

  > [\!warning]
  > 警告文字

  > \[!warning]
  > 警告文字

:::

## 选项

```ts
interface MarkdownItAlertOptions {
  /**
   * 允许的警告名称
   *
   * @default ['important', 'note', 'tip', 'warning', 'caution']
   */
  alertNames?: string[];

  /**
   * 是否允许深层的警告语法
   *
   * @default false
   */
  deep?: boolean;

  /**
   * 提示开始标签渲染函数
   */
  openRender?: RenderRule;

  /**
   * 提示结束标签渲染函数
   */
  closeRender?: RenderRule;

  /**
   * 提示标题渲染函数
   */
  titleRender?: RenderRule;
}
```

## 案例

> [!note]
> 注释文字

> [!important]
> 重要文字

> [!tip]
> 提示文字

> [!warning]
> 注意文字

> [!caution]
> 警告文字

<!-- markdownlint-enable MD028 -->
