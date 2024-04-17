---
title: "@mdit/plugin-plantuml"
icon: context
---

支持 plant uml 的插件，基于 [@mdit/plugin-uml](uml.md)。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { plantuml } from "@mdit/plugin-plantuml";

const mdIt = MarkdownIt().use(plantuml);

mdIt.render(`\
@startuml
Bob -> Alice : hello
@enduml
`);
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { plantuml } = require("@mdit/plugin-plantuml");

const mdIt = MarkdownIt().use(plantuml);

mdIt.render(`\
@startuml
Bob -> Alice : hello
@enduml
`);
```

:::

## 示例

::: md-demo 示例

@startuml
Bob -> Alice : hello
@enduml

:::

## 选项

```ts
interface MarkdownItPlantumlOptions {
  /**
   * Plantuml 解析类型
   *
   * @default "uml"
   */
  type?: "uml" | "fence";

  /**
   * 图表类型
   *
   * @description 仅在使用默认地址获取器时可用
   *
   * @default "uml"
   */
  name?: string;

  /**
   * 代码块名称
   *
   * @default name
   */
  fence?: string;

  /**
   * 开始标记
   *
   * @description 仅当类型为 "uml" 时可用
   *
   * @default "start" + name
   */
  open?: string;

  /**
   * 结束标记
   *
   * @default  "end" + name
   */
  close?: string;

  /**
   * Plantuml 服务器
   *
   * @description 仅在使用默认地址获取器时可用
   *
   * @default "https://www.plantuml.com/plantuml"
   */
  server?: string;

  /**
   * 图片格式
   *
   * @description 仅在使用默认地址获取器时可用
   *
   * @default "svg"
   */
  format?: string;

  /**
   * 图片地址获取器
   *
   * @param content 图表内容
   * @returns 图片链接
   */
  srcGetter?: (content: string) => string;

  /**
   * 图表渲染器
   */
  render?: RenderRule;
}
```
