---
title: "@mdit/plugin-align"
icon: align
---

用于控制内容对齐方式的插件。

::: note

此插件基于 [@mdit/plugin-container](container.md).

:::

<!-- more -->

## 使用

:::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { align } from "@mdit/plugin-align";

const mdIt = MarkdownIt().use(align);

mdIt.render(`\
::: center
居中的内容
:::
`);
```

@tab JS

```ts
const MarkdownIt = require("markdown-it");
const { align } = require("@mdit/plugin-align");

const mdIt = MarkdownIt().use(align);

mdIt.render(`\
::: center
居中的内容
:::
`);
```

::::

## 格式

```md
::: left
左对齐的内容
:::

::: center
居中的内容
:::

::: right
右对齐的内容
:::

::: justify
两端对齐的内容
:::
```

::::: tip 嵌套和转义

- 嵌套可以通过增加外层容器的 marker 数量完成:

  ```md
  :::: center
  居中的内容...
  ::: left
  左对齐的内容...
  :::
  居中的内容...
  ::::
  ```

  会被渲染为

  :::: center
  居中的内容...
  ::: left
  左对齐的内容...
  :::
  居中的内容...
  ::::

- 转义可以通过在 marker 前添加 `\` 转义来完成:

  ```md
  \::: left

  :::
  ```

  会被渲染为

  \::: left

  :::

:::::

## 示例

:::: center

### Twinkle, Twinkle, Little Star

::: right

——Jane Taylor

:::

Twinkle, twinkle, little star,

How I wonder what you are!

Up above the world so high,

Like a diamond in the sky.

When the blazing sun is gone,

When he nothing shines upon,

Then you show your little light,

Twinkle, twinkle, all the night.

Then the traveller in the dark,

Thanks you for your tiny spark,

He could not see which way to go,

If you did not twinkle so.

In the dark blue sky you keep,

And often thro' my curtains peep,

For you never shut your eye,

Till the sun is in the sky.

'Tis your bright and tiny spark,

Lights the trav’ller in the dark,

Tho' I know not what you are,

Twinkle, twinkle, little star.

::::

::::: details Code

```md
:::: center

### Twinkle, Twinkle, Little Star

::: right

——Jane Taylor

:::

Twinkle, twinkle, little star,

How I wonder what you are!

Up above the world so high,

Like a diamond in the sky.

When the blazing sun is gone,

When he nothing shines upon,

Then you show your little light,

Twinkle, twinkle, all the night.

Then the traveller in the dark,

Thanks you for your tiny spark,

He could not see which way to go,

If you did not twinkle so.

In the dark blue sky you keep,

And often thro' my curtains peep,

For you never shut your eye,

Till the sun is in the sky.

'Tis your bright and tiny spark,

Lights the trav’ller in the dark,

Tho' I know not what you are,

Twinkle, twinkle, little star.

::::
```

:::::
