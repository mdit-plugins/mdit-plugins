import{_ as s,a as t}from"./github-dark-6c543717.js";import{A as r}from"./AppearanceSwitch-71e0defe.js";import{d as u,V as m,W as k,a0 as v,Y as e,Z as o,M as g,$ as a,X as n,a1 as i,k as h,_ as b}from"./framework-065971e3.js";const y=n("p",null,"为主题模式通过 ID 后缀标记图像的插件。",-1),_=n("h2",{id:"使用",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#使用","aria-hidden":"true"},"#"),a(" 使用")],-1),f=n("div",{class:"language-typescript","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),a(" MarkdownIt "),n("span",{class:"token keyword"},"from"),a(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),a(`
`),n("span",{class:"token keyword"},"import"),a(),n("span",{class:"token punctuation"},"{"),a(" imgMark "),n("span",{class:"token punctuation"},"}"),a(),n("span",{class:"token keyword"},"from"),a(),n("span",{class:"token string"},'"@mdit/plugin-img-mark"'),n("span",{class:"token punctuation"},";"),a(`

`),n("span",{class:"token keyword"},"const"),a(" mdIt "),n("span",{class:"token operator"},"="),a(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),a("imgMark"),n("span",{class:"token punctuation"},","),a(),n("span",{class:"token punctuation"},"{"),a(`
  `),n("span",{class:"token comment"},"// 你的选项，可选的"),a(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"![image](https://example.com/image.png#light)"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`
`)])])],-1),w=n("div",{class:"language-javascript","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),a(" MarkdownIt "),n("span",{class:"token operator"},"="),a(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`
`),n("span",{class:"token keyword"},"const"),a(),n("span",{class:"token punctuation"},"{"),a(" imgMark "),n("span",{class:"token punctuation"},"}"),a(),n("span",{class:"token operator"},"="),a(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-img-mark"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`

`),n("span",{class:"token keyword"},"const"),a(" mdIt "),n("span",{class:"token operator"},"="),a(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),a("imgMark"),n("span",{class:"token punctuation"},","),a(),n("span",{class:"token punctuation"},"{"),a(`
  `),n("span",{class:"token comment"},"// 你的选项，可选的"),a(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"![image](https://example.com/image.png#light)"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),a(`
`)])])],-1),q=i(`<h2 id="语法" tabindex="-1"><a class="header-anchor" href="#语法" aria-hidden="true">#</a> 语法</h2><p>GFM 支持通过 ID 后缀标记图片，使图片仅在特定模式下显示。</p><p>此插件允许你为图像链接添加 ID 后缀，并根据你的设置自动将 <code>data-mode=&quot;lightmode-only|darkmode-only&quot;</code> 添加到 <code>&lt;img&gt;</code> 标签。</p><div class="hint-container tip"><p class="hint-container-title">相关样式</p><p>插件不会生成样式，因为它不知道样式应该是什么，所以你需要自己添加相关样式。</p><p>如果你正在生成页面并通过 DOM 控制暗黑模式，你应该使用:</p><div class="language-CSS line-numbers-mode" data-ext="CSS"><pre class="language-CSS"><code>lightmode-selector {
  img[data-mode=&quot;darkmode-only&quot;] {
    display: none !important;
  }
}

darkmode-selector {
  img[data-mode=&quot;lightmode-only&quot;] {
    display: none !important;
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果页面主题模式是基于用户偏好的，你应该使用:</p><div class="language-CSS line-numbers-mode" data-ext="CSS"><pre class="language-CSS"><code>@media (prefers-color-scheme: light) {
  img[data-mode=&quot;darkmode-only&quot;] {
    display: none !important;
  }
}

@media (prefers-color-scheme: dark) {
  img[data-mode=&quot;lightmode-only&quot;] {
    display: none !important;
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><h2 id="选项" tabindex="-1"><a class="header-anchor" href="#选项" aria-hidden="true">#</a> 选项</h2><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">interface</span> <span class="token class-name">MarkdownItImgMarkOptions</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * 日间模式 ID
   *
   * <span class="token keyword">@default</span> [&quot;gh-light-mode-only&quot;, &quot;light&quot;]
   */</span>
  light<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 夜间模式 ID
   *
   * <span class="token keyword">@default</span> [&quot;gh-dark-mode-only&quot;, &quot;dark&quot;]
   */</span>
  dark<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="示例" tabindex="-1"><a class="header-anchor" href="#示例" aria-hidden="true">#</a> 示例</h2><p><img src="`+s+'" alt="GitHub Light" data-mode="darkmode-only" loading="lazy"><img src="'+t+'" alt="GitHub Dark" data-mode="lightmode-only" loading="lazy"></p><p><img src="'+s+'" alt="GitHub Light" data-mode="darkmode-only" loading="lazy"><img src="'+t+'" alt="GitHub Dark" data-mode="lightmode-only" loading="lazy"></p>',9),x=i(`<div class="language-markdown" data-ext="md"><pre class="language-markdown"><code><span class="token url"><span class="token operator">!</span>[<span class="token content">GitHub Light</span>](<span class="token url">/github-light.png#gh-dark-mode-only</span>)</span>
<span class="token url"><span class="token operator">!</span>[<span class="token content">GitHub Dark</span>](<span class="token url">/github-dark.png#gh-light-mode-only</span>)</span>

<span class="token url"><span class="token operator">!</span>[<span class="token content">GitHub Light</span>](<span class="token url">/github-light.png#dark</span>)</span>
<span class="token url"><span class="token operator">!</span>[<span class="token content">GitHub Dark</span>](<span class="token url">/github-dark.png#light</span>)</span>
</code></pre></div>`,1),S=u({__name:"img-mark.html",setup(I){return(M,C)=>{const l=h("CodeTabs");return m(),k("div",null,[y,v(" more "),_,e(l,{id:"7",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:o(({title:c,value:p,isActive:d})=>[f]),tab1:o(({title:c,value:p,isActive:d})=>[w]),_:1}),q,e(g(r)),a(" (尝试切换主题模式)"),x])}}}),V=b(S,[["__file","img-mark.html.vue"]]);export{V as default};
