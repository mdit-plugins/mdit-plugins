import{_ as c,V as o,W as p,a0 as d,Y as u,Z as a,X as s,$ as n,a1 as r,k}from"./framework-065971e3.js";const m={},v=s("p",null,"Plugins to support tasklist.",-1),b=s("h2",{id:"usage",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#usage","aria-hidden":"true"},"#"),n(" Usage")],-1),h=s("div",{class:"language-typescript line-numbers-mode","data-ext":"ts"},[s("pre",{class:"language-typescript"},[s("code",null,[s("span",{class:"token keyword"},"import"),n(" MarkdownIt "),s("span",{class:"token keyword"},"from"),n(),s("span",{class:"token string"},'"markdown-it"'),s("span",{class:"token punctuation"},";"),n(`
`),s("span",{class:"token keyword"},"import"),n(),s("span",{class:"token punctuation"},"{"),n(" tasklist "),s("span",{class:"token punctuation"},"}"),n(),s("span",{class:"token keyword"},"from"),n(),s("span",{class:"token string"},'"@mdit/plugin-tasklist"'),s("span",{class:"token punctuation"},";"),n(`

`),s("span",{class:"token keyword"},"const"),n(" mdIt "),s("span",{class:"token operator"},"="),n(),s("span",{class:"token function"},"MarkdownIt"),s("span",{class:"token punctuation"},"("),s("span",{class:"token punctuation"},")"),s("span",{class:"token punctuation"},"."),s("span",{class:"token function"},"use"),s("span",{class:"token punctuation"},"("),n("tasklist"),s("span",{class:"token punctuation"},","),n(),s("span",{class:"token punctuation"},"{"),n(`
  `),s("span",{class:"token comment"},"// your options, optional"),n(`
`),s("span",{class:"token punctuation"},"}"),s("span",{class:"token punctuation"},")"),s("span",{class:"token punctuation"},";"),n(`

mdIt`),s("span",{class:"token punctuation"},"."),s("span",{class:"token function"},"render"),s("span",{class:"token punctuation"},"("),s("span",{class:"token template-string"},[s("span",{class:"token template-punctuation string"},"`"),s("span",{class:"token string"},`\\
- [x] task 1
- [ ] task 2
`),s("span",{class:"token template-punctuation string"},"`")]),s("span",{class:"token punctuation"},")"),s("span",{class:"token punctuation"},";"),n(`
`)])]),s("div",{class:"line-numbers","aria-hidden":"true"},[s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"})])],-1),g=s("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[s("pre",{class:"language-javascript"},[s("code",null,[s("span",{class:"token keyword"},"const"),n(" MarkdownIt "),s("span",{class:"token operator"},"="),n(),s("span",{class:"token function"},"require"),s("span",{class:"token punctuation"},"("),s("span",{class:"token string"},'"markdown-it"'),s("span",{class:"token punctuation"},")"),s("span",{class:"token punctuation"},";"),n(`
`),s("span",{class:"token keyword"},"const"),n(),s("span",{class:"token punctuation"},"{"),n(" tasklist "),s("span",{class:"token punctuation"},"}"),n(),s("span",{class:"token operator"},"="),n(),s("span",{class:"token function"},"require"),s("span",{class:"token punctuation"},"("),s("span",{class:"token string"},'"@mdit/plugin-tasklist"'),s("span",{class:"token punctuation"},")"),s("span",{class:"token punctuation"},";"),n(`

`),s("span",{class:"token keyword"},"const"),n(" mdIt "),s("span",{class:"token operator"},"="),n(),s("span",{class:"token function"},"MarkdownIt"),s("span",{class:"token punctuation"},"("),s("span",{class:"token punctuation"},")"),s("span",{class:"token punctuation"},"."),s("span",{class:"token function"},"use"),s("span",{class:"token punctuation"},"("),n("tasklist"),s("span",{class:"token punctuation"},","),n(),s("span",{class:"token punctuation"},"{"),n(`
  `),s("span",{class:"token comment"},"// your options, optional"),n(`
`),s("span",{class:"token punctuation"},"}"),s("span",{class:"token punctuation"},")"),s("span",{class:"token punctuation"},";"),n(`

mdIt`),s("span",{class:"token punctuation"},"."),s("span",{class:"token function"},"render"),s("span",{class:"token punctuation"},"("),s("span",{class:"token template-string"},[s("span",{class:"token template-punctuation string"},"`"),s("span",{class:"token string"},`\\
- [x] task 1
- [ ] task 2
`),s("span",{class:"token template-punctuation string"},"`")]),s("span",{class:"token punctuation"},")"),s("span",{class:"token punctuation"},";"),n(`
`)])]),s("div",{class:"line-numbers","aria-hidden":"true"},[s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"})])],-1),f=r(`<h2 id="syntax" tabindex="-1"><a class="header-anchor" href="#syntax" aria-hidden="true">#</a> Syntax</h2><ul><li>Use <code>- [ ] some text</code> to render a unchecked task item.</li><li>Use <code>- [x] some text</code> to render a checked task item. (Capital <code>X</code> is also supported)</li></ul><h2 id="options" tabindex="-1"><a class="header-anchor" href="#options" aria-hidden="true">#</a> Options</h2><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">interface</span> <span class="token class-name">MarkdownItTasklistOptions</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * Whether disable checkbox
   *
   * <span class="token keyword">@default</span> true
   */</span>
  disabled<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Whether use \`&lt;label&gt;\` to wrap text
   *
   * <span class="token keyword">@default</span> true
   */</span>
  label<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Class for tasklist container
   *
   * <span class="token keyword">@default</span> &#39;task-list-container&#39;
   */</span>
  containerClass<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Class for tasklist item
   *
   * <span class="token keyword">@default</span> &#39;task-list-item&#39;
   */</span>
  itemClass<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Class for tasklist item label
   *
   * <span class="token keyword">@default</span> &#39;task-list-item-label&#39;
   */</span>
  labelClass<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * Class for tasklist item checkbox
   *
   * <span class="token keyword">@default</span> &#39;task-list-item-checkbox&#39;
   */</span>
  checkboxClass<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo" aria-hidden="true">#</a> Demo</h2><ul class="task-list-container"><li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" id="task-item-0" disabled="disabled"><label class="task-list-item-label" for="task-item-0"> Plan A</label></li><li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" id="task-item-1" checked="checked" disabled="disabled"><label class="task-list-item-label" for="task-item-1"> Plan B</label></li></ul><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code><span class="token list punctuation">-</span> [ ] Plan A
<span class="token list punctuation">-</span> [x] Plan B
</code></pre></div>`,7);function x(w,y){const e=k("CodeTabs");return o(),p("div",null,[v,d(" more "),b,u(e,{id:"7",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:a(({title:t,value:i,isActive:l})=>[h]),tab1:a(({title:t,value:i,isActive:l})=>[g]),_:1}),f])}const C=c(m,[["render",x],["__file","tasklist.html.vue"]]);export{C as default};
