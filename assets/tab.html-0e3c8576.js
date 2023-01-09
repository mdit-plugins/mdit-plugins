import{_ as r,V as u,W as v,a0 as k,Y as o,Z as a,X as n,$ as s,a1 as l,k as p}from"./framework-065971e3.js";const b={},m=n("p",null,"用于创建块级自定义选项卡的插件。",-1),g=n("h2",{id:"使用",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#使用","aria-hidden":"true"},"#"),s(" 使用")],-1),_=n("div",{class:"language-typescript","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(" MarkdownIt "),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" tab "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"@mdit/plugin-tab"'),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("tab"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// 你的选项，name 是必填的"),s(`
  name`),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"tabs"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"content"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])])],-1),h=n("div",{class:"language-javascript","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),s(" MarkdownIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token punctuation"},"{"),s(" tab "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-tab"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("tab"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// 你的选项，name 是必填的"),s(`
  `),n("span",{class:"token literal-property property"},"name"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"tabs"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"content"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])])],-1),w=l(`<p>使用此插件，你可以使用 <code>::: name</code> 和 <code>:::</code> 来创建选项卡容器，其中 <code>name</code> 是你设置为名称的值。</p><p>在这个容器中，你可以使用 <code>@tab</code> 标记来标记和分隔选项卡内容。</p><p><code>@tab</code> 标记后面可以跟一个文本，该文本将用作选项卡标题，你可以使用 <code>@tab:active</code> 将选项卡标记为默认活动状态。</p><p><code>@tab</code> 标记之后和容器关闭标记或新的 <code>@tab</code> 标记之前的任何内容都将被视为选项卡内容。 并且第一个 <code>@tab</code> 标记之前的内容将被删除。</p><p>为了支持全局标签切换状态，该插件允许你在 <code>tabs</code> 容器中添加一个 id 后缀，它将用作标签 id，并且还允许你在 <code>@tab</code> 标记中添加一个 id 后缀，将被使用作为选项卡值。 因此，你可以让所有具有相同 ID 的选项卡共享相同的切换事件。</p><p>默认情况下，插件会为你呈现相关的标签 dom，如果你想自定义呈现，可以将 <code>tabsOpenRenderer</code>、<code>tabsCloseRenderer</code>、<code>tabOpenRenderer</code> 和 <code>tabCloseRenderer</code> 传递给插件选项。</p><p><code>tabsOpenRenderer</code> 和 <code>tabOpenRenderer</code> 接收额外信息作为第一个参数，有关更多详细信息，请参阅 <a href="#%E9%80%89%E9%A1%B9">选项</a>。</p><p>该插件不提供任何样式，也不会注册任何事件，需要你自行添加样式和事件。</p><div class="hint-container tip"><p class="hint-container-title">嵌套和转义</p><ul><li><p><strong>不</strong>支持嵌套，因为 <code>@tab</code> 不包含任何关于它标记的选项卡容器的信息。</p></li><li><p>如果你需要在行首使用 <code>@tab</code>，你可以使用 <code>\\</code> 将其转义为 <code>\\@tab</code></p></li><li><p>如果你的选项卡标题包含 <code>#</code>，你可以使用 <code>\\</code> 将其转义：</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>@tab c\\#
</code></pre></div></li></ul></div><h2 id="选项" tabindex="-1"><a class="header-anchor" href="#选项" aria-hidden="true">#</a> 选项</h2><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">interface</span> <span class="token class-name">MarkdownItTabData</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * Tab 标题
   */</span>
  title<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Tab 索引
   */</span>
  index<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Tab 标识符
   */</span>
  id<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Tab 是否激活
   */</span>
  isActive<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">interface</span> <span class="token class-name">MarkdownItTabInfo</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * 激活的 Tab
   *
   * <span class="token keyword">@description</span> -1 表示没有 Tab 激活
   */</span>
  active<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Tab 数据
   */</span>
  data<span class="token operator">:</span> MarkdownItTabData<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">interface</span> <span class="token class-name">MarkdownItTabOptions</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * Tab 容器的名称。
   */</span>
  name<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Tabs open renderer
   */</span>
  tabsOpenRenderer<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span>
    info<span class="token operator">:</span> MarkdownItTabInfo<span class="token punctuation">,</span>
    tokens<span class="token operator">:</span> Token<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    index<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">,</span>
    options<span class="token operator">:</span> Options<span class="token punctuation">,</span>
    env<span class="token operator">:</span> <span class="token builtin">unknown</span><span class="token punctuation">,</span>
    self<span class="token operator">:</span> Renderer
  <span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Tabs close renderer
   */</span>
  tabsCloseRenderer<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span>
    tokens<span class="token operator">:</span> Token<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    index<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">,</span>
    options<span class="token operator">:</span> Options<span class="token punctuation">,</span>
    env<span class="token operator">:</span> <span class="token builtin">unknown</span><span class="token punctuation">,</span>
    self<span class="token operator">:</span> Renderer
  <span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * tab open renderer
   */</span>
  tabOpenRenderer<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span>
    data<span class="token operator">:</span> MarkdownItTabData<span class="token punctuation">,</span>
    tokens<span class="token operator">:</span> Token<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    index<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">,</span>
    options<span class="token operator">:</span> Options<span class="token punctuation">,</span>
    env<span class="token operator">:</span> <span class="token builtin">unknown</span><span class="token punctuation">,</span>
    self<span class="token operator">:</span> Renderer
  <span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * tab close renderer
   */</span>
  tabCloseRenderer<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span>
    tokens<span class="token operator">:</span> Token<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    index<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">,</span>
    options<span class="token operator">:</span> Options<span class="token punctuation">,</span>
    env<span class="token operator">:</span> <span class="token builtin">unknown</span><span class="token punctuation">,</span>
    self<span class="token operator">:</span> Renderer
  <span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="示例" tabindex="-1"><a class="header-anchor" href="#示例" aria-hidden="true">#</a> 示例</h2><p>一个水果选项卡列表:</p>`,13),f=n("p",null,"Apple",-1),T=n("p",null,"Banana",-1),x=l(`<div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code>::: tabs#fruit

@tab apple#apple

Apple

@tab banana#banana

Banana

:::
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另一个水果选项卡列表:</p>`,2),y=n("p",null,"Apple",-1),A=n("p",null,"Banana",-1),I=n("p",null,"Orange",-1),O=l(`<div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code>::: tabs#fruit

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>一个没有绑定 id 的水果选项卡列表:</p>`,2),R=n("p",null,"Apple",-1),B=n("p",null,"Banana",-1),M=n("p",null,"Orange",-1),C=l(`<div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code>::: tabs

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1);function V(N,D){const d=p("CodeTabs"),c=p("Tabs");return u(),v("div",null,[m,k(" more "),g,o(d,{id:"7",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:a(({title:e,value:t,isActive:i})=>[_]),tab1:a(({title:e,value:t,isActive:i})=>[h]),_:1}),w,o(c,{id:"69",data:[{title:"apple",id:"apple"},{title:"banana",id:"banana"}],"tab-id":"fruit"},{tab0:a(({title:e,value:t,isActive:i})=>[f]),tab1:a(({title:e,value:t,isActive:i})=>[T]),_:1}),x,o(c,{id:"85",data:[{title:"apple"},{title:"banana"},{title:"orange"}],"tab-id":"fruit"},{tab0:a(({title:e,value:t,isActive:i})=>[y]),tab1:a(({title:e,value:t,isActive:i})=>[A]),tab2:a(({title:e,value:t,isActive:i})=>[I]),_:1}),O,o(c,{id:"106",data:[{title:"apple"},{title:"banana"},{title:"orange"}]},{tab0:a(({title:e,value:t,isActive:i})=>[R]),tab1:a(({title:e,value:t,isActive:i})=>[B]),tab2:a(({title:e,value:t,isActive:i})=>[M]),_:1}),C])}const E=r(b,[["render",V],["__file","tab.html.vue"]]);export{E as default};
