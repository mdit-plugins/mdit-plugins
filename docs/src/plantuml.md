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

::: warning Long diagrams and the URL length limit

The default `srcGetter` deflates the diagram source and puts it into the image URL. Very large diagrams can exceed the URL length limit of the PlantUML server or the browser, and the image then fails to load. For large diagrams, self-host the server to raise the server-side limit (the browser limit still applies), or provide a custom `srcGetter` that returns a shorter URL, for example one that is created during the build. Keep in mind that `srcGetter` must return the URL synchronously, so uploading the source with a POST request has to happen outside rendering.

:::

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

<!-- comparison:start -->

---

> See the [comparison report](compare.md) for the full upstream comparison.

<!-- comparison:end -->
