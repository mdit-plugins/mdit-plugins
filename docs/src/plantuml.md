---
title: "@mdit/plugin-plantuml"
shortTitle: "plugin-plantuml"
icon: diagram-project
---

Plugin to support plant uml base on [@mdit/plugin-uml](uml.md).

<!-- more -->

## Usage

```ts
import { plantuml } from "@mdit/plugin-plantuml";
import MarkdownIt from "markdown-it";

const mdIt = new MarkdownIt().use(plantuml);

mdIt.render(`\
@startuml
Bob -> Alice : hello
@enduml
`);
```

## Options

:::: fields
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

::: warning External requests

With the default `srcGetter`, the diagram source is sent to the configured PlantUML server (`https://www.plantuml.com/plantuml` by default), which is an external request that may leak diagram content. Self-host the server or provide a custom `renderer` when the diagram source is sensitive.

:::

@`format` type=string default=`"svg"`

Image format. Only available when using default srcGetter.

@`srcGetter` type=`(content: string) => string`

Image src getter. Takes diagram content and returns image link.

@`renderer` type=RendererRule

<!-- @include: ./render-rule.snippet.md -->

Diagram renderer.

::::

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
