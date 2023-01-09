import{_ as l,V as u,W as d,a0 as a,Y as r,Z as t,X as n,$ as s,a1 as e,k}from"./framework-065971e3.js";const v={},m=n("p",null,"样式化插件。",-1),g=n("h2",{id:"使用",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#使用","aria-hidden":"true"},"#"),s(" 使用")],-1),b=n("div",{class:"language-typescript line-numbers-mode","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),s(" MarkdownIt "),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"import"),s(),n("span",{class:"token punctuation"},"{"),s(" stylize "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token keyword"},"from"),s(),n("span",{class:"token string"},'"@mdit/plugin-stylize"'),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("stylize"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  config`),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"["),s(`
    `),n("span",{class:"token comment"},"// your options"),s(`
  `),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"Check FAQ for more details._Recommanded_"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),h=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),s(" MarkdownIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token keyword"},"const"),s(),n("span",{class:"token punctuation"},"{"),s(" stylize "),n("span",{class:"token punctuation"},"}"),s(),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-stylize"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

`),n("span",{class:"token keyword"},"const"),s(" mdIt "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),s("stylize"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token punctuation"},"{"),s(`
  `),n("span",{class:"token literal-property property"},"config"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token punctuation"},"["),s(`
    `),n("span",{class:"token comment"},"// your options"),s(`
  `),n("span",{class:"token punctuation"},"]"),n("span",{class:"token punctuation"},","),s(`
`),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"Check FAQ for more details._Recommanded_"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),y=e(`<p><code>stylize</code> 接收一个数组，其中每个元素接受 2 个选项：</p><ul><li><p><code>matcher</code>：应为 <code>string</code> 或 <code>RegExp</code>。</p></li><li><p><code>replacer</code>: 自定义匹配标记的函数</p></li></ul><p>例如，你可以使用以下配置将 <code>*Recommended*</code> 转换为徽章 <code>&lt;Badge type=&quot;tip&quot;&gt;Recommended&lt;/Badge&gt;</code>：</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code>mdIt<span class="token punctuation">.</span><span class="token function">use</span><span class="token punctuation">(</span>stylize<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  config<span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
      matcher<span class="token operator">:</span> <span class="token string">&quot;Recommended&quot;</span><span class="token punctuation">,</span>
      <span class="token function-variable function">replacer</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> tag <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>tag <span class="token operator">===</span> <span class="token string">&quot;em&quot;</span><span class="token punctuation">)</span>
          <span class="token keyword">return</span> <span class="token punctuation">{</span>
            tag<span class="token operator">:</span> <span class="token string">&quot;Badge&quot;</span><span class="token punctuation">,</span>
            attrs<span class="token operator">:</span> <span class="token punctuation">{</span> type<span class="token operator">:</span> <span class="token string">&quot;tip&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
            content<span class="token operator">:</span> <span class="token string">&quot;Recommended&quot;</span><span class="token punctuation">,</span>
          <span class="token punctuation">}</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="highlight-lines"><br><br><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><br><br></div><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4),f=n("p",null,[s("另一个例子是你想要将所有的“不或者没”开头的强调词设置为红色，这样 "),n("code",null,"设置它*没有*任何效果，请*不要*这样使用。"),s("变成：“设置它"),n("span",{style:{color:"red"}},"没有"),s("任何效果，请"),n("span",{style:{color:"red"}},"不要"),s('这样使用。"')],-1),q=e(`<div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code>mdIt<span class="token punctuation">.</span><span class="token function">use</span><span class="token punctuation">(</span>stylize<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  config<span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
      matcher<span class="token operator">:</span> <span class="token regex"><span class="token regex-delimiter">/</span><span class="token regex-source language-regex">^不</span><span class="token regex-delimiter">/</span></span><span class="token punctuation">,</span>
      <span class="token function-variable function">replacer</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> tag<span class="token punctuation">,</span> attrs<span class="token punctuation">,</span> content <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>tag <span class="token operator">===</span> <span class="token string">&quot;em&quot;</span><span class="token punctuation">)</span>
          <span class="token keyword">return</span> <span class="token punctuation">{</span>
            tag<span class="token operator">:</span> <span class="token string">&quot;span&quot;</span><span class="token punctuation">,</span>
            attrs<span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token operator">...</span>attrs<span class="token punctuation">,</span> style<span class="token operator">:</span> <span class="token string">&quot;color: red&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
            content<span class="token punctuation">,</span>
          <span class="token punctuation">}</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="highlight-lines"><br><br><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><br><br></div><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此外，我们提供了一个 <code>localConfigGetter</code> 来接收 env 对象，以防你想在某些情况下应用本地规则。</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code>mdIt<span class="token punctuation">.</span><span class="token function">use</span><span class="token punctuation">(</span>stylize<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token function-variable function">localConfigGetter</span><span class="token operator">:</span> <span class="token punctuation">(</span>env<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> env<span class="token punctuation">.</span>stylize <span class="token operator">||</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

mdIt<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span><span class="token string">&quot;Check FAQ for more details._Recommanded_&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
  stylize<span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
      matcher<span class="token operator">:</span> <span class="token string">&quot;Recommended&quot;</span><span class="token punctuation">,</span>
      <span class="token function-variable function">replacer</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> tag <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>tag <span class="token operator">===</span> <span class="token string">&quot;em&quot;</span><span class="token punctuation">)</span>
          <span class="token keyword">return</span> <span class="token punctuation">{</span>
            tag<span class="token operator">:</span> <span class="token string">&quot;Badge&quot;</span><span class="token punctuation">,</span>
            attrs<span class="token operator">:</span> <span class="token punctuation">{</span> type<span class="token operator">:</span> <span class="token string">&quot;tip&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
            content<span class="token operator">:</span> <span class="token string">&quot;Recommended&quot;</span><span class="token punctuation">,</span>
          <span class="token punctuation">}</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="highlight-lines"><br><div class="highlight-line"> </div><br><br><br><br><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><div class="highlight-line"> </div><br><br></div><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container info"><p class="hint-container-title">性能</p><p>为避免性能影响，除非你需要，否则应尽量避免使用 RegExp 以获得更好的性能。</p><p>并且请尝试使用成本较低的 RegExp 创建片段，例如：以 <code>^</code> 开头或以 <code>$</code> 结尾 RegExp 。</p><p>例如，如果你只想匹配 &quot;SHOULD&quot;、&quot;MUST&quot; 和 &quot;MAY&quot;，你应该写 <code>/^(?:SHOULD|M(?:UST|AY))$/u</code> 而不是 <code>/SHOULD|MUST|MAY/u</code>。第一个将和 1000 个字符的“A loo...oong content”只匹配 2 次，但第二个 RegExp 会匹配近 3000 次。</p></div><h2 id="选项" tabindex="-1"><a class="header-anchor" href="#选项" aria-hidden="true">#</a> 选项</h2><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">interface</span> <span class="token class-name">MarkdownItStylizeResult</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * 渲染的标签名称
   */</span>
  tag<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 属性设置
   */</span>
  attrs<span class="token operator">:</span> Record<span class="token operator">&lt;</span><span class="token builtin">string</span><span class="token punctuation">,</span> <span class="token builtin">string</span><span class="token operator">&gt;</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 标签内容
   */</span>
  content<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">interface</span> <span class="token class-name">MarkdownItStylizeConfig</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * 字符匹配
   */</span>
  matcher<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">|</span> RegExp<span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 内容替换
   */</span>
  <span class="token function-variable function">replacer</span><span class="token operator">:</span> <span class="token punctuation">(</span>options<span class="token operator">:</span> <span class="token punctuation">{</span>
    tag<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
    content<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
    attrs<span class="token operator">:</span> Record<span class="token operator">&lt;</span><span class="token builtin">string</span><span class="token punctuation">,</span> <span class="token builtin">string</span><span class="token operator">&gt;</span><span class="token punctuation">;</span>
    env<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">any</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> MarkdownItStylizeResult <span class="token operator">|</span> <span class="token keyword">void</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">interface</span> <span class="token class-name">MarkdownItStylizeOptions</span> <span class="token punctuation">{</span>
  <span class="token doc-comment comment">/**
   * 格式化配置
   */</span>
  config<span class="token operator">?</span><span class="token operator">:</span> MarkdownItStylizeConfig<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 本地配置获取器
   *
   * <span class="token keyword">@param</span> <span class="token parameter">env</span> Markdown 环境对象
   * <span class="token keyword">@returns</span> 本地格式化配置
   */</span>
  localConfigGetter<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span>env<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">any</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> MarkdownItStylizeConfig<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,6);function w(_,x){const i=k("CodeTabs");return u(),d("div",null,[m,a(" more "),g,r(i,{id:"7",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:t(({title:p,value:o,isActive:c})=>[b]),tab1:t(({title:p,value:o,isActive:c})=>[h]),_:1}),y,a(" markdownlint-disable MD033 "),f,a(" markdownlint-enable MD033 "),q])}const R=l(v,[["render",w],["__file","stylize.html.vue"]]);export{R as default};
