---
title: "@mdit/plugin-plantuml"
shortTitle: "plugin-plantuml"
icon: diagram-project
---

Plugin to support plant uml base on [@mdit/plugin-uml](uml.md).

<!-- more -->

## Usage

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

## Demo

::: preview demo

@startuml
Bob -> Alice : hello
@enduml

:::

::: preview Non-ascii demo

@startuml
Bob -> Alice : 你好
@enduml

:::

## Options

::: fields
@`type` type=`"uml" | "fence"` default=`"uml"`

Plantuml parse type.

@`name` type=string default=`"uml"`

Diagram type. Only available when using default srcGetter.

@`fence` type=string

Fence info. Defaults to the value of `name`.

@`open` type=string

Opening marker. Only available with type "uml". Defaults to `"start" + name`.

@`close` type=string

Closing marker. Only available with type "uml". Defaults to `"end" + name`.

@`server` type=string default=`"https://www.plantuml.com/plantuml"`

Plantuml server. Only available when using default srcGetter.

@`format` type=string default=`"svg"`

Image format. Only available when using default srcGetter.

@`srcGetter` type=`(content: string) => string`

Image src getter. Takes diagram content and returns image link.

@`renderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Diagram renderer.

:::
