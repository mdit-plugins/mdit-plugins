---
title: "@mdit/plugin-plantuml"
icon: diagram-project
---

支持 plant uml 的插件，基于 [@mdit/plugin-uml](uml.md)。

<!-- more -->

## 使用

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

## 示例

::: preview 示例

@startuml
Bob -> Alice : hello
@enduml

:::

## 选项

### type

- 类型：`"uml" | "fence"`
- 默认值：`"uml"`
- 详情：Plantuml 解析类型。

### name

- 类型：`string`
- 默认值：`"uml"`
- 详情：图表类型。仅在使用默认地址获取器时可用。

### fence

- 类型：`string`
- 详情：代码块名称。默认为 `name` 的值。

### open

- 类型：`string`
- 详情：开始标记。仅当类型为 "uml" 时可用。默认为 `"start" + name`。

### close

- 类型：`string`
- 详情：结束标记。仅当类型为 "uml" 时可用。默认为 `"end" + name`。

### server

- 类型：`string`
- 默认值：`"https://www.plantuml.com/plantuml"`
- 详情：Plantuml 服务器。仅在使用默认地址获取器时可用。

### format

- 类型：`string`
- 默认值：`"svg"`
- 详情：图片格式。仅在使用默认地址获取器时可用。

### srcGetter

- 类型：`(content: string) => string`
- 详情：图片地址获取器。接收图表内容并返回图片链接。

### render

- 类型：`RenderRule`

<!-- @include: ../render-rule.snippet.md -->

- 详情：图表渲染器。
