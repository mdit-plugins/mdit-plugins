# @mdit/plugin-mathjax-slim

[![Version](https://img.shields.io/npm/v/@mdit/plugin-mathjax-slim.svg?style=flat-square&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@mdit/plugin-mathjax-slim.svg?style=flat-square&logo=npm) ![Size](https://img.shields.io/bundlephobia/min/@mdit/plugin-mathjax-slim?style=flat-square&logo=npm)](https://www.npmjs.com/package/@mdit/plugin-mathjax-slim)

Mathjax plugin for MarkdownIt.

`@mathjax/src` is declared as an optional peer dependency here.

The synchronous main entry requires Node.js (`worker_threads`). In browsers or runtimes without worker threads, use `@mdit/plugin-mathjax-slim/async` instead.

## [Docs](https://mdit-plugins.github.io/mathjax.html) | [文档](https://mdit-plugins.github.io/zh/mathjax.html)

## Install / 安装

```bash
# pnpm
pnpm add -D @mdit/plugin-mathjax-slim @mathjax/src
# npm
npm i -D @mdit/plugin-mathjax-slim @mathjax/src
# yarn
yarn add -D @mdit/plugin-mathjax-slim @mathjax/src
```

## Comparison / 对比

Compared against the upstream [`markdown-it-mathjax3`](https://www.npmjs.com/package/markdown-it-mathjax3) package `5.2.0`.

- Correctness: **8/25** cases match the reference exactly (11 matching after normalization, 6 documented differences).
- Throughput: **1.13×** the reference (geometric mean across 6 benchmark cases; above 1× means faster).
- Package size: **125.1 kB** unpacked and **1.7 kB** gzip entry, versus **14.6 kB** and **1.7 kB** for the reference.

See the comparison tables in the [English docs](https://mdit-plugins.github.io/mathjax.html) or [中文文档](https://mdit-plugins.github.io/zh/mathjax.html) for details and methodology.
