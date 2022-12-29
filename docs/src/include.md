---
title: "@mdit/plugin-include"
icon: at
---

Plugin to include other files in markdown.

<!-- more -->

## Usage

::: code-tabs#language

@tab TS

```ts
import MarkdownIt from "markdown-it";
import { include } from "@mdit/plugin-include";

const mdIt = MarkdownIt().use(include, {
  // your options, currentPath is required
  currentPath: (env) => env.filePath,
});

mdIt.render("@include(./path/to/include/file.md)", {
  filePath: "path/to/current/file.md",
});
```

@tab JS

```js
const MarkdownIt = require("markdown-it");
const { include } = require("@mdit/plugin-include");

const mdIt = MarkdownIt().use(include, {
  // your options, currentPath is required
  currentPath: (env) => env.filePath,
});

mdIt.render("@include(./path/to/include/file.md)", {
  filePath: "path/to/current/file.md",
});
```

:::

Since markdown-it only receive markdown content in `render()` api, so the plugin don't know the file path of current content so don't know where to find the include files.

To solve this, you should pass the information via `env` object, and set `currentPath` in plugin options.

`currentPath` function will receive `env` object and should return path to current file.

Also, to support alias, you can set `resolvePath` in plugin options.

For example, the following code add support for `@src` alias:

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

Also, by default, images and links in included files will be resolved relative to the imported file, however you can change this behavior by setting `resolveImagePath` and `resolveLinkPath` to `false` in plugin options.

Moreover, the plugin support `deep` function, which will handle nested `@include` in included files if this option is set to `true`.

## Syntax

Use `@include(filename)` to include a file.

To partially import the file, you can specify the range of lines to be included:

- `@include(filename{start-end})`
- `@include(filename{start-})`
- `@include(filename{-end})`

Also you can include file region:

- `@include(filename#region)`

:::: info File region

File region is a concept in vscode, where the region content is surrounded by `#region` and `#endregion` comments.

Here are some examples:

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

mdIt.render("@include(./path/to/include/file.md)", {
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

mdIt.render("@include(./path/to/include/file.md)", {
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

## Options

```ts
interface MarkdownItIncludeOptions {
  /**
   * Get current filePath
   *
   * @default (path) => path
   */
  currentPath: (env: any) => string;

  /**
   * handle include filePath
   *
   * @default (path) => path
   */
  resolvePath?: (path: string, cwd: string | null) => string;

  /**
   * Whether deep include files in included Markdown files
   *
   * @default false
   */
  deep?: boolean;

  /**
   * Whether resolve the image related path in the included Markdown file
   *
   * @default true
   */
  resolveImagePath?: boolean;

  /**
   * Whether resolve the related file link path in the included Markdown file
   *
   * @default true
   */
  resolveLinkPath?: boolean;
}
```

## Demo

`@include(./demo.snippet.md)`:

@include(./demo.snippet.md)

`@include(./demo.snippet.md{9-13})`:

@include(./demo.snippet.md{9-13})

`@include(./demo.snippet.md#snippet)`:

@include(./demo.snippet.md#snippet)

:::: details Contents of demo.snippet.md

```md
## Heading 2

<!-- #region snippet -->

Contents containing **bolded text** and some markdown enhance features:

<!-- #endregion snippet -->

::: tip

Hey how are **you**? :smile:

:::
```

::::
