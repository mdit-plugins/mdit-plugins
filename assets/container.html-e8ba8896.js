import{_ as c,V as i,W as l,a0 as u,Y as r,Z as a,X as n,$ as s,a1 as d,k}from"./framework-065971e3.js";const m={},v=n("p",null,"用于创建块级自定义容器的插件。",-1),g=n("h2",{id:"使用",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#使用","aria-hidden":"true"},"#"),s(" 使用")],-1),b=n("div",{class:"language-typescript","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(" MarkdownIt "),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" container "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"@mdit/plugin-container"'),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("container"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// your options, name is required"),s(`
  name`),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"warning"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"# Heading 🎉{#heading}"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])])],-1),h=n("div",{class:"language-javascript","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),s(" MarkdownIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token punctuation"},"{"),s(" container "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-container"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("container"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// your options, name is required"),s(`
  `),n("span",{class:"token literal-property property"},"name"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"warning"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"# Heading 🎉{#heading}"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])])],-1),w=d(`<h2 id="格式" tabindex="-1"><a class="header-anchor" href="#格式" aria-hidden="true">#</a> 格式</h2><p>使用此插件，你可以创建块容器，例如:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>::: warning
<span class="token italic"><span class="token punctuation">_</span><span class="token content">here be dragons</span><span class="token punctuation">_</span></span>
:::
</code></pre></div><p>并指定它们应该如何呈现。如果没有定义渲染器，将创建带有容器名称 class 的 <code>&lt;div&gt;</code>：</p><div class="language-html" data-ext="html"><pre class="language-html"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>warning<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>here be dragons<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>
</code></pre></div><p>标记与代码块相同。但是默认情况下，插件使用另一个字符作为标记并且内容由插件呈现为 Markdown 标记。</p><div class="hint-container tip"><p class="hint-container-title">嵌套和转义</p><ul><li><p>嵌套可以通过增加外层容器的 marker 数量完成:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>:::: warning
警告内容内容...
::: details
详情...
:::
::::
</code></pre></div><p>会被渲染为</p><div class="hint-container warning"><p class="hint-container-title">注意</p><p>警告内容内容...</p><details class="hint-container details"><summary>详情</summary><p>详情...</p></details></div></li><li><p>转义可以通过在 marker 前添加 <code>\\</code> 转义来完成:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>\\::: warning

:::
</code></pre></div><p>会被渲染为</p><p>::: warning</p><p>:::</p></li></ul></div><h2 id="选项" tabindex="-1"><a class="header-anchor" href="#选项" aria-hidden="true">#</a> 选项</h2><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">interface</span> <span class="token class-name">MarkdownItContainerOptions</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * 自定义容器的名称
   */</span>
  name<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 自定义容器的标识符
   *
   * <span class="token keyword">@default</span> &quot;:&quot;
   */</span>
  marker<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 校验内容是否应该作为此类型容器
   *
   * <span class="token keyword">@param</span> <span class="token parameter">params</span> 标识符后面的内容
   * <span class="token keyword">@param</span> <span class="token parameter">markup</span> 标识字符
   * <span class="token keyword">@returns</span> 是否是此容器类型
   *
   * <span class="token keyword">@default</span> params.trim().split(&quot; &quot;, 2)[0] === name
   */</span>
  validate<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span>params<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> markup<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">boolean</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 开始标签渲染函数
   */</span>
  openRender<span class="token operator">?</span><span class="token operator">:</span> RenderRule<span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 结束标签渲染函数
   */</span>
  closeRender<span class="token operator">?</span><span class="token operator">:</span> RenderRule<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="示例" tabindex="-1"><a class="header-anchor" href="#示例" aria-hidden="true">#</a> 示例</h2><h3 id="提示容器" tabindex="-1"><a class="header-anchor" href="#提示容器" aria-hidden="true">#</a> 提示容器</h3><p>通过添加一些样式和:</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>md<span class="token punctuation">.</span><span class="token function">use</span><span class="token punctuation">(</span>container<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;hint&quot;</span><span class="token punctuation">,</span>
  <span class="token function-variable function">openRender</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter">tokens<span class="token punctuation">,</span> index<span class="token punctuation">,</span> _options</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> info <span class="token operator">=</span> tokens<span class="token punctuation">[</span>index<span class="token punctuation">]</span><span class="token punctuation">.</span>info<span class="token punctuation">.</span><span class="token function">trim</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">slice</span><span class="token punctuation">(</span><span class="token number">4</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">trim</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">&lt;div class=&quot;custom-container hint&quot;&gt;\\n&lt;p class=&quot;custom-container-title&quot;&gt;</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>
      info <span class="token operator">||</span> <span class="token string">&quot;Hint&quot;</span>
    <span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">&lt;/p&gt;\\n</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>你可以像这样写一个提示:</p><div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code>::: hint 这是一个提示
:::

::: hint

这是一个为你准备的<span class="token bold"><span class="token punctuation">**</span><span class="token content">提示</span><span class="token punctuation">**</span></span>!

<span class="token list punctuation">-</span> 提示 1
  <span class="token list punctuation">-</span> 提示 1.1
  <span class="token list punctuation">-</span> 提示 1.2
<span class="token list punctuation">-</span> 提示 2

:::
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container hint"><p class="custom-container-title">这是一个提示</p></div><div class="custom-container hint"><p class="custom-container-title">Hint</p><p>这是一个为你准备的<strong>提示</strong>!</p><ul><li>提示 1 <ul><li>提示 1.1</li><li>提示 1.2</li></ul></li><li>提示 2</li></ul></div>`,17);function f(y,_){const t=k("CodeTabs");return i(),l("div",null,[v,u(" more "),g,r(t,{id:"7",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:a(({title:e,value:p,isActive:o})=>[b]),tab1:a(({title:e,value:p,isActive:o})=>[h]),_:1}),w])}const q=c(m,[["render",f],["__file","container.html.vue"]]);export{q as default};
