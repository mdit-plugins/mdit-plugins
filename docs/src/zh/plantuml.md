---
title: "@mdit/plugin-plantuml"
shortTitle: "plugin-plantuml"
icon: diagram-project
---

支持 plant uml 的插件，基于 [@mdit/plugin-uml](uml.md)。

<!-- more -->

## 使用

```ts
import MarkdownIt from "markdown-it";
import { plantuml } from "@mdit/plugin-plantuml";

const mdIt = new MarkdownIt().use(plantuml);

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

::: preview 非 ASCII 示例

@startuml
Bob -> Alice : 你好
@enduml

:::

## 选项

::: fields
@`type` type=`"uml" | "fence"` default=`"uml"`

Plantuml 解析类型。

@`name` type=string default=`"uml"`

图表类型。仅在使用默认地址获取器时可用。

@`fence` type=string

代码块名称。默认为 `name` 的值。

@`open` type=string

开始标记。仅当类型为 "uml" 时可用。默认为 `"start" + name`。

@`close` type=string

结束标记。仅当类型为 "uml" 时可用。默认为 `"end" + name`。

@`server` type=string default=`"https://www.plantuml.com/plantuml"`

Plantuml 服务器。仅在使用默认地址获取器时可用。

@`format` type=string default=`"svg"`

图片格式。仅在使用默认地址获取器时可用。

@`srcGetter` type=`(content: string) => string`

图片地址获取器。接收图表内容并返回图片链接。

@`renderer` type=RendererRule

<!-- @include: ../render-rule.snippet.md -->

图表渲染器。

:::
