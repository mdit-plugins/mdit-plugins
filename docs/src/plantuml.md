---
title: "@mdit/plugin-plantuml"
icon: diagram-project
---

Plugin to support plant uml base on [@mdit/plugin-uml](uml.md).

<!-- more -->

## Usage

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

### type

- Type: `"uml" | "fence"`
- Default: `"uml"`
- Details: Plantuml parse type.

### name

- Type: `string`
- Default: `"uml"`
- Details: Diagram type. Only available when using default srcGetter.

### fence

- Type: `string`
- Details: Fence info. Defaults to the value of `name`.

### open

- Type: `string`
- Details: Opening marker. Only available with type "uml". Defaults to `"start" + name`.

### close

- Type: `string`
- Details: Closing marker. Only available with type "uml". Defaults to `"end" + name`.

### server

- Type: `string`
- Default: `"https://www.plantuml.com/plantuml"`
- Details: Plantuml server. Only available when using default srcGetter.

### format

- Type: `string`
- Default: `"svg"`
- Details: Image format. Only available when using default srcGetter.

### srcGetter

- Type: `(content: string) => string`
- Details: Image src getter. Takes diagram content and returns image link.

### render

- Type: `RenderRule`

<!-- @include: ./render-rule.snippet.md -->

- Details: Diagram renderer.
