import{_ as p,V as u,W as r,a0 as d,Y as l,Z as a,X as n,$ as s,a1 as i,k}from"./framework-065971e3.js";const m={},v=n("p",null,"用于在 markdown 中导入代码片段的插件。",-1),b=n("h2",{id:"使用",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#使用","aria-hidden":"true"},"#"),s(" 使用")],-1),g=n("div",{class:"language-typescript line-numbers-mode","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(" MarkdownIt "),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" snippet "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"@mdit/plugin-snippet"'),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("snippet"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// 你的选项，currentPath 是必填的"),s(`
  `),n("span",{class:"token function-variable function"},"currentPath"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"("),s("env"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(" env"),n("span",{class:"token punctuation"},"."),s("filePath"),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"<<< example.ts"'),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  filePath`),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"path/to/current/file.md"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),h=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),s(" MarkdownIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token punctuation"},"{"),s(" snippet "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-snippet"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("snippet"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// 你的选项，currentPath 是必填的"),s(`
  `),n("span",{class:"token function-variable function"},"currentPath"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"env"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(" env"),n("span",{class:"token punctuation"},"."),s("filePath"),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"<<< example.js"'),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token literal-property property"},"filePath"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"path/to/current/file.md"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),f=i(`<p>由于 markdown-it 仅在 <code>render()</code> api 中接收 markdown 内容，因此插件不知道当前内容的文件路径，因此不知道在哪里可以找到包含文件。</p><p>要解决这个问题，你应该通过 env 对象传递信息，并在插件选项中设置 <code>currentPath</code>。</p><p><code>currentPath</code> 函数将接收 <code>env</code> 对象并返回当前文件的路径。</p><p>此外，要支持别名，你可以在插件选项中设置 <code>resolvePath</code>。</p><p>例如，以下代码添加了对 <code>@src</code> 别名的支持：</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> MarkdownIt <span class="token operator">=</span> <span class="token keyword">require</span><span class="token punctuation">(</span><span class="token string">&quot;markdown-it&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> <span class="token punctuation">{</span> snippet <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token keyword">require</span><span class="token punctuation">(</span><span class="token string">&quot;@mdit/plugin-snippet&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> mdIt <span class="token operator">=</span> <span class="token function">MarkdownIt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

mdIt<span class="token punctuation">.</span><span class="token function">use</span><span class="token punctuation">(</span>snippet<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token function-variable function">currentPath</span><span class="token operator">:</span> <span class="token punctuation">(</span>env<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> env<span class="token punctuation">.</span>filePath<span class="token punctuation">,</span>
  <span class="token function-variable function">resolvePath</span><span class="token operator">:</span> <span class="token punctuation">(</span>path<span class="token punctuation">,</span> cwd<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>path<span class="token punctuation">.</span><span class="token function">startsWith</span><span class="token punctuation">(</span><span class="token string">&quot;@src&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> path<span class="token punctuation">.</span><span class="token function">replace</span><span class="token punctuation">(</span><span class="token string">&quot;@src&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;path/to/src/folder&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> path<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span>cwd<span class="token punctuation">,</span> path<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="语法" tabindex="-1"><a class="header-anchor" href="#语法" aria-hidden="true">#</a> 语法</h2><p>使用 <code>&lt;&lt;&lt; filename</code> 截取代码片段。 如果你想突出显示特定的行，你可以使用 <code>{lines}</code> 来做到这一点。</p><p>您也可以在末尾使用 <code>#regionName</code> 截取文件区域。</p><p>例子:</p><ul><li><code>&lt;&lt;&lt; example.html</code> 导入 <code>example.html</code> 作为片段</li><li><code>&lt;&lt;&lt; example.js{1,3,7-9}</code>。 将 <code>example.js</code> 作为代码段导入并突出显示第 1、3、7 到 9 行</li><li><code>&lt;&lt;&lt; example.css#normalize</code> 在 <code>example.css</code> 中导入 <code>normalize</code> 片段</li><li><code>&lt;&lt;&lt; example.ts#plugin{2-5}</code> 在 <code>example.ts</code> 中导入 <code>plugin</code> 片段并突出显示第 1 到 3 行</li></ul><div class="hint-container note"><p class="hint-container-title">注</p><p>行高亮需要其他插件支持，插件只提供高亮信息给代码块。</p></div>`,12),y={class:"hint-container info"},w=n("p",{class:"hint-container-title"},"文件区域",-1),_=n("p",null,[s("文件区域是 vscode 中的一个概念，区域内容被 "),n("code",null,"#region"),s(" 和 "),n("code",null,"#endregion"),s(" 注释包围。")],-1),q=n("p",null,"这里有些例子：",-1),x=n("div",{class:"language-html line-numbers-mode","data-ext":"html"},[n("pre",{class:"language-html"},[n("code",null,[n("span",{class:"token doctype"},[n("span",{class:"token punctuation"},"<!"),n("span",{class:"token doctype-tag"},"DOCTYPE"),s(),n("span",{class:"token name"},"html"),n("span",{class:"token punctuation"},">")]),s(`
`),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("html")]),s(),n("span",{class:"token attr-name"},"lang"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("zh-CN"),n("span",{class:"token punctuation"},'"')]),n("span",{class:"token punctuation"},">")]),s(`
  `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("head")]),n("span",{class:"token punctuation"},">")]),s(`
    `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("meta")]),s(),n("span",{class:"token attr-name"},"charset"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("UTF-8"),n("span",{class:"token punctuation"},'"')]),s(),n("span",{class:"token punctuation"},"/>")]),s(`
    `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("meta")]),s(),n("span",{class:"token attr-name"},"http-equiv"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("X-UA-Compatible"),n("span",{class:"token punctuation"},'"')]),s(),n("span",{class:"token attr-name"},"content"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("IE=edge"),n("span",{class:"token punctuation"},'"')]),s(),n("span",{class:"token punctuation"},"/>")]),s(`
    `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("meta")]),s(),n("span",{class:"token attr-name"},"name"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("viewport"),n("span",{class:"token punctuation"},'"')]),s(),n("span",{class:"token attr-name"},"content"),n("span",{class:"token attr-value"},[n("span",{class:"token punctuation attr-equals"},"="),n("span",{class:"token punctuation"},'"'),s("width=device-width, initial-scale=1.0"),n("span",{class:"token punctuation"},'"')]),s(),n("span",{class:"token punctuation"},"/>")]),s(`
    `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("title")]),n("span",{class:"token punctuation"},">")]),s("Document"),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("title")]),n("span",{class:"token punctuation"},">")]),s(`
  `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("head")]),n("span",{class:"token punctuation"},">")]),s(`
  `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("body")]),n("span",{class:"token punctuation"},">")]),s(`
    `),n("span",{class:"token comment"},"<!-- region snippet -->"),s(`
    `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("p")]),n("span",{class:"token punctuation"},">")]),s(`
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi,
      repellendus. Voluptatibus alias cupiditate at, fuga tenetur error officiis
      provident quisquam autem, porro facere! Neque quibusdam animi quaerat
      eligendi recusandae eaque.
    `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("p")]),n("span",{class:"token punctuation"},">")]),s(`
    `),n("span",{class:"token comment"},"<!-- endregion snippet -->"),s(`
    `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"<"),s("p")]),n("span",{class:"token punctuation"},">")]),s(`
      Veniam harum illum natus omnis necessitatibus numquam architecto eum
      dignissimos, quos a adipisci et non quam maxime repellendus alias ipsum,
      vero praesentium laborum commodi perferendis velit repellat? Vero,
      cupiditate sequi.
    `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("p")]),n("span",{class:"token punctuation"},">")]),s(`
  `),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("body")]),n("span",{class:"token punctuation"},">")]),s(`
`),n("span",{class:"token tag"},[n("span",{class:"token tag"},[n("span",{class:"token punctuation"},"</"),s("html")]),n("span",{class:"token punctuation"},">")]),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),P=n("div",{class:"language-markdown line-numbers-mode","data-ext":"md"},[n("pre",{class:"language-markdown"},[n("code",null,[n("span",{class:"token title important"},[n("span",{class:"token punctuation"},"##"),s(" Hello world")]),s(`

`),n("span",{class:"token comment"},"<!-- #region snippet -->"),s(`

Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates
inventore iure quo aut doloremque, ipsum ab voluptatem ipsa, velit laborum
illo quae omnis reiciendis hic, ut dolorem non debitis in!

`),n("span",{class:"token comment"},"<!-- #endregion snippet -->"),s(`

Veniam harum illum natus omnis necessitatibus numquam architecto eum
dignissimos, quos a adipisci et non quam maxime repellendus alias ipsum,
vero praesentium laborum commodi perferendis velit repellat? Vero,
cupiditate sequi.
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),I=n("div",{class:"language-typescript line-numbers-mode","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(" MarkdownIt "),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" snippet "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"@mdit/plugin-snippet"'),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token comment"},"// #region snippet"),s(`
`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("snippet"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// 你的选项，currentPath 是必填的"),s(`
  `),n("span",{class:"token function-variable function"},"currentPath"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"("),s("env"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(" env"),n("span",{class:"token punctuation"},"."),s("filePath"),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token comment"},"// #endregion snippet"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@snippet(./path/to/snippet/file.md)"'),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  filePath`),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"path/to/current/file.md"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),A=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),s(" MarkdownIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token punctuation"},"{"),s(" snippet "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-snippet"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token comment"},"// #region snippet"),s(`
`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("snippet"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// 你的选项，currentPath 是必填的"),s(`
  `),n("span",{class:"token function-variable function"},"currentPath"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"("),n("span",{class:"token parameter"},"env"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token operator"},"=>"),s(" env"),n("span",{class:"token punctuation"},"."),s("filePath"),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token comment"},"// #endregion snippet"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@snippet(./path/to/snippet/file.md)"'),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token literal-property property"},"filePath"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"path/to/current/file.md"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),C=n("div",{class:"language-css line-numbers-mode","data-ext":"css"},[n("pre",{class:"language-css"},[n("code",null,[n("span",{class:"token selector"},`html,
body`),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token property"},"margin"),n("span",{class:"token punctuation"},":"),s(" 0"),n("span",{class:"token punctuation"},";"),s(`
  `),n("span",{class:"token property"},"padding"),n("span",{class:"token punctuation"},":"),s(" 0"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"/* #region snippet */"),s(`
`),n("span",{class:"token selector"},"h1"),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token property"},"font-size"),n("span",{class:"token punctuation"},":"),s(" 1.5rem"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token comment"},"/* #endregion snippet */"),s(`

`),n("span",{class:"token selector"},"h2"),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token property"},"font-size"),n("span",{class:"token punctuation"},":"),s(" 1.2rem"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),M=n("div",{class:"language-less line-numbers-mode","data-ext":"less"},[n("pre",{class:"language-less"},[n("code",null,[n("span",{class:"token selector"},`html,
body`),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token property"},"margin"),n("span",{class:"token punctuation"},":"),s(" 0"),n("span",{class:"token punctuation"},";"),s(`
  `),n("span",{class:"token property"},"padding"),n("span",{class:"token punctuation"},":"),s(" 0"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"/* #region snippet */"),s(`
`),n("span",{class:"token selector"},"h1"),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token property"},"font-size"),n("span",{class:"token punctuation"},":"),s(" 1.5rem"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token comment"},"/* #endregion snippet */"),s(`

`),n("span",{class:"token selector"},"h2"),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token property"},"font-size"),n("span",{class:"token punctuation"},":"),s(" 1.2rem"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),S=n("div",{class:"language-scss line-numbers-mode","data-ext":"scss"},[n("pre",{class:"language-scss"},[n("code",null,[n("span",{class:"token selector"},`html,
body `),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token property"},"margin"),n("span",{class:"token punctuation"},":"),s(" 0"),n("span",{class:"token punctuation"},";"),s(`
  `),n("span",{class:"token property"},"padding"),n("span",{class:"token punctuation"},":"),s(" 0"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`

`),n("span",{class:"token comment"},"/* #region snippet */"),s(`
`),n("span",{class:"token selector"},"h1 "),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token property"},"font-size"),n("span",{class:"token punctuation"},":"),s(" 1.5rem"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token comment"},"/* #endregion snippet */"),s(`

`),n("span",{class:"token selector"},"h2 "),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token property"},"font-size"),n("span",{class:"token punctuation"},":"),s(" 1.2rem"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),j=n("div",{class:"language-java","data-ext":"java"},[n("pre",{class:"language-java"},[n("code",null,[n("span",{class:"token keyword"},"public"),s(),n("span",{class:"token keyword"},"class"),s(),n("span",{class:"token class-name"},"HelloWorld"),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// #region snippet"),s(`
  `),n("span",{class:"token keyword"},"public"),s(),n("span",{class:"token keyword"},"static"),s(),n("span",{class:"token keyword"},"void"),s(),n("span",{class:"token function"},"main"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"String"),s(" args"),n("span",{class:"token punctuation"},"["),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token class-name"},"System"),n("span",{class:"token punctuation"},"."),s("out"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"println"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"Hello World"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
  `),n("span",{class:"token punctuation"},"}"),s(`
  `),n("span",{class:"token comment"},"// #endregion snippet"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`)])])],-1),E=n("div",{class:"language-python line-numbers-mode","data-ext":"py"},[n("pre",{class:"language-python"},[n("code",null,[n("span",{class:"token keyword"},"class"),s(),n("span",{class:"token class-name"},"MyClass"),n("span",{class:"token punctuation"},":"),s(`
    msg `),n("span",{class:"token operator"},"="),s(),n("span",{class:"token string"},'"world"'),s(`

    `),n("span",{class:"token comment"},"#region snippet"),s(`
    `),n("span",{class:"token keyword"},"def"),s(),n("span",{class:"token function"},"sayHello"),n("span",{class:"token punctuation"},"("),s("self"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},":"),s(`
        `),n("span",{class:"token keyword"},"print"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"Hello "'),s(),n("span",{class:"token operator"},"+"),s(" self"),n("span",{class:"token punctuation"},"."),s("msg "),n("span",{class:"token operator"},"+"),s(),n("span",{class:"token string"},'"!"'),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token comment"},"#region snippet"),s(`

    `),n("span",{class:"token keyword"},"def"),s(),n("span",{class:"token function"},"sayBye"),n("span",{class:"token punctuation"},"("),s("self"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},":"),s(`
        `),n("span",{class:"token keyword"},"print"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"Bye "'),s(),n("span",{class:"token operator"},"+"),s(" self"),n("span",{class:"token punctuation"},"."),s("msg "),n("span",{class:"token operator"},"+"),s(),n("span",{class:"token string"},'"!"'),n("span",{class:"token punctuation"},")"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),V=n("div",{class:"language-vb line-numbers-mode","data-ext":"vb"},[n("pre",{class:"language-vb"},[n("code",null,[n("span",{class:"token keyword"},"Imports"),s(` System

`),n("span",{class:"token keyword"},"Module"),s(` Module1
   `),n("span",{class:"token operator"},"#"),s(` Region snippet
   `),n("span",{class:"token keyword"},"Sub"),s(" Main"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
     Console`),n("span",{class:"token punctuation"},"."),s("WriteLine"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"Hello World!"'),n("span",{class:"token punctuation"},")"),s(`
     Console`),n("span",{class:"token punctuation"},"."),s("WriteLine"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"Press Enter Key to Exit."'),n("span",{class:"token punctuation"},")"),s(`
     Console`),n("span",{class:"token punctuation"},"."),s("ReadLine"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),s(`
   `),n("span",{class:"token keyword"},"End"),s(),n("span",{class:"token keyword"},"Sub"),s(`
   `),n("span",{class:"token operator"},"#"),s(` EndRegion
`),n("span",{class:"token keyword"},"End"),s(),n("span",{class:"token keyword"},"Module"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),T=n("div",{class:"language-bat line-numbers-mode","data-ext":"bat"},[n("pre",{class:"language-bat"},[n("code",null,`>nul 2>&1 "%SYSTEMROOT%\\system32\\cacls.exe" "%SYSTEMROOT%\\system32\\config\\system"
if '%errorlevel%' NEQ '0' (
echo Requesting administrative privileges...
goto UACPrompt
) else ( goto gotAdmin )

::#region snippet
:UACPrompt
echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"
echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\\getadmin.vbs"
"%temp%\\getadmin.vbs"
exit /B
::#endregion snippet

:gotAdmin
if exist "%temp%\\getadmin.vbs" ( del "%temp%\\getadmin.vbs" )
pushd "%CD%"
CD /D "%~dp0"
`)]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),z=n("div",{class:"language-csharp line-numbers-mode","data-ext":"cs"},[n("pre",{class:"language-csharp"},[n("code",null,[n("span",{class:"token keyword"},"using"),s(),n("span",{class:"token namespace"},"System"),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"namespace"),s(),n("span",{class:"token namespace"},"HelloWorldApp"),s(),n("span",{class:"token punctuation"},"{"),s(`

    `),n("span",{class:"token keyword"},"class"),s(),n("span",{class:"token class-name"},"Geeks"),s(),n("span",{class:"token punctuation"},"{"),s(`

        `),n("span",{class:"token comment"},"// #region snippet"),s(`
        `),n("span",{class:"token keyword"},"static"),s(),n("span",{class:"token return-type class-name"},[n("span",{class:"token keyword"},"void")]),s(),n("span",{class:"token function"},"Main"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},[n("span",{class:"token keyword"},"string"),n("span",{class:"token punctuation"},"["),n("span",{class:"token punctuation"},"]")]),s(" args"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token punctuation"},"{"),s(`

            `),n("span",{class:"token comment"},"// statement"),s(`
            `),n("span",{class:"token comment"},"// printing Hello World!"),s(`
            Console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"WriteLine"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"Hello World!"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

            `),n("span",{class:"token comment"},"// To prevents the screen from"),s(`
            `),n("span",{class:"token comment"},"// running and closing quickly"),s(`
            Console`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"ReadKey"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
        `),n("span",{class:"token punctuation"},"}"),s(`
        `),n("span",{class:"token comment"},"// #endregion snippet"),s(`
    `),n("span",{class:"token punctuation"},"}"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),W=i(`<div class="hint-container tip"><p class="hint-container-title">Escaping</p><ul><li><p>You can escape <code>&lt;</code> by <code>\\</code></p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>\\&lt;&lt;&lt; test.js
</code></pre></div><p>will be</p><p>&lt;&lt;&lt; test.js</p></li></ul></div><h2 id="选项" tabindex="-1"><a class="header-anchor" href="#选项" aria-hidden="true">#</a> 选项</h2><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">interface</span> <span class="token class-name">MarkdownItSnippetOptions</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * 获得当前文件路径
   *
   * <span class="token keyword">@default</span> (path) =&gt; path
   */</span>
  <span class="token function-variable function">currentPath</span><span class="token operator">:</span> <span class="token punctuation">(</span>env<span class="token operator">:</span> <span class="token builtin">any</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 处理 include 文件路径
   *
   * <span class="token keyword">@default</span> (path) =&gt; path
   */</span>
  resolvePath<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span>path<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> cwd<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="示例" tabindex="-1"><a class="header-anchor" href="#示例" aria-hidden="true">#</a> 示例</h2><p><code>&lt;&lt;&lt; @snippets/example.css</code>:</p><div class="language-css line-numbers-mode" data-ext="css"><pre class="language-css"><code><span class="token selector">html,
body</span> <span class="token punctuation">{</span>
  <span class="token property">margin</span><span class="token punctuation">:</span> 0<span class="token punctuation">;</span>
  <span class="token property">padding</span><span class="token punctuation">:</span> 0<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">/* #region snippet */</span>
<span class="token selector">h1</span> <span class="token punctuation">{</span>
  <span class="token property">font-size</span><span class="token punctuation">:</span> 1.5rem<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">/* #endregion snippet */</span>

<span class="token selector">h2</span> <span class="token punctuation">{</span>
  <span class="token property">font-size</span><span class="token punctuation">:</span> 1.2rem<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>&lt;&lt;&lt; @snippets/example.ts#snippet</code>:</p><div class="language-typescript" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> mdIt <span class="token operator">=</span> <span class="token function">MarkdownIt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">use</span><span class="token punctuation">(</span>snippet<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token comment">// your options, currentPath is required</span>
  <span class="token function-variable function">currentPath</span><span class="token operator">:</span> <span class="token punctuation">(</span>env<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> env<span class="token punctuation">.</span>filePath<span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre></div><p><code>&lt;&lt;&lt; @snippets/example.html#snippet{2-5}</code>:</p><div class="language-html" data-ext="html"><pre class="language-html"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi,
  repellendus. Voluptatibus alias cupiditate at, fuga tenetur error officiis
  provident quisquam autem, porro facere! Neque quibusdam animi quaerat
  eligendi recusandae eaque.
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span></code></pre><div class="highlight-lines"><br><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div></div></div>`,10);function H(N,L){const o=k("CodeTabs");return u(),r("div",null,[v,d(" more "),b,l(o,{id:"7",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:a(({title:t,value:e,isActive:c})=>[g]),tab1:a(({title:t,value:e,isActive:c})=>[h]),_:1}),f,n("div",y,[w,_,q,l(o,{id:"77",data:[{title:"HTML"},{title:"Markdown"},{title:"TS"},{title:"JS"},{title:"css"},{title:"Less"},{title:"Sass"},{title:"Java"},{title:"Python"},{title:"Visual Basic"},{title:"Bat"},{title:"C"}],"tab-id":"language"},{tab0:a(({title:t,value:e,isActive:c})=>[x]),tab1:a(({title:t,value:e,isActive:c})=>[P]),tab2:a(({title:t,value:e,isActive:c})=>[I]),tab3:a(({title:t,value:e,isActive:c})=>[A]),tab4:a(({title:t,value:e,isActive:c})=>[C]),tab5:a(({title:t,value:e,isActive:c})=>[M]),tab6:a(({title:t,value:e,isActive:c})=>[S]),tab7:a(({title:t,value:e,isActive:c})=>[j]),tab8:a(({title:t,value:e,isActive:c})=>[E]),tab9:a(({title:t,value:e,isActive:c})=>[V]),tab10:a(({title:t,value:e,isActive:c})=>[T]),tab11:a(({title:t,value:e,isActive:c})=>[z]),_:1})]),W])}const O=p(m,[["render",H],["__file","snippet.html.vue"]]);export{O as default};
