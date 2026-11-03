# @mdit/plugin-katex

[![Version](https://img.shields.io/npm/v/@mdit/plugin-katex.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-katex.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-katex?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-katex)

Katex plugin for MarkdownIt.

## [Docs](https://mdit-plugins.github.io/katex.html) | [文档](https://mdit-plugins.github.io/zh/katex.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-katex
# npm
npm i -D @mdit/plugin-katex
# yarn
yarn add -D @mdit/plugin-katex
```

## Comparison / 对比

Compared against the upstream [`markdown-it-katex`](https://www.npmjs.com/package/markdown-it-katex) package `2.0.3`.

- Correctness: **11/25** cases match the reference exactly (6 matching after normalization, 8 documented differences).
- Throughput: **0.96×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **37.2 kB** unpacked and **605 B** gzip entry, versus **29.9 kB** and **2.0 kB** for the reference.

See the full comparison report: [English](https://mdit-plugins.github.io/compare.html) · [中文](https://mdit-plugins.github.io/zh/compare.html).
