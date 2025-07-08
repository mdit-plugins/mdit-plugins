---
title: "@mdit/plugin-plantuml"
icon: diagram-project
---

Plugin to support plant uml base on [@mdit/plugin-uml](uml.md).

<!-- more -->

## Usage

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

```ts
interface MarkdownItPlantumlOptions {
  /**
   * Plantuml parse type
   *
   * @default "uml"
   */
  type?: "uml" | "fence";

  /**
   * diagram type
   *
   * @description Only available when using default srcGetter
   *
   * @default "uml"
   */
  name?: string;

  /**
   * Fence info
   *
   * @default name
   */
  fence?: string;

  /**
   * Opening marker
   *
   * @description only available with type "uml"
   *
   * @default "start" + name
   */
  open?: string;

  /**
   * Closing marker
   *
   * @description only available with type "uml"
   */
  close?: string;

  /**
   * Plantuml server
   *
   * @description Only available when using default srcGetter
   *
   * @default "https://www.plantuml.com/plantuml"
   */
  server?: string;

  /**
   * Image format
   *
   * @description Only available when using default srcGetter
   *
   * @default "svg"
   */
  format?: string;

  /**
   * Image src getter
   *
   * @param content diagram content
   * @returns image link
   */
  srcGetter?: (content: string) => string;

  /**
   * Diagram renderer
   */
  render?: RenderRule;
}
```
