---
title: "与上游对比"
shortTitle: "compare"
icon: code-compare
order: 1
---

本页将仓库中的插件与其参考（或对应的）上游 `markdown-it-*` 包进行对比：渲染输出的正确性、吞吐量与复杂度缩放、以及包体积。所有数据均来自仓库提交的对比运行结果；选择一个包即可查看该包的详细基准测试、复杂度缩放、参考包错误与差异。

<ComparisonReport locale="zh" />

::: tip
对比工具链与 spec 位于 [`compare/`](https://github.com/mdit-plugins/mdit-plugins/tree/main/compare)。运行 `pnpm run compare` 刷新对比数据，`pnpm run compare:sizes` 刷新包体积，`pnpm run compare:docs` 重新生成本页数据。
:::
