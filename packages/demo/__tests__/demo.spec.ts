import { escapeHtml } from "@mdit/helper";
import MarkdownIt from "markdown-it";
import { expect, it } from "vitest";

import { alert } from "../../alert/src/index.js";
import { include } from "../../include/src/plugin.js";
import { demo } from "../src/index.js";

const mdContent = `\
# Heading 1

Content text.

\`\`\`js
const a = 1;
\`\`\`\
`;

const renderContent = `\
<h1>Heading 1</h1>
<p>Content text.</p>
<pre><code class="language-js">const a = 1;
</code></pre>\
`;

const demoContent = `\
<div class="demo-content">
${renderContent}
</div>\
`;

const codeContent = `\
<pre><code class="language-md">${escapeHtml(mdContent)}
</code></pre>\
`;

it("default", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(demo);

  expect(
    markdownIt.render(`
::: demo Title text
${mdContent}
:::
`),
  ).toBe(
    `\
<details><summary>Title text</summary>
${demoContent}
${codeContent}
</details>
`,
  );

  expect(
    markdownIt.render(`
- list

  ::: demo Title text
  # Heading 1

  Content text.

  \`\`\`js
  const a = 1;
  \`\`\`
  :::
`),
  ).toBe(
    `\
<ul>
<li>
<p>list</p>
<details><summary>Title text</summary>
${demoContent}
${codeContent}
</details>
</li>
</ul>
`,
  );
});

it("customize container name", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(demo, {
    name: "preview",
  });

  expect(
    markdownIt.render(`
::: preview Title text
${mdContent}
:::
`),
  ).toBe(`\
<details><summary>Title text</summary>
${demoContent}
${codeContent}
</details>
`);

  expect(
    markdownIt.render(`
::: preview Title text

${mdContent}

:::
`),
  ).toBe(`\
<details><summary>Title text</summary>
${demoContent}
${codeContent}
</details>
`);
});

it("showCodeFirst", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(demo, {
    showCodeFirst: true,
  });

  expect(
    markdownIt.render(`
::: demo Title text
${mdContent}
:::
`),
  ).toBe(
    `\
<details><summary>Title text</summary>
${codeContent}
${demoContent}
</details>
`,
  );
});

it("customRender", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(demo, {
    openRender: () => `<details><summary>\n`,
    codeRender: (tokens, index, options, _env, self) => {
      tokens[index].type = "fence";
      tokens[index].info = "md";
      tokens[index].markup = "```";

      return `</summary>\n${self.rules.fence!(
        tokens,
        index,
        options,
        _env,
        self,
      )}`;
    },
    contentOpenRender: () => "",
    contentCloseRender: () => "",
  });

  expect(
    markdownIt.render(`
::: demo Title text
${mdContent}
:::
`),
  ).toBe(
    `\
<details><summary>
${renderContent}
</summary>
${codeContent}
</details>
`,
  );
});

it("should work with alert", () => {
  const alertContent = `\
> [!caution]
> Caution text\
`;

  const markdownItAlert = MarkdownIt({ linkify: true })
    .use(alert, { deep: true })
    .use(demo);

  expect(
    markdownItAlert.render(`
::: demo Title text
${alertContent}
:::
`),
  ).toBe(
    `\
<details><summary>Title text</summary>
<div class="demo-content">
<div class="markdown-alert markdown-alert-caution">
<p class="markdown-alert-title">Caution</p>
<p>Caution text</p>
</div>
</div>
<pre><code class="language-md">${escapeHtml(alertContent)}
</code></pre>
</details>
`,
  );
});

it("should work with import", () => {
  const importContent = `\
<!-- @include: ../../include/__tests__/__fixtures__/simpleInclude.md -->
`;

  const markdownItInclude = MarkdownIt({ linkify: true })
    .use(include, {
      currentPath: () => __filename,
    })
    .use(demo);

  const result1 = markdownItInclude.render(`
::: demo Title text
${importContent}
:::
`);

  const result2 = markdownItInclude.render(`
::: demo Title text

${importContent}

:::
`);

  expect(result1).toMatch(
    `\
<details><summary>Title text</summary>
<div class="demo-content">
<h1>ABC</h1>
<p>DEF</p>
</div>
<pre><code class="language-md"># ABC

DEF
</code></pre>
</details>
`,
  );

  expect(result2).toMatch(
    `\
<details><summary>Title text</summary>
<div class="demo-content">
<h1>ABC</h1>
<p>DEF</p>
</div>
<pre><code class="language-md"># ABC

DEF
</code></pre>
</details>
`,
  );
});

it("should not render", () => {
  const markdownIt = MarkdownIt({ linkify: true }).use(demo, {
    name: "preview",
  });

  expect(
    markdownIt.render(`
  ::: preview Title text

test

  :::
`),
  ).toBe(
    `\
<details><summary>Title text</summary>
<div class="demo-content"></div>
<pre><code class="language-md">
</code></pre>
</details>
<p>test</p>
<p>:::</p>
`,
  );
});
