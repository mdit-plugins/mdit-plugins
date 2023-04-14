---
title: "@mdit/plugin-include"
icon: at
---

在 Markdown 中包含其他文件的插件。

<!-- more -->

## 使用

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { include } from "@mdit/plugin-include";

const mdIt = MarkdownIt().use(include, {
  // 你的选项，currentPath 是必填的
  currentPath: (env) => env.filePath,
});

mdIt.render("<!-- @include: ./path/to/include/file.md -->", {
  filePath: "path/to/current/file.md",
});
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { include } = require("@mdit/plugin-include");

const mdIt = MarkdownIt().use(include, {
  // 你的选项，currentPath 是必填的
  currentPath: (env) => env.filePath,
});

mdIt.render("<!-- @include: ./path/to/include/file.md -->", {
  filePath: "path/to/current/file.md",
});
```

:::

由于 markdown-it 仅在 `render()` api 中接收 markdown 内容，因此插件不知道当前内容的文件路径，因此不知道在哪里可以找到包含文件。

要解决这个问题，你应该通过 env 对象传递信息，并在插件选项中设置 `currentPath`。

`currentPath` 函数将接收 `env` 对象并返回当前文件的路径。

此外，要支持别名，你可以在插件选项中设置 `resolvePath`。

例如，以下代码添加了对 `@src` 别名的支持：

```ts
const MarkdownIt = require("markdown-it");
const { include } = require("@mdit/plugin-include");

const mdIt = MarkdownIt();

mdIt.use(include, {
  currentPath: (env) => env.filePath,
  resolvePath: (path, cwd) => {
    if (path.startsWith("@src")) {
      return path.replace("@src", "path/to/src/folder");
    }

    return path.join(cwd, path);
  },
});
```

此外，默认情况下，包含文件中的图像和链接将相对于导入的文件进行解析，但是你可以通过在插件选项中将 `resolveImagePath` 和 `resolveLinkPath` 设置为 `false` 来更改此行为。

此外，该插件支持 `deep` 功能，如果此选项设置为 `true`，它将处理包含文件中嵌套的 `@include`。

## 格式

使用 `<!-- @include: filename -->` 导入文件。

如果要部分导入文件，你可以指定导入的行数

- `<!-- @include: filename{start-end} -->`
- `<!-- @include: filename{start-} -->`
- `<!-- @include: filename{-end} -->`

同时你也可以导入文件区域:

- `<!-- @include: filename#region -->`

:::: info 文件区域

文件区域是 vscode 中的一个概念，区域内容被 `#region` 和 `#endregion` 注释包围。

这里有些例子：

::: code-tabs#language

@tab HTML

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <!-- region snippet -->
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi,
      repellendus. Voluptatibus alias cupiditate at, fuga tenetur error officiis
      provident quisquam autem, porro facere! Neque quibusdam animi quaerat
      eligendi recusandae eaque.
    </p>
    <!-- endregion snippet -->
    <p>
      Veniam harum illum natus omnis necessitatibus numquam architecto eum
      dignissimos, quos a adipisci et non quam maxime repellendus alias ipsum,
      vero praesentium laborum commodi perferendis velit repellat? Vero,
      cupiditate sequi.
    </p>
  </body>
</html>
```

@tab Markdown

```md
## Hello world

<!-- #region snippet -->

Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates
inventore iure quo aut doloremque, ipsum ab voluptatem ipsa, velit laborum
illo quae omnis reiciendis hic, ut dolorem non debitis in!

<!-- #endregion snippet -->

Veniam harum illum natus omnis necessitatibus numquam architecto eum
dignissimos, quos a adipisci et non quam maxime repellendus alias ipsum,
vero praesentium laborum commodi perferendis velit repellat? Vero,
cupiditate sequi.
```

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { include } from "@mdit/plugin-include";

// #region snippet
const mdIt = MarkdownIt().use(include, {
  // your options, currentPath is required
  currentPath: (env) => env.filePath,
});
// #endregion snippet

mdIt.render("<!-- @include: ./path/to/include/file.md)", {
  filePath: "path/to/current/file.md",
});
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { include } = require("@mdit/plugin-include");

// #region snippet
const mdIt = MarkdownIt().use(include, {
  // your options, currentPath is required
  currentPath: (env) => env.filePath,
});
// #endregion snippet

mdIt.render("<!-- @include: ./path/to/include/file.md)", {
  filePath: "path/to/current/file.md",
});
```

@tab css

```css
html,
body {
  margin: 0;
  padding: 0;
}

/* #region snippet */
h1 {
  font-size: 1.5rem;
}
/* #endregion snippet */

h2 {
  font-size: 1.2rem;
}
```

@tab Less

```less
html,
body {
  margin: 0;
  padding: 0;
}

/* #region snippet */
h1 {
  font-size: 1.5rem;
}
/* #endregion snippet */

h2 {
  font-size: 1.2rem;
}
```

@tab Sass

```scss
html,
body {
  margin: 0;
  padding: 0;
}

/* #region snippet */
h1 {
  font-size: 1.5rem;
}
/* #endregion snippet */

h2 {
  font-size: 1.2rem;
}
```

@tab Java

```java
public class HelloWorld {
  // #region snippet
  public static void main(String args[]){
    System.out.println("Hello World");
  }
  // #endregion snippet
}
```

@tab Python

```py
class MyClass:
    msg = "world"

    #region snippet
    def sayHello(self):
        print("Hello " + self.msg + "!")
    #region snippet

    def sayBye(self):
        print("Bye " + self.msg + "!")
```

@tab Visual Basic

```vb
Imports System

Module Module1
   # Region snippet
   Sub Main()
     Console.WriteLine("Hello World!")
     Console.WriteLine("Press Enter Key to Exit.")
     Console.ReadLine()
   End Sub
   # EndRegion
End Module
```

@tab Bat

```bat
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
echo Requesting administrative privileges...
goto UACPrompt
) else ( goto gotAdmin )

::#region snippet
:UACPrompt
echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
"%temp%\getadmin.vbs"
exit /B
::#endregion snippet

:gotAdmin
if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
pushd "%CD%"
CD /D "%~dp0"
```

@tab C#

```cs
using System;

namespace HelloWorldApp {

    class Geeks {

        // #region snippet
        static void Main(string[] args) {

            // statement
            // printing Hello World!
            Console.WriteLine("Hello World!");

            // To prevents the screen from
            // running and closing quickly
            Console.ReadKey();
        }
        // #endregion snippet
    }
}
```

:::

::::

::: tip 嵌套与转义

- 你可以在选项中设置 `deep: true` 让插件递归处理导入 Markdown 文件的 `<!-- @include:  -->` 语法。
- 你可以通过在 `<-- @include -->` 语法之前添加零宽空格 (`U+200B` or `&#8203;`) 来转义:

  ```md
  &#8203;<!-- @include: ./demo.snippet.md -->
  ```

  会被渲染为

  &#8203;<!-- @include: ./demo.snippet.md -->

:::

## 选项

```ts
interface MarkdownItIncludeOptions {
  /**
   * 获得当前文件路径
   *
   * @default (path) => path
   */
  currentPath: (env: any) => string;

  /**
   * 处理 include 文件路径
   *
   * @default (path) => path
   */
  resolvePath?: (path: string, cwd: string | null) => string;

  /**
   * 是否深度导入包含的 Markdown 文件
   *
   * @default false
   */
  deep?: boolean;

  /**
   * 是否解析包含的 Markdown 文件的里的相对图像路径
   *
   * @default true
   */
  resolveImagePath?: boolean;

  /**
   * 是否解析包含的 Markdown 文件的里的文件相对路径
   *
   * @default true
   */
  resolveLinkPath?: boolean;
}
```

## 示例

`<!-- @include: ./demo.snippet.md -->`:

<!-- @include: ./demo.snippet.md -->

`<!-- @include: ./demo.snippet.md{9-13} -->`:

<!-- @include: ./demo.snippet.md{9-13} -->

`<!-- @include: ./demo.snippet.md#snippet -->`:

<!-- @include: ./demo.snippet.md#snippet -->

:::: details demo.snippet.md 的内容

```md
## 二级标题

<!-- #region snippet -->

内容包含**加粗文字**和一些其他增强内容:

<!-- #endregion snippet -->

::: tip

你最近怎么样了? :smile:

:::
```

::::
