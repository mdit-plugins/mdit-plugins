# @mdit/plugin-katex-slim

[![Version](https://img.shields.io/npm/v/@mdit/plugin-katex-slim.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-katex-slim.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-katex-slim?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-katex-slim)

katex-slim plugin for MarkdownIt.

`katex` is declared as an optional peer dependency here.

This package can only run in Node.js environment.

## [Docs](https://mdit-plugins.github.io/katex.html) | [文档](https://mdit-plugins.github.io/zh/katex.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-katex-slim katex
# npm
npm i -D @mdit/plugin-katex-slim katex
# yarn
yarn add -D @mdit/plugin-katex-slim katex
```

## Comparison / 对比

Compared against the upstream [`markdown-it-katex`](https://www.npmjs.com/package/markdown-it-katex) package `2.0.3`.

- Correctness: **11/25** cases match the reference exactly (8 matching after normalization, 6 documented differences).
- Throughput: **0.99×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **13.9 kB** unpacked and **673 B** gzip entry, versus **29.9 kB** and **2.0 kB** for the reference.

See the comparison tables in the [English docs](https://mdit-plugins.github.io/katex.html) or [中文文档](https://mdit-plugins.github.io/zh/katex.html) for details and methodology.
