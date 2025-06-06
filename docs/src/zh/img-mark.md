---
title: "@mdit/plugin-img-mark"
icon: circle-half-stroke
---

为主题模式通过 ID 后缀标记图像的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { imgMark } from "@mdit/plugin-img-mark";

const mdIt = MarkdownIt().use(imgMark, {
  // 你的选项，可选的
});

mdIt.render("![image](https://example.com/image.png#light)");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { imgMark } = require("@mdit/plugin-img-mark");

const mdIt = MarkdownIt().use(imgMark, {
  // 你的选项，可选的
});

mdIt.render("![image](https://example.com/image.png#light)");
```

:::

## 格式

GFM 支持通过 ID 后缀标记图片，使图片仅在特定模式下显示。

此插件允许你为图像链接添加 ID 后缀，并根据你的设置自动将 `data-mode="lightmode-only|darkmode-only"` 添加到 `<img>` 标签。

::: tip 相关样式

插件不会生成样式，因为它不知道样式应该是什么，所以你需要自己添加相关样式。

如果你正在生成页面并通过 DOM 控制暗黑模式，你应该使用:

```css
lightmode-selector {
  img[data-mode="darkmode-only"] {
    display: none !important;
  }
}

darkmode-selector {
  img[data-mode="lightmode-only"] {
    display: none !important;
  }
}
```

如果页面主题模式是基于用户偏好的，你应该使用:

```css
@media (prefers-color-scheme: light) {
  img[data-mode="darkmode-only"] {
    display: none !important;
  }
}

@media (prefers-color-scheme: dark) {
  img[data-mode="lightmode-only"] {
    display: none !important;
  }
}
```

::::

## 选项

```ts
interface MarkdownItImgMarkOptions {
  /**
   * 日间模式 ID
   *
   * @default ["light"]
   */
  light?: string[];

  /**
   * 夜间模式 ID
   *
   * @default ["dark"]
   */
  dark?: string[];
}
```

## 示例

::: preview 示例

![GitHub Light](/github-light.png#dark)
![GitHub Dark](/github-dark.png#light)

:::

<script setup lang="ts">
import { ColorModeSwitch } from "vuepress-theme-hope/client"
</script>
