import{_ as i}from"./favicon-d825ebf3.js";import{_ as d,V as r,W as u,a0 as s,Y as k,Z as e,X as n,$ as a,a1 as t,k as m}from"./framework-065971e3.js";const g={},v=n("p",null,"Plugins to add attrs to Markdown content.",-1),h=n("h2",{id:"usage",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#usage","aria-hidden":"true"},"#"),a(" Usage")],-1),b=n("div",{class:"language-typescript","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),a(" MarkdownIt "),n("span",{class:"token keyword"},"from"),a(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),a(`
`),n("span",{class:"token keyword"},"import"),a(),n("span",{class:"token punctuation"},"{"),a(" attrs "),n("span",{class:"token punctuation"},"}"),a(),n("span",{class:"token keyword"},"from"),a(),n("span",{class:"token string"},'"@mdit/plugin-attrs"'),n("span",{class:"token punctuation"},";"),a(`

`),n("span",{class:"token keyword"},"const"),a(" mdIt "),n("span",{class:"token operator"},"="),a(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),a("attrs"),n("span",{class:"token punctuation"},","),a(),n("span",{class:"token punctuation"},"{"),a(`
  `),n("span",{class:"token comment"},"// your options, optional"),a(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"# Heading 🎉{#heading}"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`
`)])])],-1),w=n("div",{class:"language-javascript","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),a(" MarkdownIt "),n("span",{class:"token operator"},"="),a(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`
`),n("span",{class:"token keyword"},"const"),a(),n("span",{class:"token punctuation"},"{"),a(" attrs "),n("span",{class:"token punctuation"},"}"),a(),n("span",{class:"token operator"},"="),a(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-attrs"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`

`),n("span",{class:"token keyword"},"const"),a(" mdIt "),n("span",{class:"token operator"},"="),a(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),a("attrs"),n("span",{class:"token punctuation"},","),a(),n("span",{class:"token punctuation"},"{"),a(`
  `),n("span",{class:"token comment"},"// your options, optional"),a(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"# Heading 🎉{#heading}"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`
`)])])],-1),f=t(`<h2 id="syntax" tabindex="-1"><a class="header-anchor" href="#syntax" aria-hidden="true">#</a> Syntax</h2><p>You can use <code>{attrs}</code> to add attrs to Markdown content.</p><p>For example, if you want a heading2 &quot;Hello World&quot; with a id &quot;say-hello-world&quot;, you can write:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code><span class="token title important"><span class="token punctuation">##</span> Hello World {#say-hello-world}</span>
</code></pre></div><p>If you want a image with class &quot;full-width&quot;, you can write:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code><span class="token url"><span class="token operator">!</span>[<span class="token content">img</span>](<span class="token url">link/to/image.png</span>)</span> {.full-width}
</code></pre></div><p>Also, other attrs are supported, so:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>A paragraph with some text. {#p .a .b attrs=center customize-attr=&quot;content with spaces&quot;}
</code></pre></div><p>will be rendered into:</p><div class="language-html" data-ext="html"><pre class="language-html"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>p<span class="token punctuation">&quot;</span></span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>a b<span class="token punctuation">&quot;</span></span> <span class="token attr-name">attrs</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>center<span class="token punctuation">&quot;</span></span> <span class="token attr-name">customize-attr</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>content with spaces<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>
  A paragraph with some text.
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span>
</code></pre></div><div class="hint-container tip"><p class="hint-container-title">Escaping</p><p>Escaping can be done by adding <code>\\</code> to escape the delimiter:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code><span class="token title important"><span class="token punctuation">###</span> Heading \\{#heading}</span>
</code></pre></div><p>will be</p><h3 id="heading-heading" tabindex="-1"><a class="header-anchor" href="#heading-heading" aria-hidden="true">#</a> Heading {#heading}</h3></div><h2 id="advanced" tabindex="-1"><a class="header-anchor" href="#advanced" aria-hidden="true">#</a> Advanced</h2><p>You can pass options to <code>@mdit-plugin-attrs</code> to customize plugin behavior.</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">type</span> <span class="token class-name">MarkdownItAttrRuleName</span> <span class="token operator">=</span>
  <span class="token operator">|</span> <span class="token string">&quot;fence&quot;</span>
  <span class="token operator">|</span> <span class="token string">&quot;inline&quot;</span>
  <span class="token operator">|</span> <span class="token string">&quot;table&quot;</span>
  <span class="token operator">|</span> <span class="token string">&quot;list&quot;</span>
  <span class="token operator">|</span> <span class="token string">&quot;hr&quot;</span>
  <span class="token operator">|</span> <span class="token string">&quot;softbreak&quot;</span>
  <span class="token operator">|</span> <span class="token string">&quot;block&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">interface</span> <span class="token class-name">MarkdownItAttrsOptions</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * left delimiter
   *
   * <span class="token keyword">@default</span> &#39;<span class="token punctuation">{</span>&#39;
   */</span>
  left<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * right delimiter
   *
   * <span class="token keyword">@default</span> &#39;<span class="token punctuation">}</span>&#39;
   */</span>
  right<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * allowed attributes
   *
   * <span class="token keyword">@description</span> An empty list means allowing all attribute
   *
   * <span class="token keyword">@default</span> []
   */</span>
  allowed<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token builtin">string</span> <span class="token operator">|</span> RegExp<span class="token punctuation">)</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Rules to enable
   *
   * <span class="token keyword">@default</span> &quot;all&quot;
   */</span>
  rule<span class="token operator">?</span><span class="token operator">:</span> <span class="token string">&quot;all&quot;</span> <span class="token operator">|</span> <span class="token builtin">boolean</span> <span class="token operator">|</span> MarkdownItAttrRuleName<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo" aria-hidden="true">#</a> Demo</h2><blockquote><p>ALl class are styled with <code>margin: 4px;padding: 4px;border: 1px solid red;</code> to show the effect.</p></blockquote><h3 id="inline" tabindex="-1"><a class="header-anchor" href="#inline" aria-hidden="true">#</a> Inline</h3><p>Text with <code class="inline-code">inline code</code> and <img src="`+i+'" alt="favicon" class="image" loading="lazy">, also supporting <em class="inline-emphasis">emphasis</em> and <strong class="inline-bold">bold</strong>.</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>Text with <span class="token code-snippet code keyword">`inline code`</span>{.inline-code} and <span class="token url"><span class="token operator">!</span>[<span class="token content">favicon</span>](<span class="token url">/favicon.ico</span>)</span>{.image}, also supporting <span class="token italic"><span class="token punctuation">_</span><span class="token content">emphasis</span><span class="token punctuation">_</span></span>{.inline-emphasis} and <span class="token bold"><span class="token punctuation">**</span><span class="token content">bold</span><span class="token punctuation">**</span></span>{.inline-bold}.\n</code></pre></div><h3 id="block" tabindex="-1"><a class="header-anchor" href="#block" aria-hidden="true">#</a> Block</h3><p class="block">block content</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>block content {.block}\n</code></pre></div><h3 id="fence" tabindex="-1"><a class="header-anchor" href="#fence" aria-hidden="true">#</a> Fence</h3>',23),x=t(`<div class="language-javascript" data-ext="js"><pre class="fence language-javascript"><code><span class="token keyword">const</span> a <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
</code></pre></div>`,1),q=t(`<div class="language-markdown" data-ext="md"><pre class="language-markdown"><code><span class="token code"><span class="token punctuation">\`\`\`</span><span class="token code-language">js {.fence}</span>
<span class="token code-block language-js"><span class="token keyword">const</span> a <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="token punctuation">\`\`\`</span></span>
</code></pre></div><h3 id="table" tabindex="-1"><a class="header-anchor" href="#table" aria-hidden="true">#</a> Table</h3><table class="table"><thead><tr><th>Table</th></tr></thead><tbody><tr><td>content</td></tr></tbody></table><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>| Table   |
| ------- |
| content |

{.table}
</code></pre></div><h3 id="list" tabindex="-1"><a class="header-anchor" href="#list" aria-hidden="true">#</a> List</h3><ul class="list"><li class="list-item"><p>list item</p><ul class="nested"><li>nested list item</li></ul></li></ul><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code><span class="token list punctuation">-</span> list item{.list-item}

  <span class="token list punctuation">-</span> nested list item
    {.nested}

{.list}
</code></pre></div><h3 id="horizontal" tabindex="-1"><a class="header-anchor" href="#horizontal" aria-hidden="true">#</a> Horizontal</h3><hr class="horizontal"><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>--- {.horizontal}
</code></pre></div><h3 id="softbreak" tabindex="-1"><a class="header-anchor" href="#softbreak" aria-hidden="true">#</a> Softbreak</h3><p class="break">A line with break<br></p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>A line with break  
{.break}
</code></pre></div>`,13);function y(_,A){const o=m("CodeTabs");return r(),u("div",null,[v,s(" more "),h,k(o,{id:"7",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:e(({title:c,value:l,isActive:p})=>[b]),tab1:e(({title:c,value:l,isActive:p})=>[w]),_:1}),f,s(" markdownlint-disable MD033 "),s(" This is because VuePress bug "),x,s(" markdownlint-enable MD033 "),q])}const T=d(g,[["render",y],["__file","attrs.html.vue"]]);export{T as default};
