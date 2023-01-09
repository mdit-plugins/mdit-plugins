import{_ as r,V as u,W as v,a0 as b,Y as o,Z as a,X as n,$ as s,a1 as l,k as p}from"./framework-065971e3.js";const m={},k=n("p",null,"Plugin for creating block-level custom tabs.",-1),g=n("h2",{id:"usage",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#usage","aria-hidden":"true"},"#"),s(" Usage")],-1),h=n("div",{class:"language-typescript","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(" MarkdownIt "),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" tab "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"@mdit/plugin-tab"'),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("tab"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// your options, name is required"),s(`
  name`),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"tabs"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"content"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])])],-1),f=n("div",{class:"language-javascript","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),s(" MarkdownIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token punctuation"},"{"),s(" tab "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-tab"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("tab"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// your options, name is required"),s(`
  `),n("span",{class:"token literal-property property"},"name"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token string"},'"tabs"'),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"content"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])])],-1),w=l(`<p>With this plugin, you can create tabs container with <code>::: name</code> and <code>:::</code>, with <code>name</code> is the value you set as name.</p><p>In this container, you can use <code>@tab</code> marker to mark and separate tab contents.</p><p><code>@tab</code> marker can be followed by a text, which will be used as tab title, and you can use <code>@tab:active</code> to mark the tab with default active state.</p><p>Any contents after a <code>@tab</code> marker and before container closing marker or new <code>@tab</code> marker will be considered as tab content. And contents before first <code>@tab</code> marker will be dropped.</p><p>To support global tab switching state, the plugin allows you to add an id suffix in <code>tabs</code> container, which will be used as tab id, and Also allows you to add an id suffix in <code>@tab</code> marker, which will be used as tab value. So it&#39;s possible for you to make all tabs with same id share same switch event.</p><p>By default the plugin renders related tabs dom for you, if you want to customize the rendering, you can pass <code>tabsOpenRenderer</code>, <code>tabsCloseRenderer</code>, <code>tabOpenRenderer</code> and <code>tabCloseRenderer</code> to the plugin options.</p><p><code>tabsOpenRenderer</code> and <code>tabOpenRenderer</code> receives extra information as first args, see <a href="#options">Options</a> for more details.</p><p>The plugin doesn&#39;t provide any styles, and will not register any events, so that you should add styles and events by yourself.</p><div class="hint-container tip"><p class="hint-container-title">Nesting and escaping</p><ul><li><p>Nesting is <strong>not</strong> supported because <code>@tab</code> does not contain any information about what tab container it&#39;s marking.</p></li><li><p>If you need to use <code>@tab</code> at the beginning of the line, you can use <code>\\</code> to escape it to <code>\\@tab</code></p></li><li><p>If your tab title contain <code>#</code>, you can escape it with <code>\\</code>:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>@tab c\\#
</code></pre></div></li></ul></div><h2 id="options" tabindex="-1"><a class="header-anchor" href="#options" aria-hidden="true">#</a> Options</h2><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">interface</span> <span class="token class-name">MarkdownItTabData</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * Title of tab
   */</span>
  title<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Tab index
   */</span>
  index<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Identifier of tab
   */</span>
  id<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Whether the tab is active
   */</span>
  isActive<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">interface</span> <span class="token class-name">MarkdownItTabInfo</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * Which tab is active
   *
   * <span class="token keyword">@description</span> -1 means no tab is active
   */</span>
  active<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Data of tabs
   */</span>
  data<span class="token operator">:</span> MarkdownItTabData<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">interface</span> <span class="token class-name">MarkdownItTabOptions</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * The name of the tab container.
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo" aria-hidden="true">#</a> Demo</h2><p>A tab of fruit:</p>`,13),_=n("p",null,"Apple",-1),y=n("p",null,"Banana",-1),x=l(`<div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code>::: tabs#fruit

@tab apple#apple

Apple

@tab banana#banana

Banana

:::
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Another tab of fruit:</p>`,2),A=n("p",null,"Apple",-1),T=n("p",null,"Banana",-1),I=n("p",null,"Orange",-1),O=l(`<div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code>::: tabs#fruit

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>A tab of fruit without id:</p>`,2),R=n("p",null,"Apple",-1),B=n("p",null,"Banana",-1),M=n("p",null,"Orange",-1),C=l(`<div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code>::: tabs

@tab apple

Apple

@tab banana

Banana

@tab orange

Orange

:::
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1);function N(V,D){const d=p("CodeTabs"),c=p("Tabs");return u(),v("div",null,[k,b(" more "),g,o(d,{id:"7",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:a(({title:e,value:t,isActive:i})=>[h]),tab1:a(({title:e,value:t,isActive:i})=>[f]),_:1}),w,o(c,{id:"69",data:[{title:"apple",id:"apple"},{title:"banana",id:"banana"}],"tab-id":"fruit"},{tab0:a(({title:e,value:t,isActive:i})=>[_]),tab1:a(({title:e,value:t,isActive:i})=>[y]),_:1}),x,o(c,{id:"85",data:[{title:"apple"},{title:"banana"},{title:"orange"}],"tab-id":"fruit"},{tab0:a(({title:e,value:t,isActive:i})=>[A]),tab1:a(({title:e,value:t,isActive:i})=>[T]),tab2:a(({title:e,value:t,isActive:i})=>[I]),_:1}),O,o(c,{id:"106",data:[{title:"apple"},{title:"banana"},{title:"orange"}]},{tab0:a(({title:e,value:t,isActive:i})=>[R]),tab1:a(({title:e,value:t,isActive:i})=>[B]),tab2:a(({title:e,value:t,isActive:i})=>[M]),_:1}),C])}const S=r(m,[["render",N],["__file","tab.html.vue"]]);export{S as default};
