import{_ as a,a as t}from"./github-dark-6c543717.js";import{A as d}from"./AppearanceSwitch-71e0defe.js";import{d as r,V as k,W as m,a0 as g,Y as e,Z as o,M as v,$ as s,X as n,a1 as p,k as h,_ as b}from"./framework-065971e3.js";const y=n("p",null,"Plugins to mark images by ID suffix for theme mode.",-1),f=n("h2",{id:"usage",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#usage","aria-hidden":"true"},"#"),s(" Usage")],-1),_=n("div",{class:"language-typescript","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(" MarkdownIt "),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" imgMark "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"@mdit/plugin-img-mark"'),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("imgMark"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// your options, optional"),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"![image](https://example.com/image.png#light)"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])])],-1),w=n("div",{class:"language-javascript","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),s(" MarkdownIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token punctuation"},"{"),s(" imgMark "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-img-mark"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("imgMark"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token comment"},"// your options, optional"),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"![image](https://example.com/image.png#light)"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])])],-1),x=p(`<h2 id="syntax" tabindex="-1"><a class="header-anchor" href="#syntax" aria-hidden="true">#</a> Syntax</h2><p>GFM supports marking pictures by ID suffix so that pictures are only displayed in a specific mode.</p><p>This plugin allows you to add ID suffix to images links, and automatically add <code>data-mode=&quot;lightmode-only|darkmode-only&quot;</code> to <code>&lt;img&gt;</code> tag based on your settings.</p><div class="hint-container tip"><p class="hint-container-title">Related Styles</p><p>The plugin will not generate styles, because it doesn&#39;t know what the style should be, so you need to add related styles yourself.</p><p>If you are generating the page and controlling darkmode by dom, you should use:</p><div class="language-css line-numbers-mode" data-ext="css"><pre class="language-css"><code><span class="token selector">lightmode-selector</span> <span class="token punctuation">{</span>
  <span class="token selector">img[data-mode=&quot;darkmode-only&quot;]</span> <span class="token punctuation">{</span>
    <span class="token property">display</span><span class="token punctuation">:</span> none <span class="token important">!important</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token selector">darkmode-selector</span> <span class="token punctuation">{</span>
  <span class="token selector">img[data-mode=&quot;lightmode-only&quot;]</span> <span class="token punctuation">{</span>
    <span class="token property">display</span><span class="token punctuation">:</span> none <span class="token important">!important</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>If the page theme mode is based on user preference, you should use:</p><div class="language-css line-numbers-mode" data-ext="css"><pre class="language-css"><code><span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">prefers-color-scheme</span><span class="token punctuation">:</span> light<span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
  <span class="token selector">img[data-mode=&quot;darkmode-only&quot;]</span> <span class="token punctuation">{</span>
    <span class="token property">display</span><span class="token punctuation">:</span> none <span class="token important">!important</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">prefers-color-scheme</span><span class="token punctuation">:</span> dark<span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
  <span class="token selector">img[data-mode=&quot;lightmode-only&quot;]</span> <span class="token punctuation">{</span>
    <span class="token property">display</span><span class="token punctuation">:</span> none <span class="token important">!important</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><h2 id="options" tabindex="-1"><a class="header-anchor" href="#options" aria-hidden="true">#</a> Options</h2><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">interface</span> <span class="token class-name">MarkdownItImgMarkOptions</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * lightmode only ids
   *
   * <span class="token keyword">@default</span> [&quot;gh-light-mode-only&quot;, &quot;light&quot;]
   */</span>
  light<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * darkmode only ids
   *
   * <span class="token keyword">@default</span> [&quot;gh-dark-mode-only&quot;, &quot;dark&quot;]
   */</span>
  dark<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo" aria-hidden="true">#</a> Demo</h2><p><img src="`+a+'" alt="GitHub Light" data-mode="darkmode-only" loading="lazy"><img src="'+t+'" alt="GitHub Dark" data-mode="lightmode-only" loading="lazy"></p><p><img src="'+a+'" alt="GitHub Light" data-mode="darkmode-only" loading="lazy"><img src="'+t+'" alt="GitHub Dark" data-mode="lightmode-only" loading="lazy"></p>',9),q=p(`<div class="language-markdown" data-ext="md"><pre class="language-markdown"><code><span class="token url"><span class="token operator">!</span>[<span class="token content">GitHub Light</span>](<span class="token url">/github-light.png#gh-dark-mode-only</span>)</span>
<span class="token url"><span class="token operator">!</span>[<span class="token content">GitHub Dark</span>](<span class="token url">/github-dark.png#gh-light-mode-only</span>)</span>

<span class="token url"><span class="token operator">!</span>[<span class="token content">GitHub Light</span>](<span class="token url">/github-light.png#dark</span>)</span>
<span class="token url"><span class="token operator">!</span>[<span class="token content">GitHub Dark</span>](<span class="token url">/github-dark.png#light</span>)</span>
</code></pre></div>`,1),I=r({__name:"img-mark.html",setup(M){return(G,D)=>{const i=h("CodeTabs");return k(),m("div",null,[y,g(" more "),f,e(i,{id:"7",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:o(({title:c,value:l,isActive:u})=>[_]),tab1:o(({title:c,value:l,isActive:u})=>[w]),_:1}),x,e(v(d)),s(" (Try to toggle theme mode)"),q])}}}),S=b(I,[["__file","img-mark.html.vue"]]);export{S as default};
