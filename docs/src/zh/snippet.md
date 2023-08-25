---
title: "@mdit/plugin-snippet"
icon: context
---

用于在 Markdown 中导入代码片段的插件。

<!-- more -->

## 使用 <Badge text="仅限 Node.js 环境" />

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { snippet } from "@mdit/plugin-snippet";

const mdIt = MarkdownIt().use(snippet, {
  // 你的选项，currentPath 是必填的
  currentPath: (env) => env.filePath,
});

mdIt.render("<<< example.ts", {
  filePath: "path/to/current/file.md",
});
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { snippet } = require("@mdit/plugin-snippet");

const mdIt = MarkdownIt().use(snippet, {
  // 你的选项，currentPath 是必填的
  currentPath: (env) => env.filePath,
});

mdIt.render("<<< example.js", {
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
const { snippet } = require("@mdit/plugin-snippet");

const mdIt = MarkdownIt();

mdIt.use(snippet, {
  currentPath: (env) => env.filePath,
  resolvePath: (path, cwd) => {
    if (path.startsWith("@src")) {
      return path.replace("@src", "path/to/src/folder");
    }

    return path.join(cwd, path);
  },
});
```

## 格式

使用 `<<< filename` 截取代码片段。 如果你想突出显示特定的行，你可以使用 `{lines}` 来做到这一点。

您也可以在末尾使用 `#regionName` 截取文件区域。

例子:

- `<<< example.html` 导入 `example.html` 作为片段
- `<<< example.js{1,3,7-9}`。 将 `example.js` 作为代码段导入并突出显示第 1、3、7 到 9 行
- `<<< example.css#normalize` 在 `example.css` 中导入 `normalize` 片段
- `<<< example.ts#plugin{2-5}` 在 `example.ts` 中导入 `plugin` 片段并突出显示第 1 到 3 行

::: note

行高亮需要其他插件支持，插件只提供高亮信息给代码块。

::::

:::: info 文件区域

文件区域是 vscode 中的一个概念，区域内容被 `#region` 和 `#endregion` 注释包围。

这里有些例子：

::: code-tabs#language

@tab HTML

```html
<!doctype html>
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
import { snippet } from "@mdit/plugin-snippet";

// #region snippet
const mdIt = MarkdownIt().use(snippet, {
  // 你的选项，currentPath 是必填的
  currentPath: (env) => env.filePath,
});
// #endregion snippet

mdIt.render("@snippet(./path/to/snippet/file.md)", {
  filePath: "path/to/current/file.md",
});
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { snippet } = require("@mdit/plugin-snippet");

// #region snippet
const mdIt = MarkdownIt().use(snippet, {
  // 你的选项，currentPath 是必填的
  currentPath: (env) => env.filePath,
});
// #endregion snippet

mdIt.render("@snippet(./path/to/snippet/file.md)", {
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

::: tip Escaping

- You can escape `<` by `\`

  ```md
  \<<< test.js
  ```

  will be

  \<<< test.js

:::

## 选项

```ts
interface MarkdownItSnippetOptions {
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
}
```

## 示例

`<<< @snippets/example.css`:

<<< @snippets/example.css

`<<< @snippets/example.ts#snippet`:

<<< @snippets/example.ts#snippet

`<<< @snippets/example.html#snippet{2-5}`:

<<< @snippets/example.html#snippet{2-5}
