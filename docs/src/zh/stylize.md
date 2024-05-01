---
title: "@mdit/plugin-stylize"
icon: wand-magic-sparkles
---

样式化插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { stylize } from "@mdit/plugin-stylize";

const mdIt = MarkdownIt().use(stylize, {
  config: [
    // your options
  ],
});

mdIt.render("Check FAQ for more details._Recommended_");
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { stylize } = require("@mdit/plugin-stylize");

const mdIt = MarkdownIt().use(stylize, {
  config: [
    // your options
  ],
});

mdIt.render("Check FAQ for more details._Recommended_");
```

:::

`stylize` 接收一个数组，其中每个元素接受 2 个选项：

- `matcher`：应为 `string` 或 `RegExp`。

- `replacer`: 自定义匹配标记的函数

例如，你可以使用以下配置将 `*Recommended*` 转换为徽章 `<Badge type="tip">Recommended</Badge>`：

```ts {3-13}
mdIt.use(stylize, {
  config: [
    {
      matcher: "Recommended",
      replacer: ({ tag }) => {
        if (tag === "em")
          return {
            tag: "Badge",
            attrs: { type: "tip" },
            content: "Recommended",
          };
      },
    },
  ],
});
```

<!-- markdownlint-disable MD033 -->

另一个例子是你想要将所有的“不或者没”开头的强调词设置为红色，这样 `设置它*没有*任何效果，请*不要*这样使用。`变成：“设置它<span style="color:red">没有</span>任何效果，请<span style="color:red">不要</span>这样使用。"

<!-- markdownlint-enable MD033 -->

```ts {3-13}
mdIt.use(stylize, {
  config: [
    {
      matcher: /^不/,
      replacer: ({ tag, attrs, content }) => {
        if (tag === "em")
          return {
            tag: "span",
            attrs: { ...attrs, style: "color: red" },
            content,
          };
      },
    },
  ],
});
```

此外，我们提供了一个 `localConfigGetter` 来接收 env 对象，以防你想在某些情况下应用本地规则。

```ts {2,7-17}
mdIt.use(stylize, {
  localConfigGetter: (env) => env.stylize || [],
});

mdIt.render("Check FAQ for more details._Recommended_", {
  stylize: [
    {
      matcher: "Recommended",
      replacer: ({ tag }) => {
        if (tag === "em")
          return {
            tag: "Badge",
            attrs: { type: "tip" },
            content: "Recommended",
          };
      },
    },
  ],
});
```

::: info 性能

为避免性能影响，除非你需要，否则应尽量避免使用 RegExp 以获得更好的性能。

并且请尝试使用成本较低的 RegExp 创建片段，例如：以 `^` 开头或以 `$` 结尾 RegExp 。

例如，如果你只想匹配 "SHOULD"、"MUST" 和 "MAY"，你应该写 `/^(?:SHOULD|M(?:UST|AY))$/u` 而不是 `/SHOULD|MUST|MAY/u`。第一个将和 1000 个字符的“A loo...oong content”只匹配 2 次，但第二个 RegExp 会匹配近 3000 次。

:::

## 选项

```ts
interface MarkdownItStylizeResult {
  /**
   * 渲染的标签名称
   */
  tag: string;

  /**
   * 属性设置
   */
  attrs: Record<string, string>;

  /**
   * 标签内容
   */
  content: string;
}

interface MarkdownItStylizeConfig {
  /**
   * 字符匹配
   */
  matcher: string | RegExp;

  /**
   * 内容替换
   */
  replacer: (options: {
    tag: string;
    content: string;
    attrs: Record<string, string>;
    env?: any;
  }) => MarkdownItStylizeResult | void;
}

interface MarkdownItStylizeOptions {
  /**
   * 格式化配置
   */
  config?: MarkdownItStylizeConfig[];

  /**
   * 本地配置获取器
   *
   * @param env Markdown 环境对象
   * @returns 本地格式化配置
   */
  localConfigGetter?: (env?: any) => MarkdownItStylizeConfig[] | null;
}
```
