import{_ as r,V as u,W as p,X as n,$ as e,Y as i,Z as s,a0 as v,a1 as m,k as a}from"./framework-065971e3.js";const k={},b=n("p",null,"Plugin to align contents.",-1),h={class:"hint-container note"},g=n("p",{class:"hint-container-title"},"Note",-1),w=n("h2",{id:"usage",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#usage","aria-hidden":"true"},"#"),e(" Usage")],-1),y=n("div",{class:"language-typescript line-numbers-mode","data-ext":"ts"},[n("pre",{class:"language-typescript"},[n("code",null,[n("span",{class:"token keyword"},"import"),e(" MarkdownIt "),n("span",{class:"token keyword"},"from"),e(),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},";"),e(`
`),n("span",{class:"token keyword"},"import"),e(),n("span",{class:"token punctuation"},"{"),e(" align "),n("span",{class:"token punctuation"},"}"),e(),n("span",{class:"token keyword"},"from"),e(),n("span",{class:"token string"},'"@mdit/plugin-align"'),n("span",{class:"token punctuation"},";"),e(`

`),n("span",{class:"token keyword"},"const"),e(" mdIt "),n("span",{class:"token operator"},"="),e(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),e("align"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),e(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token template-string"},[n("span",{class:"token template-punctuation string"},"`"),n("span",{class:"token string"},`\\
::: center
Contents to align center
:::
`),n("span",{class:"token template-punctuation string"},"`")]),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),e(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),f=n("div",{class:"language-javascript line-numbers-mode","data-ext":"js"},[n("pre",{class:"language-javascript"},[n("code",null,[n("span",{class:"token keyword"},"const"),e(" MarkdownIt "),n("span",{class:"token operator"},"="),e(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"markdown-it"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),e(`
`),n("span",{class:"token keyword"},"const"),e(),n("span",{class:"token punctuation"},"{"),e(" align "),n("span",{class:"token punctuation"},"}"),e(),n("span",{class:"token operator"},"="),e(),n("span",{class:"token function"},"require"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"@mdit/plugin-align"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),e(`

`),n("span",{class:"token keyword"},"const"),e(" mdIt "),n("span",{class:"token operator"},"="),e(),n("span",{class:"token function"},"MarkdownIt"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"use"),n("span",{class:"token punctuation"},"("),e("align"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),e(`

mdIt`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"render"),n("span",{class:"token punctuation"},"("),n("span",{class:"token template-string"},[n("span",{class:"token template-punctuation string"},"`"),n("span",{class:"token string"},`\\
::: center
Contents to align center
:::
`),n("span",{class:"token template-punctuation string"},"`")]),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),e(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),_=m(`<h2 id="syntax" tabindex="-1"><a class="header-anchor" href="#syntax" aria-hidden="true">#</a> Syntax</h2><div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code>::: left
Contents to align left
:::

::: center
Contents to align center
:::

::: right
Contents to align right
:::

::: justify
Contents to align justify
:::
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">Nesting and escaping</p><ul><li><p>Nestings can be done by increasing marker number of outer container:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>:::: center
Center contents...
::: left
Left contents..
:::
Center contents...
::::
</code></pre></div><p>will be</p><div style="text-align:center;"><p>Center contents...</p><div style="text-align:left;"><p>Left contents..</p></div><p>Center contents...</p></div></li><li><p>Escaping can be done by adding <code>\\</code> to escape the marker:</p><div class="language-markdown" data-ext="md"><pre class="language-markdown"><code>\\::: left

:::
</code></pre></div><p>will be</p><p>::: left</p><p>:::</p></li></ul></div><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo" aria-hidden="true">#</a> Demo</h2><div style="text-align:center;"><h3 id="twinkle-twinkle-little-star" tabindex="-1"><a class="header-anchor" href="#twinkle-twinkle-little-star" aria-hidden="true">#</a> Twinkle, Twinkle, Little Star</h3><div style="text-align:right;"><p>——Jane Taylor</p></div><p>Twinkle, twinkle, little star,</p><p>How I wonder what you are!</p><p>Up above the world so high,</p><p>Like a diamond in the sky.</p><p>When the blazing sun is gone,</p><p>When he nothing shines upon,</p><p>Then you show your little light,</p><p>Twinkle, twinkle, all the night.</p><p>Then the traveller in the dark,</p><p>Thanks you for your tiny spark,</p><p>He could not see which way to go,</p><p>If you did not twinkle so.</p><p>In the dark blue sky you keep,</p><p>And often thro&#39; my curtains peep,</p><p>For you never shut your eye,</p><p>Till the sun is in the sky.</p><p>&#39;Tis your bright and tiny spark,</p><p>Lights the trav’ller in the dark,</p><p>Tho&#39; I know not what you are,</p><p>Twinkle, twinkle, little star.</p></div><details class="hint-container details"><summary>Code</summary><div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code>:::: center

<span class="token title important"><span class="token punctuation">###</span> Twinkle, Twinkle, Little Star</span>

::: right

——Jane Taylor

:::

Twinkle, twinkle, little star,

How I wonder what you are!

Up above the world so high,

Like a diamond in the sky.

When the blazing sun is gone,

When he nothing shines upon,

Then you show your little light,

Twinkle, twinkle, all the night.

Then the traveller in the dark,

Thanks you for your tiny spark,

He could not see which way to go,

If you did not twinkle so.

In the dark blue sky you keep,

And often thro&#39; my curtains peep,

For you never shut your eye,

Till the sun is in the sky.

&#39;Tis your bright and tiny spark,

Lights the trav’ller in the dark,

Tho&#39; I know not what you are,

Twinkle, twinkle, little star.

::::
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details>`,6);function T(x,C){const t=a("RouterLink"),l=a("CodeTabs");return u(),p("div",null,[b,n("div",h,[g,n("p",null,[e("This plugin is based on "),i(t,{to:"/container.html"},{default:s(()=>[e("@mdit/plugin-container")]),_:1}),e(".")])]),v(" more "),w,i(l,{id:"12",data:[{title:"TS"},{title:"JS"}],"tab-id":"language"},{tab0:s(({title:o,value:d,isActive:c})=>[y]),tab1:s(({title:o,value:d,isActive:c})=>[f]),_:1}),_])}const L=r(k,[["render",T],["__file","align.html.vue"]]);export{L as default};
